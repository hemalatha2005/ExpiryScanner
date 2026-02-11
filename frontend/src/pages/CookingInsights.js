// src/pages/CookingSuggestionsPage.js
import React, { useEffect, useMemo, useState } from "react";
import ExpiringItemCard from "../components/ExpiringItemCard";
import RecipeCard from "../components/RecipeCard";

export default function CookingInsights({ onShowScanner, onBack }) 
 {
  const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token") || "";

  const [selectedItem, setSelectedItem] = useState(null);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [itemsError, setItemsError] = useState("");
  const [recipesError, setRecipesError] = useState("");
  const [expiringItems, setExpiringItems] = useState([]);
  const [recipes, setRecipes] = useState([]);

  const urgentItems = useMemo(
    () =>
      expiringItems.filter((item) => item.status === "red" || item.status === "yellow"),
    [expiringItems]
  );

  useEffect(() => {
    const fetchItems = async () => {
      setItemsLoading(true);
      setItemsError("");
      try {
        const res = await fetch(`${apiBase}/api/items`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || !Array.isArray(data)) {
          throw new Error("Failed to load items");
        }

        const today = new Date();
        const normalized = data
          .map((item) => {
            const expiry = new Date(item.expiryDate);
            const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
            let status = "green";
            if (daysLeft <= 1) status = "red";
            else if (daysLeft <= 3) status = "yellow";
            return {
              id: item._id,
              name: item.name,
              daysLeft: Math.max(daysLeft, 0),
              status,
            };
          })
          .filter((item) => item.status === "red" || item.status === "yellow")
          .sort((a, b) => a.daysLeft - b.daysLeft)
          .slice(0, 6);

        setExpiringItems(normalized);
      } catch (err) {
        console.error(err);
        setItemsError("Could not load expiring items.");
        setExpiringItems([]);
      } finally {
        setItemsLoading(false);
      }
    };

    fetchItems();
  }, [apiBase, token]);

  useEffect(() => {
    if (!selectedItem) {
      setRecipes([]);
      return;
    }

    const fetchMealDetails = async (mealId) => {
      try {
        const res = await fetch(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(mealId)}`
        );
        if (!res.ok) return null;
        const data = await res.json();
        const meal = Array.isArray(data?.meals) ? data.meals[0] : null;
        return meal;
      } catch {
        return null;
      }
    };

    const mapMeal = (meal) => ({
      id: `mealdb-${meal.idMeal}`,
      title: meal.strMeal || "Recipe",
      time: "Time N/A",
      image: meal.strMealThumb || "",
      url: meal.strSource || meal.strYoutube || "",
      source: "TheMealDB",
    });

    const fetchFromMealDBByIngredient = async (ingredient) => {
      const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`
      );
      if (!res.ok) return [];
      const data = await res.json();
      const meals = Array.isArray(data?.meals) ? data.meals : [];
      return meals.slice(0, 8);
    };

    const fetchFromMealDBByName = async (query) => {
      const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`
      );
      if (!res.ok) return [];
      const data = await res.json();
      const meals = Array.isArray(data?.meals) ? data.meals : [];
      return meals.slice(0, 8).map((meal) => ({
        idMeal: meal.idMeal,
        strMeal: meal.strMeal,
        strMealThumb: meal.strMealThumb,
      }));
    };

    const fetchRecipes = async () => {
      setRecipesLoading(true);
      setRecipesError("");
      try {
        const [ingredientHits, nameHits] = await Promise.all([
          fetchFromMealDBByIngredient(selectedItem),
          fetchFromMealDBByName(selectedItem),
        ]);

        const mergedMealList = [...ingredientHits, ...nameHits];
        const dedupedMealList = mergedMealList.filter(
          (meal, index, arr) => arr.findIndex((m) => m.idMeal === meal.idMeal) === index
        );

        const detailMeals = await Promise.all(
          dedupedMealList.slice(0, 9).map(async (meal) => {
            const details = await fetchMealDetails(meal.idMeal);
            return details || meal;
          })
        );

        const normalizedRecipes = detailMeals.map(mapMeal);
        setRecipes(normalizedRecipes);
        if (normalizedRecipes.length === 0) {
          setRecipesError("No recipes found for this item.");
        }
      } catch (err) {
        console.error(err);
        setRecipes([]);
        setRecipesError("Could not fetch recipes right now.");
      } finally {
        setRecipesLoading(false);
      }
    };

    fetchRecipes();
  }, [selectedItem]);

  return (
    <div className="flex bg-[#F7FAFC] min-h-screen">


      <div className="flex-1">
      


        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

          {/* PAGE TITLE */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-[#213448]">
              Cook Before It’s Gone !
            </h3>
            <h6 className="text-m  mb-4 italic text-gray-500">
              Recipes designed to reduce food waste and make the most of your ingredients.
            </h6>
          </div>

          {/* EXPIRING ITEMS */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">
              Items Expiring Soon
            </h3>

            {itemsLoading && (
              <div className="text-sm text-gray-500">Loading expiring items...</div>
            )}

            {itemsError && (
              <div className="text-sm text-red-600 mb-3">{itemsError}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {urgentItems.map((item, i) => (
                <ExpiringItemCard
                  key={item.id || i}
                  item={item}
                  onSelect={() => setSelectedItem(item.name)}
                />
              ))}
            </div>

            {!itemsLoading && !itemsError && urgentItems.length === 0 && (
              <div className="text-sm text-gray-500 mt-3">
                No urgent items (1-3 days) right now.
              </div>
            )}
          </div>

          {/* RECIPES */}
          {selectedItem && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">
                Recipes using <span className="text-[#234C6A]">{selectedItem}</span>
              </h3>

              {recipesLoading && (
                <div className="text-sm text-gray-500 mb-3">Loading recipes...</div>
              )}

              {recipesError && (
                <div className="text-sm text-red-600 mb-3">{recipesError}</div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recipes.map((r) => (
                  <RecipeCard key={r.id} recipe={r} />
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
