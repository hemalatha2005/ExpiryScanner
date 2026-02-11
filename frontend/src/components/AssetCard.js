// src/components/AssetCard.js
import React from "react";

export default function AssetCard({
  label,
  amount,
  change,
  bgClass,
  positiveIsGood = true,
}) {
  const changeText = String(change || "");
  const isPositive = changeText.startsWith("+");
  const goodChange = positiveIsGood ? isPositive : !isPositive;

  return (
    <div
      className={`rounded-2xl p-4 ${bgClass} text-black/90 shadow-sm transition hover:scale-[1.02]`}
    >
      <div className="text-xs font-medium">{label}</div>
      <div className="mt-2 text-xl font-bold">{amount}</div>
      <div
        className={`mt-2 text-sm ${
          goodChange ? "text-emerald-700" : "text-red-700"
        }`}
      >
        {changeText}
      </div>
    </div>
  );
}
