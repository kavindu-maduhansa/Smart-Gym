import React, { useState } from "react";
import Modal from "./Modal";

const FormModal = ({ isOpen, title, fields, onSubmit, onClose, submitText = "Submit" }) => {
  const [formData, setFormData] = useState(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: field.defaultValue || "" }), {})
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData(
      fields.reduce((acc, field) => ({ ...acc, [field.name]: field.defaultValue || "" }), {})
    );
  };

  const actionButtons = [
    {
      label: `✓ ${submitText}`,
      variant: "primary",
      onClick: handleSubmit,
    },
    {
      label: "✕ Cancel",
      variant: "secondary",
      onClick: onClose,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      actionButtons={actionButtons}
    >
      <div className="space-y-5">
        {fields.map((field) => (
          <div key={field.name}>
            {/* LABEL */}
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {field.label}
            </label>

            {/* TEXT INPUT */}
            {field.type === "text" || field.type === "email" || field.type === "number" ? (
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full p-3 rounded-lg bg-slate-50 text-slate-900 border border-slate-300 focus:border-blue-600 focus:outline-none transition"
                disabled={field.disabled}
              />
            ) : field.type === "select" ? (
              /* SELECT INPUT */
              <select
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-slate-50 text-slate-900 border border-slate-300 focus:border-blue-600 focus:outline-none transition"
                disabled={field.disabled}
              >
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              /* TEXTAREA INPUT */
              <textarea
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                rows={field.rows || 4}
                className="w-full p-3 rounded-lg bg-slate-50 text-slate-900 border border-slate-300 focus:border-blue-600 focus:outline-none transition resize-none"
                disabled={field.disabled}
              />
            ) : field.type === "checkbox" ? (
              /* CHECKBOX INPUT */
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name={field.name}
                  checked={formData[field.name]}
                  onChange={handleChange}
                  className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                  disabled={field.disabled}
                />
                <span className="ml-3 text-slate-700">{field.checkboxLabel}</span>
              </div>
            ) : null}

            {/* HELPER TEXT */}
            {field.helperText && (
              <p className="text-xs text-slate-500 mt-1">{field.helperText}</p>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default FormModal;
