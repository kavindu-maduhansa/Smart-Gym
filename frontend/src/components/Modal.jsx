import React, { useState } from "react";

const Modal = ({ isOpen, title, children, onClose, actionButtons = [] }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* MODAL CONTAINER */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-[#1c1f26] rounded-2xl shadow-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100">
          {/* HEADER */}
          <div className="sticky top-0 bg-gradient-to-r from-[#1c1f26] to-[#242830] border-b border-gray-700 p-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-orange-500">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-orange-500 transition text-2xl leading-none"
            >
              ✕
            </button>
          </div>

          {/* CONTENT */}
          <div className="p-6 text-[#e0e0e0]">
            {children}
          </div>

          {/* FOOTER - ACTION BUTTONS */}
          {actionButtons.length > 0 && (
            <div className="border-t border-gray-700 p-6 bg-[#121418] flex gap-3 justify-end rounded-b-2xl">
              {actionButtons.map((btn, idx) => (
                <button
                  key={idx}
                  onClick={btn.onClick}
                  className={`px-6 py-2 rounded-lg font-semibold transition ${
                    btn.variant === "primary"
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : btn.variant === "danger"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-gray-700 hover:bg-gray-600 text-gray-100"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Modal;
