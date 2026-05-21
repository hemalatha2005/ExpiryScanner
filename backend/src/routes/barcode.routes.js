const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

const readableTags = (tags = []) =>
  tags
    .map((tag) => String(tag).replace(/^[a-z]{2}:/, "").replace(/-/g, " "))
    .filter(Boolean);

router.get("/:code", authMiddleware, async (req, res) => {
  try {
    const code = String(req.params.code || "").trim();
    if (!/^\d{8,14}$/.test(code)) {
      return res.status(400).json({ message: "Invalid barcode" });
    }

    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`,
      {
        headers: {
          "User-Agent": "SmartExpiry/1.0",
        },
      }
    );

    if (!response.ok) {
      return res.status(502).json({ message: "Barcode lookup failed" });
    }

    const data = await response.json();
    const product = data?.product || {};
    const found = data?.status === 1;
    const name =
      product.product_name ||
      product.product_name_en ||
      product.generic_name ||
      null;

    if (!found || !name) {
      return res.json({
        found: false,
        barcode: code,
        name: null,
        message: "No product found for this barcode",
      });
    }

    return res.json({
      found: true,
      barcode: code,
      name,
      brand: product.brands || null,
      quantity: product.quantity || null,
      categories: readableTags(product.categories_tags),
      image:
        product.image_front_url ||
        product.image_url ||
        product.selected_images?.front?.display?.en ||
        null,
      ingredients: product.ingredients_text || product.ingredients_text_en || null,
      allergens: readableTags(product.allergens_tags),
      traces: readableTags(product.traces_tags),
      additives: readableTags(product.additives_tags),
      possibleChemicals: readableTags(product.additives_tags),
      ingredientsAnalysis: readableTags(product.ingredients_analysis_tags),
      nutritionGrade: product.nutrition_grades || null,
      novaGroup: product.nova_group || null,
      nutriments: {
        energyKcal: product.nutriments?.["energy-kcal_100g"] ?? null,
        fat: product.nutriments?.fat_100g ?? null,
        saturatedFat: product.nutriments?.["saturated-fat_100g"] ?? null,
        carbohydrates: product.nutriments?.carbohydrates_100g ?? null,
        sugars: product.nutriments?.sugars_100g ?? null,
        proteins: product.nutriments?.proteins_100g ?? null,
        salt: product.nutriments?.salt_100g ?? null,
      },
    });
  } catch (err) {
    console.error("BARCODE LOOKUP ERROR:", err);
    return res.status(500).json({ message: "Failed to lookup barcode" });
  }
});

module.exports = router;

