// src/components/RecipeCard.js
import React from "react";

export default function RecipeCard({ recipe }) {
  const image = recipe.image || "";
  const link = recipe.url || "";

  return (
    <div className="rounded-xl border bg-gray-50 p-4 hover:shadow-md transition cursor-pointer">
      {image ? (
        <img
          src={image}
          alt={recipe.title}
          className="h-32 w-full object-cover rounded-lg mb-3"
        />
      ) : (
        <div className="h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center text-gray-400">
          Recipe Image
        </div>
      )}

      <div className="font-medium">{recipe.title}</div>
      <div className="text-sm text-gray-500">{recipe.time}</div>
      {recipe.source && (
        <div className="text-xs text-gray-400 mt-1">Source: {recipe.source}</div>
      )}

      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-3 text-sm text-emerald-600 hover:underline text-[#234C6A]"
        >
          View Recipe -&gt;
        </a>
      ) : (
        <button
          type="button"
          disabled
          className="mt-3 text-sm text-gray-400 cursor-not-allowed"
        >
          Recipe link unavailable
        </button>
      )}
    </div>
  );
}
