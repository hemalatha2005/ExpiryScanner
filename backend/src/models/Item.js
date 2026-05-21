const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, default: "Default" },
    quantity: { type: Number, default: 1 },

    expiryDate: { type: Date, required: true },
    importedAt: { type: Date, default: Date.now },

    pricePerUnit: { type: Number, default: 0 },

    barcode: { type: String, default: null },
    brand: { type: String, default: null },
    ingredients: { type: String, default: null },
    allergens: { type: [String], default: [] },
    additives: { type: [String], default: [] },
    nutritionGrade: { type: String, default: null },
    novaGroup: { type: Number, default: null },

    used: { type: Boolean, default: false },
    wasted: { type: Boolean, default: false },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);
