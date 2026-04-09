import React, { useState } from "react";

const Modal = ({ isOpen, title, children, onClose, actionButtons = [] }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 dark:bg-black/50"
        onClick={onClose}
      />

      {/* MODAL CONTAINER */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="max-h-[90vh] w-full max-w-2xl scale-100 transform overflow-y-auto rounded-2xl border border-slate-200 bg-white opacity-100 shadow-2xl transition-all duration-300 dark:border-slate-600 dark:bg-slate-900">
          {/* HEADER */}
          <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-white to-blue-50 p-6 dark:border-slate-600 dark:from-slate-900 dark:to-slate-800">
            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{title}</h2>
            <button
              onClick={onClose}
              className="text-2xl leading-none text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
            >
              ✕
            </button>
          </div>

          {/* CONTENT */}
          <div className="p-6 text-slate-700 dark:text-slate-300">
            {children}
          </div>

          {/* FOOTER - ACTION BUTTONS */}
          {actionButtons.length > 0 && (
            <div className="flex gap-3 justify-end rounded-b-2xl border-t border-slate-200 bg-slate-50 p-6 dark:border-slate-600 dark:bg-slate-800/90">
              {actionButtons.map((btn, idx) => (
                <button
                  key={idx}
                  onClick={btn.onClick}
                  className={`rounded-lg px-6 py-2 font-semibold transition ${
                    btn.variant === "primary"
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : btn.variant === "danger"
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
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

