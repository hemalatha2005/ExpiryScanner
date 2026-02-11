// src/pages/DashboardPage.js
import React, { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";
import AssetCard from "../components/AssetCard";
import PromoCard from "../components/PromoCard";

export default function DashboardPage({
  onShowScanner,
  onShowCooking,
  onShowItems,
  onAddItem,
  onLogout,
}) {
  const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token") || "";
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiBase}/api/dashboard/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch dashboard summary");
        const data = await res.json();
        setSummary(data);
      } catch (err) {
        console.error(err);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [apiBase, token]);

  const formatInr = (value) =>
    `INR ${Math.round(Number(value) || 0).toLocaleString("en-IN")}`;

  const formatPct = (value) => {
    const parsed = Number(String(value || "0").replace("%", ""));
    if (Number.isNaN(parsed)) return "0.0%";
    if (parsed > 0) return `+${parsed.toFixed(1)}%`;
    if (parsed < 0) return `${parsed.toFixed(1)}%`;
    return "0.0%";
  };

  const topStats = useMemo(
    () => [
      {
        label: "Weekly Savings",
        amount: formatInr(summary?.weeklySavings || 0),
        change: formatPct(summary?.weeklySavingsChange || "0.0%"),
        bg: "bg-[#eafbe8]",
      },
      {
        label: "Weekly Loss",
        amount: formatInr(summary?.weeklyLoss || 0),
        change: formatPct(summary?.weeklyLossChange || "0.0%"),
        bg: "bg-[#fff1f1]",
      },
    ],
    [summary]
  );

  const weekData = summary?.weekAtGlance || [
    { day: "Mon", exp: 0, used: 0, status: "green" },
    { day: "Tue", exp: 0, used: 0, status: "green" },
    { day: "Wed", exp: 0, used: 0, status: "green" },
    { day: "Thu", exp: 0, used: 0, status: "green" },
    { day: "Fri", exp: 0, used: 0, status: "green" },
    { day: "Sat", exp: 0, used: 0, status: "green" },
    { day: "Sun", exp: 0, used: 0, status: "green" },
  ];

  const expiringItems = summary?.expiringItems || [];
  const updatedLabel = summary?.updatedAt
    ? new Date(summary.updatedAt).toLocaleDateString("en-IN")
    : "today";

  return (
    <div className="flex bg-[#F7FAFC] min-h-screen">
      <div className="flex-1">
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white rounded-3xl p-6 shadow-sm mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="col-span-1">
                <StatCard
                  title="Total Amount Spent"
                  value={formatInr(summary?.totalSpent || 0)}
                  subtitle={
                    loading
                      ? "Loading..."
                      : `${summary?.itemCount || 0} items in your account`
                  }
                  className="bg-white"
                />
              </div>

              <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                {topStats.map((s, idx) => (
                  <AssetCard
                    key={idx}
                    label={s.label}
                    amount={s.amount}
                    change={s.change}
                    bgClass={s.bg}
                    positiveIsGood={s.label !== "Weekly Loss"}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">This Week at a Glance</h3>
                    <div className="text-sm text-gray-500">Weekly Activity Summary</div>
                  </div>

                  <div className="grid grid-cols-7 gap-3">
                    {weekData.map((d, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 border hover:bg-[#EEF1FF] transition"
                      >
                        <div className="font-semibold text-gray-700 mb-1">{d.day}</div>

                        <div
                          className={`w-3 h-3 rounded-full mb-2 ${
                            d.status === "red"
                              ? "bg-[#D34E4E]"
                              : d.status === "yellow"
                                ? "bg-[#FFDE63]"
                                : "bg-[#A3D78A]"
                          }`}
                        ></div>

                        <div className="text-xs text-gray-600">{d.exp} expiring</div>
                        {d.used > 0 && (
                          <div className="text-xs text-gray-600">{d.used} used</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between px-2 mb-4">
                  <h4 className="text-md font-semibold">Expiring Items (Priority)</h4>
                  <div className="text-sm text-gray-500">Updated: {updatedLabel}</div>
                </div>

                <div className="divide-y">
                  {expiringItems.length > 0 ? (
                    expiringItems.map((item, i) => (
                      <div
                        key={item.id || i}
                        className="flex items-center justify-between py-4 px-2 hover:bg-[#EEF1FF] transition rounded-md"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-lg">
                            {item.name.charAt(0)}
                          </div>

                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-gray-400">
                              Qty: {item.qty} • Expiry: {item.expiry}
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end gap-1">
                          <div className="text-xl font-bold">{item.daysLeft}d</div>

                          <div
                            className={
                              "text-sm " +
                              (item.daysLeft <= 1
                                ? "text-red-600"
                                : item.daysLeft <= 3
                                  ? "text-yellow-600"
                                  : "text-emerald-600")
                            }
                          >
                            {item.daysLeft <= 1
                              ? "Critical"
                              : item.daysLeft <= 3
                                ? "Expiring Soon"
                                : "Safe"}
                          </div>

                          
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 px-2 text-sm text-gray-500">
                      No expiring items in the next 7 days.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3 justify-between">
              <div className="flex flex-col gap-6 h-full">
                <PromoCard onExplore={onShowCooking} />

                <div className="bg-white rounded-2xl p-8 shadow-sm ">
                  <h4 className="text-md font-semibold mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <button
                      onClick={onAddItem}
                      className="px-5 py-10 rounded-2xl bg-emerald-50 text-emerald-700 hover:scale-105 transition"
                    >
                      Add Item
                    </button>
                    <button
                      onClick={onShowScanner}
                      className="px-5 py-8 rounded-2xl bg-yellow-50 text-yellow-700 hover:scale-105 transition"
                    >
                      Scan Now
                    </button>
                    <button
                      onClick={onShowItems}
                      className="px-5 py-8 rounded-2xl bg-slate-100 text-slate-700 hover:scale-105 transition"
                    >
                      View Item
                    </button>
                    <button
                      onClick={onLogout}
                      className="px-5 py-10 rounded-2xl bg-rose-50 text-rose-700 hover:scale-105 transition"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
