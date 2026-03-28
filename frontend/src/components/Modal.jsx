import React, { useState } from "react";

const Modal = ({ isOpen, title, children, onClose, actionButtons = [] }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* MODAL CONTAINER */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100">
          {/* HEADER */}
          <div className="sticky top-0 bg-gradient-to-r from-white to-blue-50 border-b border-slate-200 p-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-blue-600">{title}</h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-blue-600 transition text-2xl leading-none"
            >
              ✕
            </button>
          </div>

          {/* CONTENT */}
          <div className="p-6 text-slate-700">
            {children}
          </div>

          {/* FOOTER - ACTION BUTTONS */}
          {actionButtons.length > 0 && (
            <div className="border-t border-slate-200 p-6 bg-slate-50 flex gap-3 justify-end rounded-b-2xl">
              {actionButtons.map((btn, idx) => (
                <button
                  key={idx}
                  onClick={btn.onClick}
                  className={`px-6 py-2 rounded-lg font-semibold transition ${
                    btn.variant === "primary"
                      ? "bg-blue-600 hover:bg-blue-700 text-slate-900"
                      : btn.variant === "danger"
                      ? "bg-red-600 hover:bg-red-700 text-slate-900"
                      : "bg-slate-200 hover:bg-slate-300 text-slate-700"
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

