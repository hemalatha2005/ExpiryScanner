export default function ItemCard({ item, onDelete }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-5 hover:shadow-md transition">

      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-3xl">
        🛒
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-xl font-semibold">{item.productName}</h4>
            <p className="text-sm text-gray-500">Expiry: {formatDate(item.expiryDate)}</p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500">Days Left</p>
            <p className="text-2xl font-bold">{item.daysLeft}</p>
          </div>
        </div>

        {/* Status + Delete */}
        <div className="flex items-center justify-between mt-4">
          
          {/* Status Badge */}
          <span
            className={
              "px-3 py-1 rounded-full text-sm font-medium " +
              (item.status === "green"
                ? "bg-emerald-100 text-emerald-700"
                : item.status === "yellow"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700")
            }
          >
            {item.status === "green"
              ? "Safe"
              : item.status === "yellow"
              ? "Expiring Soon"
              : "Expired"}
          </span>

          <button
            onClick={() => onDelete(item._id)}
            className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg transition text-sm"
          >
            Delete
          </button>

        </div>
      </div>

    </div>
  );
}
