// src/pages/DashboardPage.js
import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import AssetCard from "../components/AssetCard";
import PromoCard from "../components/PromoCard";




export default function DashboardPage({ onShowScanner }) {
  // sample data (replace with real API later)
  const savingStats = [
    { label: "Yearly Savings", amount: "₹3,760", change: "↑ 12.5%", bg: "bg-[#e6f0ff]" },
    { label: "Monthly Savings", amount: "₹540", change: "↑ 6.4%", bg: "bg-[#eafbe8]" },
    { label: "Weekly Savings", amount: "₹140", change: "↓ 2.1%", bg: "bg-[#fff7e6]" }
  ];


  return (
    <div className="flex bg-[#DFFFD8]/40 min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex-1">
        <Header onShowScanner={onShowScanner} />

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Top small stat card (full width, rounded area like reference) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* left: Portfolio summary */}
              <div className="col-span-1">
                <StatCard title="Total Amount Spent" value="₹ 12,480" subtitle="↑ 8.2% compared to last year" className="bg-white" />
              </div>

              {/* middle: asset small cards */}
              <div className="col-span-1 md:col-span-2 grid grid-cols-3 gap-4">
                {savingStats.map((s, idx) => (
                  <AssetCard
                    key={idx}
                    label={s.label}
                    amount={s.amount}
                    change={s.change}
                    bgClass={s.bg}
                  />
                ))}
              </div>

            </div>
          </div>

          {/* Main grid: left big content and right column */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Left: big content (charts + table) */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                {/* Overview Summary Block */}
                {/* Week at a Glance */}
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">

                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">This Week at a Glance</h3>
                    <div className="text-sm text-gray-500">Weekly Activity Summary</div>
                  </div>

                  <div className="grid grid-cols-7 gap-3">

                    {[
                      { day: "Mon", exp: 1, used: 0, status: "yellow" },
                      { day: "Tue", exp: 0, used: 1, status: "green" },
                      { day: "Wed", exp: 2, used: 0, status: "red" },
                      { day: "Thu", exp: 0, used: 2, status: "green" },
                      { day: "Fri", exp: 1, used: 1, status: "yellow" },
                      { day: "Sat", exp: 0, used: 0, status: "green" },
                      { day: "Sun", exp: 1, used: 0, status: "yellow" },
                    ].map((d, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 border hover:bg-gray-100 transition"
                      >
                        {/* Day Label */}
                        <div className="font-semibold text-gray-700 mb-1">{d.day}</div>

                        {/* Status Dot */}
                        <div
                          className={`w-3 h-3 rounded-full mb-2 ${d.status === "red"
                              ? "bg-red-500"
                              : d.status === "yellow"
                                ? "bg-yellow-500"
                                : "bg-emerald-500"
                            }`}
                        ></div>

                        {/* Details */}
                        <div className="text-xs text-gray-600">
                          {d.exp} expiring
                        </div>
                        <div className="text-xs text-gray-600">
                          {d.used} used
                        </div>
                      </div>
                    ))}

                  </div>

                </div>



                {/* Chart placeholder - use real chart later */}

              </div>

              {/* Table / list */}
              {/* Expiring Items – New List */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">

                <div className="flex items-center justify-between px-2 mb-4">
                  <h4 className="text-md font-semibold">Expiring Items (Priority)</h4>
                  <div className="text-sm text-gray-500">Updated: today</div>
                </div>

                <div className="divide-y">
                  {[
                    { name: "Amul Milk 1L", expiry: "2025-12-11", daysLeft: 1, qty: "1 pack" },
                    { name: "Bread Loaf", expiry: "2025-12-12", daysLeft: 2, qty: "1 loaf" },
                    { name: "Curd Cup", expiry: "2025-12-14", daysLeft: 4, qty: "2 cups" },
                    { name: "Paneer Block", expiry: "2025-12-15", daysLeft: 5, qty: "1 block" },
                    { name: "Spinach (250g)", expiry: "2025-12-12", daysLeft: 2, qty: "250g" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-4 px-2 hover:bg-slate-50 transition rounded-md"
                    >

                      {/* Left section: Icon + name */}
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

                      {/* Right section: Days left + status */}
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

                        {/* Later connect this to Items page */}
                        <button className="mt-1 text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                          View Item
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right column: promo + small cards */}
            <div className="lg:col-span-4 flex flex-col gap-3 justify-between">
              <div className="flex flex-col gap-6 h-full">
                <PromoCard />



                <div className="bg-white rounded-2xl p-8 shadow-sm ">
                  <h4 className="text-md font-semibold mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <button className="px-5 py-10 rounded-2xl bg-emerald-50 text-emerald-700 hover:scale-105 transition">Add Item</button>
                    <button className="px-5 py-8 rounded-2xl bg-yellow-50 text-yellow-700 hover:scale-105 transition">Scan Now</button>
                    <button className="px-5 py-8 rounded-2xl bg-slate-100 text-slate-700 hover:scale-105 transition">View Item</button>
                    <button className="px-5 py-10 rounded-2xl bg-rose-50 text-rose-700 hover:scale-105 transition">Settings</button>
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
