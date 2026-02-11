export default function ItemDetailsPanel({ item, onRemove, isRemoving = false }) {
  if (!item) {
    return (
      <div className="w-[280px] bg-white rounded-xl p-4">
        <p className="text-gray-400">No item selected</p>
      </div>
    );
  }

  const expiry = item.expiryDate ? new Date(item.expiryDate) : null;
  const imported = item.createdAt ? new Date(item.createdAt) : null;

  const daysLeft =
    expiry && !isNaN(expiry)
      ? Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24))
      : "-";

  return (
    <div className="w-[280px] bg-white rounded-xl p-4">
      <span className="inline-block px-2 py-1 text-xs rounded bg-green-100 text-green-700 mb-2">
        Fresh
      </span>

      <div className="mb-4">
        <p className="text-sm text-gray-500">Days left</p>
        <p className="text-2xl font-bold">{daysLeft}</p>
      </div>

      <div className="text-sm space-y-2">
        <p>Quantity: {item.quantity}</p>
        <p>
          Imported:{" "}
          {imported && !isNaN(imported)
            ? imported.toLocaleDateString()
            : "-"}
        </p>
        <p>
          Expiry:{" "}
          {expiry && !isNaN(expiry)
            ? expiry.toLocaleDateString()
            : "-"}
        </p>
      </div>

      <button
        onClick={() => onRemove(item._id)}
        disabled={isRemoving}
        className={`mt-6 w-full rounded py-2 ${
          isRemoving
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "border border-red-400 text-red-500"
        }`}
      >
        {isRemoving ? "Removing..." : "Remove"}
      </button>
    </div>
  );
}
