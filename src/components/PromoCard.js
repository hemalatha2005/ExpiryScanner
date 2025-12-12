// src/components/PromoCard.js
import React from "react";

export default function PromoCard() {
  return (
  <div className="rounded-2xl p-8 bg-[#142D4C] from-slate-900 to-slate-800 text-white shadow-lg h-full space-y-4">
      <div className="text-2xl font-bold">Cooking Insight</div>
      <div className="text-xl font-semibold opacity-90">Get cooking suggestions</div>
      <p className="text-m text-gray-200 mt-2 leading-relaxed max-w-xl">The Cooking Suggestions box gives quick, smart recipe ideas based on items that are about to expire. It helps you immediately see what you can cook today using ingredients you already have, reducing waste and saving time. With one click, you can explore more detailed recipes on the dedicated suggestions page.</p>
      <div className="text-xl font-semibold opacity-90">
        Did You Know?
      </div>
      <p className="text-s text-gray-200 mt-2 leading-relaxed max-w-xl">Most people throw away food simply because they don’t have quick recipe ideas.
Smart suggestions help you turn near-expiry items into simple, tasty meals.</p>
      <div className="text-xl font-semibold opacity-90"></div>
      <button className="mt-4 px-4 py-2 bg-white text-slate-900 rounded-lg font-medium hover:scale-105 transition">Explore Recipes</button>
    </div>
  );
}
