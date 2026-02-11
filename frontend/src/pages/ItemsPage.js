import React, { useCallback, useEffect, useState } from "react";
import ItemsTable from "../components/items/ItemsTable";
import ItemDetailsPanel from "../components/items/ItemDetailsPanel";
import AddItemModal from "../components/items/AddItemModal";

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [removeLoadingId, setRemoveLoadingId] = useState(null);
  const [error, setError] = useState("");
  const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/api/items`, {
        headers: { Authorization: `Bearer ${token || ""}` },
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data)) {
        setItems([]);
        setSelectedItem(null);
        setError("Could not load items.");
        return;
      }
      setItems(data);
      setSelectedItem(data[0] || null);
    } catch (err) {
      console.error(err);
      setItems([]);
      setSelectedItem(null);
      setError("Could not load items.");
    } finally {
      setIsLoading(false);
    }
  }, [apiBase, token]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAddItem = async (itemData) => {
    if (addLoading) return;
    setAddLoading(true);
    setError("");

    const tempId = `temp-${Date.now()}`;
    const optimisticItem = {
      _id: tempId,
      name: itemData.name,
      category: itemData.category,
      pricePerUnit: Number(itemData.pricePerUnit) || 0,
      quantity: Number(itemData.quantity) || 1,
      expiryDate: itemData.expiryDate,
      importedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    setItems((prev) =>
      Array.isArray(prev) ? [...prev, optimisticItem] : [optimisticItem]
    );
    setSelectedItem(optimisticItem);
    setShowAddModal(false);

    try {
      const res = await fetch(`${apiBase}/api/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify(itemData),
      });

      const savedItem = await res.json();
      if (!res.ok || !savedItem?._id) {
        throw new Error("Save failed");
      }

      setItems((prev) =>
        prev.map((item) => (item._id === tempId ? savedItem : item))
      );
      setSelectedItem(savedItem);
    } catch (err) {
      console.error(err);
      setItems((prev) => prev.filter((item) => item._id !== tempId));
      setSelectedItem((prev) => (prev?._id === tempId ? null : prev));
      setError("Could not add item. Please try again.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemoveItem = async (id) => {
    if (!id || removeLoadingId) return;
    setRemoveLoadingId(id);
    setError("");

    const previousItems = items;
    setItems((prev) => prev.filter((i) => i._id !== id));
    setSelectedItem((prev) => (prev?._id === id ? null : prev));

    try {
      const res = await fetch(`${apiBase}/api/items/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token || ""}` },
      });
      if (!res.ok) {
        throw new Error("Delete failed");
      }
    } catch (err) {
      console.error(err);
      setItems(previousItems);
      setError("Could not remove item. Please try again.");
    } finally {
      setRemoveLoadingId(null);
    }
  };

  return (
    <div className="flex gap-6 p-6">
      <ItemDetailsPanel
        item={selectedItem}
        onRemove={handleRemoveItem}
        isRemoving={removeLoadingId === selectedItem?._id}
      />

      <div className="flex-1 bg-white p-4 rounded-xl">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-semibold">All Items</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#142D4C] text-white px-4 py-2 rounded"
          >
            + Add Item
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-lg bg-red-50 text-red-600 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <ItemsTable
          items={items}
          selectedItem={selectedItem}
          onSelectItem={setSelectedItem}
          loading={isLoading}
        />
      </div>

      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onAddItem={handleAddItem}
          isSubmitting={addLoading}
        />
      )}
    </div>
  );
}
