const express = require("express");
const Item = require("../models/Item");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// ➕ ADD ITEM
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, category, quantity, expiryDate, pricePerUnit } = req.body;
    const parsedPrice = Number(pricePerUnit);

    if (!name || !expiryDate || Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ message: "Invalid item data" });
    }

    const item = await Item.create({
      name,
      category: category || "Default",
      quantity: Number(quantity) || 1,
      expiryDate,
      pricePerUnit: parsedPrice,
      userId: req.userId,
    });

    res.status(201).json(item);
  } catch (err) {
    console.error("ADD ITEM ERROR:", err);
    res.status(500).json({ message: "Failed to add item" });
  }
});

// 📦 GET ITEMS
router.get("/", authMiddleware, async (req, res) => {
  try {
    const items = await Item.find({ userId: req.userId }).sort({
      expiryDate: 1,
    });
    res.json(items);   
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch items" });
  }
});

// ❌ DELETE ITEM
router.delete("/:id", authMiddleware, async (req, res) => {
  await Item.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId,
  });
  res.json({ message: "Item deleted" });
});

module.exports = router;
