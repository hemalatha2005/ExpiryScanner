import React, { useState } from "react";

export default function AddItemModal({ onClose, onAddItem, isSubmitting = false }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [expiryDate, setExpiryDate] = useState("");
  const isFormValid = Boolean(
    name.trim() &&
      expiryDate &&
      pricePerUnit !== "" &&
      !Number.isNaN(Number(pricePerUnit)) &&
      Number(pricePerUnit) >= 0
  );

  const handleAdd = () => {
    if (!isFormValid || isSubmitting) return;

    onAddItem({
      name,
      category,
      pricePerUnit: Number(pricePerUnit),
      quantity,
      expiryDate,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-96">
        <h3 className="text-lg font-semibold mb-4">Add Item</h3>

        <input
          className="w-full border p-2 mb-2"
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full border p-2 mb-2"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          type="number"
          min="0"
          step="0.01"
          className="w-full border p-2 mb-2"
          placeholder="Price per unit"
          value={pricePerUnit}
          onChange={(e) => setPricePerUnit(e.target.value)}
        />

        <input
          type="number"
          className="w-full border p-2 mb-2"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <input
          type="date"
          className="w-full border p-2 mb-4"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border p-2"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!isFormValid || isSubmitting}
            className={`flex-1 p-2 text-white ${
              !isFormValid || isSubmitting
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#142D4C]"
            }`}
          >
            {isSubmitting ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
