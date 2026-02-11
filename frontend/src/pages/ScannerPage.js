// src/pages/ScannerPage.js
import React, { useEffect, useRef, useState } from "react";
import Quagga from "@ericblade/quagga2";
import { createWorker } from "tesseract.js";
/**
 * ScannerPage (Hybrid mode: auto + manual capture)
 *
 * Props:
 * - onBack()
 * - onSave(payload)
 *
 * Notes:
 * - Auto barcode detection (native BarcodeDetector or Quagga fallback)
 * - Auto OCR scans multiple zones (top/mid/bottom) while camera active
 * - Manual "Capture Expiry Text" button captures a still frame and runs OCR (recommended on grainy cameras)
 * - Subtle overlay shows the zones being scanned (thin, low-opacity lines)
 */
// ⬇️ ADD THIS ABOVE export default ...
function enhanceCanvasFromVideo(video, crop) {
    const scale = 2.0;
    const canvas = document.createElement("canvas");

    canvas.width = Math.floor(crop.w * scale);
    canvas.height = Math.floor(crop.h * scale);
    const ctx = canvas.getContext("2d");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
        video,
        crop.sx,
        crop.sy,
        crop.w,
        crop.h,
        0,
        0,
        canvas.width,
        canvas.height
    );

    // grayscale + contrast
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = img.data;

    const contrast = (v, f = 1.5) => (Math.max(0, Math.min(255, (v - 128) * f + 128)));

    for (let i = 0; i < d.length; i += 4) {
        const g = (d[i] + d[i + 1] + d[i + 2]) / 3;
        const c = contrast(g, 1.6);
        d[i] = d[i + 1] = d[i + 2] = c;
    }
    ctx.putImageData(img, 0, 0);

    return canvas;
}

