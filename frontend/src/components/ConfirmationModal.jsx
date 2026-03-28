import React from "react";
import Modal from "./Modal";

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const actionButtons = [
    {
      label: confirmText,
      variant: variant,
      onClick: onConfirm,
    },
    {
      label: cancelText,
      variant: "secondary",
      onClick: onCancel,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onCancel}
      actionButtons={actionButtons}
    >
      <div className="text-center py-6">
        {/* ICON BASED ON VARIANT */}
        <div className="mb-4 text-6xl">
          {variant === "danger" ? "⚠️" : variant === "primary" ? "❓" : "ℹ️"}
        </div>

        {/* MESSAGE */}
        <p className="text-lg text-slate-700 mb-2">{message}</p>

        {/* LOADING STATE */}
        {isLoading && (
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
