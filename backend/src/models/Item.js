const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, default: "Default" },
    quantity: { type: Number, default: 1 },

    expiryDate: { type: Date, required: true },
    importedAt: { type: Date, default: Date.now },

    pricePerUnit: { type: Number, default: 0 },

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