export default function ScannerPage({ onBack, onSave }) {
    // refs
    const videoRef = useRef(null);
    const overlayRef = useRef(null);
    const workerRef = useRef(null);
    const capturedCanvasRef = useRef(null);

    // state
    const [streamActive, setStreamActive] = useState(false);
    const [workerReady, setWorkerReady] = useState(false);
    const [barcode, setBarcode] = useState(null);
    const [productName, setProductName] = useState("");
    const [ocrText, setOcrText] = useState("");
    const [expiry, setExpiry] = useState("");
    const [ocrBusy, setOcrBusy] = useState(false);
    const [autoStopped, setAutoStopped] = useState(false); // stops auto OCR after expiry found (can still manual capture)
    const lastOcrAt = useRef(0);

    const OCR_INTERVAL = 1200; // throttle for auto OCR (ms)

    // ---------- helper: parse expiry ----------
    function parseExpiryFromText(txt) {
        if (!txt) return null;

        // clean text, remove labels
        const s = txt
            .replace(/pkd|mfg|exp|use by|best before|bb|packed on/gi, " ")
            .replace(/\s+/g, " ")
            .trim();

        // Match ALL dates in the text (dd/mm/yy, dd/mm/yyyy, dd-mm-yy, dd.mm.yy)
        const regex = /\b(0?[1-9]|[12][0-9]|3[01])[\/\-.](0?[1-9]|1[0-2])[\/\-.](\d{2,4})\b/g;
        const matches = [...s.matchAll(regex)];

        if (matches.length === 0) return null;

        // Convert matches → proper YYYY-MM-DD values
        const parsedDates = matches.map(m => {
            let [day, month, year] = m[0].split(/\/|-|\./);

            // convert yy → yyyy
            if (year.length === 2) {
                const yy = parseInt(year);
                year = yy < 50 ? 2000 + yy : 1900 + yy;
            }

            // final formatted date
            const iso = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
            return { iso, dateObj: new Date(iso) };
        });

        // Choose the LATEST DATE → the real expiry
        parsedDates.sort((a, b) => b.dateObj - a.dateObj);

        return parsedDates[0].iso;
    }




    // ---------- init tesseract worker (no logger) ----------
    useEffect(() => {
        let mounted = true;
        (async () => {
            const worker = createWorker(); // no logger function — avoids DataCloneError
            workerRef.current = worker;
            try {
                await worker.load();
                await worker.loadLanguage("eng");
                await worker.initialize("eng");
                if (mounted) setWorkerReady(true);
            } catch (err) {
                console.error("Tesseract init error", err);
            }
        })();

        return () => {
            mounted = false;
            (async () => {
                if (workerRef.current) {
                    try {
                        await workerRef.current.terminate();
                    } catch (e) { }
                }
            })();
        };
    }, []);

    // ---------- camera + barcode detection ----------
    useEffect(() => {
        let active = true;
        let localStream = null;
        let barcodeDetector = null;

        const startCameraAndDetectors = async () => {
            try {    
                const constraints = {
                    video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
                    audio: false,
                };
                localStream = await navigator.mediaDevices.getUserMedia(constraints);
                if (!active) return;
                if (videoRef.current) {
                    videoRef.current.srcObject = localStream;
                    try {
                        await videoRef.current.play();
                    } catch (e) { }
                    setStreamActive(true);
                }

                if (window.BarcodeDetector) {
                    try {
                        barcodeDetector = new window.BarcodeDetector({
                            formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "qr_code"],
                        });

                        const detectLoop = async () => {
                            if (!active) return;
                            try {
                                const results = await barcodeDetector.detect(videoRef.current);
                                if (results && results.length) {
                                    const bc = results[0].rawValue;
                                    setBarcode((prev) => {
                                        if (prev !== bc) {
                                            setOcrText("");
                                            setExpiry("");
                                            setProductName("");
                                            setAutoStopped(false); // resume auto OCR on new item
                                        }
                                        return bc;
                                    });
                                }
                            } catch (err) {
                                // fallback if detection throws
                                // console.warn("BarcodeDetector error:", err);
                                if (active) initQuaggaLive();
                            }
                            requestAnimationFrame(detectLoop);
                        };
                        detectLoop();
                    } catch (err) {
                        // if BarcodeDetector constructor fails, use Quagga
                        initQuaggaLive();
                    }
                } else {
                    initQuaggaLive();
                }
            } catch (err) {
                console.error("getUserMedia error", err);
                alert("Camera permission denied or not available. Allow camera access and retry.");
            }
        };

        const initQuaggaLive = () => {
            try {
                Quagga.stop();
            } catch (e) { }
            try {
                Quagga.init(
                    {
                        inputStream: {
                            name: "Live",
                            type: "LiveStream",
                            target: videoRef.current, // attach to video element container
                            constraints: {
                                facingMode: "environment",
                                width: 1280,
                                height: 720,
                            },
                        },
                        locator: { patchSize: "medium", halfSample: true },
                        decoder: {
                            readers: ["ean_reader", "ean_8_reader", "code_128_reader", "upc_reader", "upc_e_reader"],
                        },
                        locate: true,
                    },
                    (err) => {
                        if (err) {
                            console.error("Quagga init error", err);
                            return;
                        }
                        Quagga.start();
                        Quagga.onDetected((res) => {
                            try {
                                const code = res?.codeResult?.code;
                                if (code) {
                                    setBarcode((prev) => {
                                        if (prev !== code) {
                                            setOcrText("");
                                            setExpiry("");
                                            setProductName("");
                                            setAutoStopped(false); // resume auto OCR on new item
                                        }
                                        return code;
                                    });
                                }
                            } catch (e) { }
                        });
                    }
                );
            } catch (e) {
                console.error("Quagga error", e);
            }
        };

        startCameraAndDetectors();

        return () => {
            active = false;
            try {
                if (localStream) localStream.getTracks().forEach((t) => t.stop());
            } catch (e) { }
            try {
                Quagga.stop();
            } catch (e) { }
            setStreamActive(false);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---------- auto OCR (multi-zone) ----------
    // OPTIONAL: simple preprocessing (grayscale + contrast increase)
    const runOcrIfNeeded = async () => {
        if (!workerRef.current || ocrBusy) return;

        const now = Date.now();
        if (now - lastOcrAt.current < OCR_INTERVAL) return;
        lastOcrAt.current = now;

        const video = videoRef.current;
        if (!video || !video.videoWidth || !video.videoHeight) return;

        setOcrBusy(true);

        try {
            const w = video.videoWidth;
            const h = video.videoHeight;

            // BIGGER better OCR crop — bottom 50% of camera frame
            const cropW = w;
            const cropH = Math.floor(h * 0.50);
            const sx = 0;
            const sy = Math.floor(h * 0.45);

            const canvas = document.createElement("canvas");
            canvas.width = cropW;
            canvas.height = cropH;
            const ctx = canvas.getContext("2d");

            ctx.drawImage(video, sx, sy, cropW, cropH, 0, 0, cropW, cropH);

            // RUN OCR
            const { data } = await workerRef.current.recognize(canvas);
            const text = (data.text || "").replace(/\n/g, " ").trim();

            if (text.length > 0) {
                setOcrText(text);

                const expiryFound = parseExpiryFromText(text);
                if (expiryFound) setExpiry(expiryFound);
            }

        } catch (err) {
            console.error("OCR error:", err);
        } finally {
            setOcrBusy(false);
        }
    };


    // auto OCR loop (requestAnimationFrame)
    useEffect(() => {
        let raf;
        const loop = () => {
            if (streamActive && workerReady && !autoStopped) {
                runOcrIfNeeded();
            }
            raf = requestAnimationFrame(loop);
        };
        loop();
        return () => cancelAnimationFrame(raf);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [streamActive, workerReady, autoStopped]);

    // ---------- product lookup mock (replace with backend later) ----------
    useEffect(() => {
        let mounted = true;
        const lookupMock = async (code) => {
            const mockDB = {
                "8906001234567": { name: "Amul Milk 1L", price: "₹52", img: "" },
                "123456789012": { name: "Sample Item", price: "₹120", img: "" },
            };
            return mockDB[code] || null;
        };

        (async () => {
            if (!barcode) return;
            await new Promise((r) => setTimeout(r, 200));
            if (!mounted) return;
            try {
                const info = await lookupMock(barcode);
                if (info) {
                    setProductName(info.name || "");
                } else {
                    setProductName(`Barcode: ${barcode}`);
                }
            } catch (e) {
                setProductName(`Barcode: ${barcode}`);
            }
        })();

        return () => { mounted = false; };
    }, [barcode]);

    // ---------- manual capture handler ----------
    const handleCapture = async () => {
        const video = videoRef.current;
        const canvas = capturedCanvasRef.current;
        if (!video || !canvas || !workerRef.current) return;

        try {
            const ctx = canvas.getContext("2d");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // optional preprocessing on capture (same simple approach)
            try {
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const d = imgData.data;
                for (let i = 0; i < d.length; i += 4) {
                    const avg = (d[i] + d[i + 1] + d[i + 2]) / 3;
                    const boosted = avg > 140 ? 255 : avg < 60 ? 20 : avg * 1.05;
                    d[i] = d[i + 1] = d[i + 2] = boosted;
                }
                ctx.putImageData(imgData, 0, 0);
            } catch (e) {
                // ignore preprocessing errors
            }

            setOcrBusy(true);
            const { data } = await workerRef.current.recognize(canvas);
            const text = (data && data.text) ? data.text.replace(/\n/g, " ").trim() : "";
            setOcrText(text);
            const parsed = parseExpiryFromText(text);
            if (parsed) {
                setExpiry(parsed);
                setAutoStopped(true); // stop auto scanning because we found expiry
            } else {
                // keep auto scanning enabled so user can try moving packet; do not force stop
                setExpiry("");
            }
        } catch (err) {
            console.error("Manual capture OCR error", err);
        } finally {
            setOcrBusy(false);
        }
    };
    // ⬇️ INSERT THIS BELOW handleSave()
    const captureAndOcr = async () => {
        const video = videoRef.current;
        if (!video) return;

        const crop = {
            sx: 0,
            sy: Math.floor(video.videoHeight * 0.45),
            w: video.videoWidth,
            h: Math.floor(video.videoHeight * 0.5)
        };

        const canvas = enhanceCanvasFromVideo(video, crop);

        setOcrBusy(true);
        try {
            await workerRef.current.setParameters({
                tessedit_char_whitelist: "0123456789/.-",
                preserve_interword_spaces: "1",
            });

            const { data } = await workerRef.current.recognize(canvas);
            const text = (data?.text || "").replace(/\n/g, " ").trim();
            setOcrText(text);

            const parsed = parseExpiryFromText(text);
            if (parsed) setExpiry(parsed);
            else setExpiry("");

        } catch (err) {
            console.error("OCR ERROR →", err);
        }
        setOcrBusy(false);
    };

    // ---------- save action ----------
    const handleSave = async () => {
        const payload = {
            barcode: barcode || null,
            ocrText: ocrText || null,
            expiry: expiry || null,
            productName: productName || null,
            savedAt: new Date().toISOString(),
        };

        try {
            if (onSave) {
                await onSave(payload);
            } else {
                console.log("Scan saved (no onSave provided):", payload);
                alert("Saved locally. Check console.");
            }
        } catch (err) {
            console.error("Save error", err);
            alert("Save failed. See console.");
        }
    };

    // ---------- UI ----------
    return (
        <div className="flex bg-slate-50 min-h-screen">
            {/* Sidebar */}

            {/* Main */}
            <div className="flex-1 flex flex-col">

                <div className="flex justify-center items-center w-full flex-1 p-6">
                    {/* hidden canvas for manual capture OCR */}
                    <canvas ref={capturedCanvasRef} className="hidden"></canvas>

                    <div className="w-full max-w-7xl grid grid-cols-5 gap-8">
                        {/* Left: Camera (bigger) */}
                        <div className="col-span-3 bg-[#b7dcd3] rounded-3xl p-6 mx-auto w-full shadow-lg relative flex flex-col items-center border border-white/50">
                            {/* Back */}
                            <button
                                onClick={onBack}
                                className="absolute top-4 left-4 p-2 bg-white/80 rounded-full shadow hover:scale-105 transition"
                            >
                                ←
                            </button>

                            {/* Camera area */}
                            <div className="w-full h-[440px] rounded-2xl overflow-hidden relative bg-black border border-white/40 mt-8">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                                {/* subtle overlay canvas (zones) */}
                                <canvas ref={overlayRef} className="absolute left-0 top-0 w-full h-full pointer-events-none" />

                                {/* scan frame */}
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                    <div className="border-4 border-white/40 w-72 h-52 rounded-xl"></div>
                                </div>

                                {/* pills overlay */}
                                <div className="absolute bottom-4 left-4 flex gap-2 z-30">
                                    <div className="px-3 py-1 rounded-lg bg-white/80 text-black text-xs font-medium shadow">
                                        {barcode ? barcode : "Barcode not found"}
                                    </div>

                                    <div className="px-3 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-medium shadow">
                                        {expiry ? `EXP: ${expiry}` : "Expiry not found"}
                                    </div>
                                </div>
                            </div>

                            {/* Info card */}
                            <div className="mt-5 w-full bg-white rounded-2xl p-6 shadow flex items-center gap-4 min-h-[90px]">
                                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">📷</div>
                                <div>
                                    <p className="font-medium text-gray-800">Live Scanner</p>
                                    <p className="text-sm text-gray-400">Point camera at barcode + expiry text</p>
                                </div>
                            </div>

                            {/* Capture button */}
                            <button
                                onClick={captureAndOcr}
                                className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition"
                            >
                                Capture Expiry Text
                            </button>

                        </div>

                        {/* Right: Result panel */}
                        <div className="col-span-2 bg-white rounded-3xl shadow-lg p-8 flex flex-col">
                            <div className="bg-[#b7dcd3] rounded-2xl h-56 flex items-center justify-center mb-6">
                                <div className="text-white opacity-70">Product Image</div>
                            </div>

                            <h2 className="text-2xl font-semibold text-gray-800">{productName || "No product detected"}</h2>

                            {/* pills */}
                            <div className="flex gap-3 mt-4">
                                <div className="px-3 py-1 rounded-lg bg-gray-100 text-gray-800 text-xs font-semibold shadow">
                                    {barcode ? barcode : "Barcode not found"}
                                </div>

                                <div
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold shadow ${expiry ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {expiry ? `EXP: ${expiry}` : "Expiry not found"}
                                </div>
                            </div>

                            <div className="mt-4 text-sm text-gray-600 leading-relaxed">
                                {ocrText ? (
                                    <>
                                        <div className="font-medium text-gray-700 mb-1">Extracted Text</div>
                                        <div className="text-xs text-gray-500 break-words">{ocrText}</div>
                                    </>
                                ) : (
                                    <div className="text-gray-500">OCR will detect printed expiry dates. Use Capture if auto fails.</div>
                                )}
                            </div>

                            <div className="mt-auto flex gap-4 pt-6">
                                <button onClick={handleSave} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition">
                                    Add to Inventory
                                </button>

                                <button
                                    onClick={() => {
                                        setBarcode(null);
                                        setOcrText("");
                                        setExpiry("");
                                        setProductName("");
                                        setAutoStopped(false);
                                    }}
                                    className="bg-gray-200 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-300 transition"
                                >
                                    Reset
                                </button>
                            </div>

                            <div className="mt-4 text-xs text-gray-400">Tip: Hold steady & ensure expiry text is clear. Capture for better accuracy.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
