import React from "react";

// helper to calculate status
const getStatus = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysLeft = Math.ceil(
    (expiry - today) / (1000 * 60 * 60 * 24)
  );

  if (daysLeft <= 0) return { label: "Expired", color: "bg-red-100 text-red-600" };
  if (daysLeft <= 3) return { label: "Urgent", color: "bg-red-50 text-red-500" };
  if (daysLeft <= 7) return { label: "Warning", color: "bg-yellow-50 text-yellow-600" };
  return { label: "Good", color: "bg-green-50 text-green-600" };
};
const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });


export default function ItemRow({ item, active, onClick }) {
  const status = getStatus(item.expiryDate);

  return (
    <tr
      onClick={onClick}
      className={`cursor-pointer border-b transition-all duration-200 ease-in-out
    ${active
          ? "bg-green-50 scale-[1.01]"
          : "hover:bg-gray-50 hover:scale-[1.005]"
        }`}
    >

      <td className="py-6">{item.name}</td>

      <td className="text-center text-gray-600">
        {formatDate(item.importedAt)}
      </td>

      <td className="text-center text-gray-600">
        {formatDate(item.expiryDate)}
      </td>

      <td className="text-center">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
        >
          {status.label}
        </span>
      </td>
    </tr>
  );
}
