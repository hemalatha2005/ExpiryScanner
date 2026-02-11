import React from "react";
import ItemRow from "./ItemRow";

export default function ItemsTable({
  items = [],
  selectedItem,
  onSelectItem,
  loading = false,
}) {
  return (
    <table className="w-full text-sm">
      <thead className="border-b text-gray-500">
        <tr>
          <th className="text-left py-2">Item</th>
          <th className="text-center">Imported</th>
          <th className="text-center">Expiry</th>
          <th className="text-center">Status</th>
        </tr>
      </thead>

      <tbody>
        {loading ? (
          <tr>
            <td colSpan="4" className="text-center py-6 text-gray-400">
              Loading items...
            </td>
          </tr>
        ) : Array.isArray(items) && items.length > 0 ? (
          items.map((item) => (
            <ItemRow
              key={item._id}
              item={item}
              active={selectedItem?._id === item._id}
              onClick={() => onSelectItem(item)}
            />
          ))
        ) : (
          <tr>
            <td colSpan="4" className="text-center py-6 text-gray-400">
              No items found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
