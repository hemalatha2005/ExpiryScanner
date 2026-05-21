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
  const hasProductMetadata =
    item.barcode ||
    item.brand ||
    item.ingredients ||
    item.allergens?.length ||
    item.additives?.length ||
    item.nutritionGrade ||
    item.novaGroup;

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
        {item.barcode && <p>Barcode: {item.barcode}</p>}
        {item.brand && <p>Brand: {item.brand}</p>}
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

      {hasProductMetadata && (
        <div className="mt-4 space-y-3 text-xs">
          {item.ingredients && (
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="font-semibold text-gray-700 mb-1">Ingredients</p>
              <p className="text-gray-500 break-words">{item.ingredients}</p>
            </div>
          )}

          <div className="rounded-lg bg-amber-50 p-3">
            <p className="font-semibold text-amber-800 mb-1">Allergens</p>
            <p className="text-amber-700 break-words">
              {item.allergens?.length ? item.allergens.join(", ") : "Not listed"}
            </p>
          </div>

          <div className="rounded-lg bg-red-50 p-3">
            <p className="font-semibold text-red-800 mb-1">Additives / Chemicals</p>
            <p className="text-red-700 break-words">
              {item.additives?.length ? item.additives.join(", ") : "Not listed"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-gray-50 p-2">
              Nutri: {item.nutritionGrade || "N/A"}
            </div>
            <div className="rounded-lg bg-gray-50 p-2">
              NOVA: {item.novaGroup || "N/A"}
            </div>
          </div>
        </div>
      )}

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
