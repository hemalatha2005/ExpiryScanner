// src/components/ExpiringItemCard.js
import React from "react";

export default function ExpiringItemCard({ item, onSelect }) {
  const color =
    item.status === "red"
      ? "bg-red-50 border-red-200 text-red-700"
      : "bg-yellow-50 border-yellow-200 text-yellow-700";

  return (
    <button
      onClick={onSelect}
      className={`p-4 rounded-xl border text-left hover:scale-[1.02] transition ${color}`}
    >
      <div className="font-semibold text-lg">{item.name}</div>
      <div className="text-sm mt-1">
        {item.daysLeft} day{item.daysLeft > 1 ? "s" : ""} left
      </div>
    </button>
  );
}
