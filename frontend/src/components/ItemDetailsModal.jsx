import React, { useState } from "react";
import Modal from "./Modal";

const ItemDetailsModal = ({ isOpen, item, onClose }) => {
  if (!item) return null;

  const actionButtons = [
    {
      label: "✏️ Edit",
      variant: "primary",
      onClick: () => {
        console.log("Edit item:", item.itemName);
        // Navigate to edit page
      },
    },
    {
      label: "🗑️ Delete",
      variant: "danger",
      onClick: () => {
        console.log("Delete item:", item.itemName);
        // Delete logic here
      },
    },
    {
      label: "Close",
      variant: "secondary",
      onClick: onClose,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      title={`📦 ${item.itemName}`}
      onClose={onClose}
      actionButtons={actionButtons}
    >
      {/* ITEM DETAILS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT SIDE - IMAGE */}
        <div className="flex flex-col items-center">
          {item.image ? (
            <img
              src={`http://localhost:5000/uploads/${item.image}`}
              alt={item.itemName}
              className="w-full h-64 object-cover rounded-xl mb-4 border border-slate-200"
            />
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl mb-4 flex items-center justify-center border border-slate-200">
              <span className="text-5xl">📷</span>
            </div>
          )}
          <div className="w-full">
            <p className="text-sm text-slate-500 mb-2">Status</p>
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {item.status === "available"
                  ? "🟢"
                  : item.status === "out_of_stock"
                  ? "🔴"
                  : "🟠"}
              </span>
              <span className="font-semibold capitalize">
                {item.status.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - DETAILS */}
        <div className="space-y-4">
          {/* CATEGORY & CONDITION */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-100 p-3 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Category</p>
              <p className="font-bold text-blue-500">{item.category}</p>
            </div>
            <div className="bg-slate-100 p-3 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Condition</p>
              <p className="font-bold text-blue-500">{item.condition}</p>
            </div>
          </div>

          {/* QUANTITY & SUPPLIER */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-100 p-3 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Quantity</p>
              <p className="font-bold text-2xl text-green-400">
                {item.quantity}
              </p>
            </div>
            <div className="bg-slate-100 p-3 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Supplier</p>
              <p className="font-bold truncate">{item.supplier || "N/A"}</p>
            </div>
          </div>

          {/* PRICE & DATE */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-100 p-3 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Price</p>
              <p className="font-bold text-lg text-blue-400">
                Rs. {item.purchase?.price || "N/A"}
              </p>
            </div>
            <div className="bg-slate-100 p-3 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Purchase Date</p>
              <p className="font-bold text-sm">
                {item.purchase?.purchaseDate
                  ? new Date(item.purchase.purchaseDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* TIMESTAMPS */}
          <div className="bg-slate-100 p-3 rounded-lg">
            <p className="text-xs text-slate-500 mb-2">Activity</p>
            <div className="space-y-1 text-sm">
              <p>
                ✨ Added:{" "}
                <span className="text-slate-700">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </p>
              <p>
                ✏️ Updated:{" "}
                <span className="text-slate-700">
                  {new Date(item.updatedAt).toLocaleString()}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ItemDetailsModal;

