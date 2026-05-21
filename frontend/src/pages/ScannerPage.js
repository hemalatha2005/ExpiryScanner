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
    const [productDetails, setProductDetails] = useState(null);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupError, setLookupError] = useState("");
    const [ocrText, setOcrText] = useState("");
    const [expiry, setExpiry] = useState("");
    const [ocrBusy, setOcrBusy] = useState(false);
    const [saveBusy, setSaveBusy] = useState(false);
    const [saveStatus, setSaveStatus] = useState("");
    const [autoStopped, setAutoStopped] = useState(false); // stops auto OCR after expiry found (can still manual capture)
    const lastOcrAt = useRef(0);
    const lastBarcodeScanAt = useRef(0);
    const barcodeScanBusyRef = useRef(false);
    const lastAutoSavedKeyRef = useRef("");
    const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const token = localStorage.getItem("token") || "";

    const OCR_INTERVAL = 1200; // throttle for auto OCR (ms)
    const BARCODE_SCAN_INTERVAL = 350; // throttle for fallback frame decode (ms)
    const hasProductDetails = Boolean(productDetails?.found);

    const displayList = (items) => {
        if (!Array.isArray(items) || items.length === 0) return "Not listed";
        return items.join(", ");
    };

    const resetScanDetails = () => {
        setBarcode(null);
        setOcrText("");
        setExpiry("");
        setProductName("");
        setProductDetails(null);
        setLookupError("");
        setSaveStatus("");
        lastAutoSavedKeyRef.current = "";
        setAutoStopped(false);
    };

    const applyManualBarcode = (value) => {
        const nextCode = value.replace(/\D/g, "").slice(0, 14);
        setBarcode((prev) => {
            if (prev !== nextCode) {
                setProductName("");
                setProductDetails(null);
                setLookupError("");
                setSaveStatus("");
                lastAutoSavedKeyRef.current = "";
                if (nextCode && expiry) {
                    lastAutoSavedKeyRef.current = `${nextCode}:${expiry}`;
                }
            }
            return nextCode || null;
        });
    };

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
        let nativeDetectorFailed = false;

        const setDetectedBarcode = (nextCode) => {
            if (!nextCode) return;
            setBarcode((prev) => {
                if (prev !== nextCode) {
                    setOcrText("");
                    setExpiry("");
                    setProductName("");
                    setProductDetails(null);
                    setLookupError("");
                    setSaveStatus("");
                    lastAutoSavedKeyRef.current = "";
                    setAutoStopped(false); // resume auto OCR on new item
                }
                return nextCode;
            });
        };

        const detectWithQuaggaFromFrame = async () => {
            if (!videoRef.current || !videoRef.current.videoWidth || !videoRef.current.videoHeight) return;
            if (barcodeScanBusyRef.current) return;

            const now = Date.now();
            if (now - lastBarcodeScanAt.current < BARCODE_SCAN_INTERVAL) return;
            lastBarcodeScanAt.current = now;
            barcodeScanBusyRef.current = true;
            try {
                const canvas = document.createElement("canvas");
                const width = videoRef.current.videoWidth;
                const height = videoRef.current.videoHeight;
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (!ctx) return;
                ctx.drawImage(videoRef.current, 0, 0, width, height);

                await new Promise((resolve) => {
                    Quagga.decodeSingle(
                        {
                            src: canvas.toDataURL("image/jpeg", 0.8),
                            numOfWorkers: 0,
                            inputStream: { size: 800 },
                            locator: { patchSize: "medium", halfSample: true },
                            decoder: {
                                readers: ["ean_reader", "ean_8_reader", "code_128_reader", "upc_reader", "upc_e_reader"],
                            },
                        },
                        (result) => {
                            const code = result?.codeResult?.code;
                            if (code) {
                                setDetectedBarcode(code);
                            }
                            resolve();
                        }
                    );
                });
            } finally {
                barcodeScanBusyRef.current = false;
            }
        };

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
                                if (nativeDetectorFailed) {
                                    await detectWithQuaggaFromFrame();
                                    requestAnimationFrame(detectLoop);
                                    return;
                                }

                                const results = await barcodeDetector.detect(videoRef.current);
                                if (results && results.length) {
                                    const bc = results[0].rawValue;
                                    setDetectedBarcode(bc);
                                }
                            } catch (err) {
                                nativeDetectorFailed = true;
                                await detectWithQuaggaFromFrame();
                            }
                            requestAnimationFrame(detectLoop);
                        };
                        detectLoop();
                    } catch (err) {
                        nativeDetectorFailed = true;
                        const fallbackLoop = async () => {
                            if (!active) return;
                            await detectWithQuaggaFromFrame();
                            requestAnimationFrame(fallbackLoop);
                        };
                        fallbackLoop();
                    }
                } else {
                    const fallbackLoop = async () => {
                        if (!active) return;
                        await detectWithQuaggaFromFrame();
                        requestAnimationFrame(fallbackLoop);
                    };
                    fallbackLoop();
                }
            } catch (err) {
                console.error("getUserMedia error", err);
                alert("Camera permission denied or not available. Allow camera access and retry.");
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

    // ---------- product lookup (OpenFoodFacts via backend) ----------
    useEffect(() => {
        let mounted = true;
        const controller = new AbortController();

        (async () => {
            if (!barcode) {
                setProductName("");
                setProductDetails(null);
                setLookupError("");
                return;
            }

            setLookupLoading(true);
            setLookupError("");

            try {
                const res = await fetch(`${apiBase}/api/barcode/${encodeURIComponent(barcode)}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: controller.signal,
                });
                const data = await res.json();
                if (!mounted) return;

                if (res.ok && data?.name) {
                    setProductName(data.name);
                    setProductDetails(data);
                } else {
                    setProductName(`Unknown Item (${barcode})`);
                    setProductDetails(null);
                    setLookupError("No product found for this barcode.");
                }
            } catch (e) {
                if (!mounted || e?.name === "AbortError") return;
                setProductName(`Unknown Item (${barcode})`);
                setProductDetails(null);
                setLookupError("Lookup failed. Check API/network.");
            } finally {
                if (mounted) setLookupLoading(false);
            }
        })();

        return () => {
            mounted = false;
            controller.abort();
        };
    }, [apiBase, barcode, token]);

    // ---------- capture handler ----------
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
    const handleSave = async (source = "manual") => {
        if (saveBusy) return;

        if (!barcode || !expiry) {
            if (source === "manual") {
                alert("Scan barcode and expiry date before adding to inventory.");
            }
            return;
        }

        const payload = {
            barcode: barcode || null,
            ocrText: ocrText || null,
            expiry: expiry || null,
            productName: productName || `Unknown Item (${barcode})`,
            productDetails: productDetails || null,
            savedAt: new Date().toISOString(),
        };

        try {
            setSaveBusy(true);
            setSaveStatus("Adding item to inventory...");
            if (onSave) {
                await onSave(payload);
                setSaveStatus("Item added to inventory.");
            } else {
                console.log("Scan saved (no onSave provided):", payload);
                setSaveStatus("Saved locally.");
            }
        } catch (err) {
            console.error("Save error", err);
            setSaveStatus("Failed to add item.");
            if (source === "manual") {
                alert("Save failed. See console.");
            }
            throw err;
        } finally {
            setSaveBusy(false);
        }
    };

    useEffect(() => {
        if (!onSave || !barcode || !expiry || saveBusy) return;
        const saveKey = `${barcode}:${expiry}`;
        if (lastAutoSavedKeyRef.current === saveKey) return;
        lastAutoSavedKeyRef.current = saveKey;
        handleSave("auto").catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [barcode, expiry, onSave, saveBusy]);

    // ---------- UI ----------
    return (
        <div className="flex bg-slate-50 min-h-screen">
            {/* Sidebar */}

            {/* Main */}
            <div className="flex-1 flex flex-col">

                <div className="flex justify-center items-center w-full flex-1 p-6">
                    {/* hidden canvas for manual capture OCR */}
                    <canvas ref={capturedCanvasRef} className="hidden"></canvas>

                    <div className="w-full max-w-7xl grid grid-cols-1 xl:grid-cols-5 gap-8">
                        {/* Left: Camera (bigger) */}
                        <div className="xl:col-span-3 bg-[#b7dcd3] rounded-3xl p-4 sm:p-6 mx-auto w-full shadow-lg relative flex flex-col items-center border border-white/50">
                            {/* Back */}
                            <button
                                onClick={onBack}
                                className="absolute top-4 left-4 p-2 bg-white/80 rounded-full shadow hover:scale-105 transition"
                            >
                                ←
                            </button>

                            {/* Camera area */}
                            <div className="w-full h-[320px] sm:h-[440px] rounded-2xl overflow-hidden relative bg-black border border-white/40 mt-8">
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
                                    <p className="font-medium text-gray-800">Scan or enter details</p>
                                    <p className="text-sm text-gray-400">Use the camera first. If the label is unclear, type the barcode and expiry below.</p>
                                </div>
                            </div>

                            {/* Capture button */}
                            <button
                                onClick={captureAndOcr}
                                className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition"
                            >
                                Capture Expiry Text
                            </button>

                            <div className="mt-4 w-full rounded-2xl bg-white/95 p-5 shadow border border-emerald-100">
                                <div className="flex items-center justify-between gap-3 mb-4">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">Manual fallback</p>
                                        <p className="text-xs text-gray-500">Fill these when scanning does not catch the label.</p>
                                    </div>
                                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                        Optional
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Barcode number
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={barcode || ""}
                                            onChange={(e) => applyManualBarcode(e.target.value)}
                                            placeholder="Enter 8-14 digit barcode"
                                            className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Expiry date
                                        </label>
                                        <input
                                            type="date"
                                            value={expiry || ""}
                                            onChange={(e) => {
                                                const nextExpiry = e.target.value;
                                                setExpiry(nextExpiry);
                                                setOcrText("");
                                                setSaveStatus("");
                                                if (barcode && nextExpiry) {
                                                    lastAutoSavedKeyRef.current = `${barcode}:${nextExpiry}`;
                                                }
                                            }}
                                            className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Right: Result panel */}
                        <div className="xl:col-span-2 bg-white rounded-3xl shadow-lg p-5 sm:p-8 flex flex-col">
                            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-5 mb-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                            Product lookup
                                        </p>
                                        <h2 className="mt-2 text-2xl font-semibold text-gray-800">
                                            {productName || "No product detected"}
                                        </h2>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Scan the packet or enter details manually to fetch product, allergen, and additive information.
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-emerald-700 shadow-sm">
                                        {lookupLoading ? "Checking" : hasProductDetails ? "Found" : "Ready"}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3">
                                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Product Name
                                </label>
                                <input
                                    type="text"
                                    className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800"
                                    value={productName}
                                    placeholder="Detected product will appear here"
                                    readOnly
                                />
                                {lookupLoading && <div className="mt-1 text-xs text-gray-500">Looking up barcode...</div>}
                                {lookupError && <div className="mt-1 text-xs text-amber-600">{lookupError}</div>}
                                {saveStatus && <div className="mt-1 text-xs text-emerald-700">{saveStatus}</div>}
                            </div>

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
                                {hasProductDetails && (
                                    <div className="space-y-3 mb-5">
                                        <div>
                                            <div className="font-medium text-gray-700 mb-1">Item Details</div>
                                            <div className="text-xs text-gray-500">
                                                Brand: {productDetails.brand || "Not listed"}
                                                {productDetails.quantity ? ` | Quantity: ${productDetails.quantity}` : ""}
                                            </div>
                                            <div className="text-xs text-gray-500 break-words">
                                                Categories: {displayList(productDetails.categories)}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="font-medium text-gray-700 mb-1">Ingredients</div>
                                            <div className="text-xs text-gray-500 break-words">
                                                {productDetails.ingredients || "Not listed"}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
                                                <div className="font-medium text-amber-800 mb-1">Possible Allergens</div>
                                                <div className="text-xs text-amber-700 break-words">
                                                    {displayList(productDetails.allergens)}
                                                </div>
                                                <div className="text-xs text-amber-700 break-words mt-1">
                                                    Traces: {displayList(productDetails.traces)}
                                                </div>
                                            </div>

                                            <div className="rounded-xl bg-red-50 border border-red-100 p-3">
                                                <div className="font-medium text-red-800 mb-1">Additives / Chemicals</div>
                                                <div className="text-xs text-red-700 break-words">
                                                    {displayList(productDetails.possibleChemicals || productDetails.additives)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="rounded-lg bg-gray-50 border border-gray-100 p-2">
                                                Nutri grade: {productDetails.nutritionGrade || "N/A"}
                                            </div>
                                            <div className="rounded-lg bg-gray-50 border border-gray-100 p-2">
                                                NOVA: {productDetails.novaGroup || "N/A"}
                                            </div>
                                            <div className="rounded-lg bg-gray-50 border border-gray-100 p-2">
                                                Sugar: {productDetails.nutriments?.sugars ?? "N/A"}g/100g
                                            </div>
                                            <div className="rounded-lg bg-gray-50 border border-gray-100 p-2">
                                                Salt: {productDetails.nutriments?.salt ?? "N/A"}g/100g
                                            </div>
                                        </div>
                                    </div>
                                )}

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
                                <button
                                    onClick={() => handleSave("manual")}
                                    disabled={!barcode || !expiry || saveBusy}
                                    className="flex-1 bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {saveBusy ? "Adding..." : "Add to Inventory"}
                                </button>

                                <button
                                    onClick={resetScanDetails}
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

