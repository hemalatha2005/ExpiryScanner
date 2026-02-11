// src/components/StatCard.js
import React from "react";

export default function StatCard({ title, value, subtitle, className = "" }) {
  return (
    <div className={`rounded-2xl p-4 shadow-sm ${className} transition transform hover:-translate-y-1 hover:shadow-md`}>
      <div className="text-sm text-gray-600">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
}
