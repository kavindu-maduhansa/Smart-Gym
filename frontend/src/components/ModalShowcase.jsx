import React, { useState } from "react";
import Modal from "./Modal";
import ItemDetailsModal from "./ItemDetailsModal";
import ConfirmationModal from "./ConfirmationModal";
import FormModal from "./FormModal";

/**
 * ============================================
 * MODAL COMPONENTS USAGE EXAMPLES
 * ============================================
 * 
 * This file demonstrates how to use the modern modal components
 * throughout your application.
 */

// ============= EXAMPLE 1: BASIC MODAL =============
export const BasicModalExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actionButtons = [
    {
      label: "Close",
      variant: "primary",
      onClick: () => setIsOpen(false),
    },
  ];

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-blue-600 rounded text-white">
        Open Modal
      </button>

      <Modal
        isOpen={isOpen}
        title="Basic Modal Example"
        onClose={() => setIsOpen(false)}
        actionButtons={actionButtons}
      >
        <p>This is the modal content. You can put anything here!</p>
      </Modal>
    </>
  );
};

// ============= EXAMPLE 2: ITEM DETAILS MODAL =============
export const ItemDetailsModalExample = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const sampleItem = {
    _id: "123",
    itemName: "Treadmill Pro",
    category: "Cardio",
    quantity: 5,
    condition: "Good",
    status: "available",
    supplier: "Fitness Plus Co.",
    purchase: {
      price: 45000,
      purchaseDate: new Date(),
    },
    image: "treadmill.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const handleOpenDetails = () => {
    setSelectedItem(sampleItem);
    setIsOpen(true);
  };

  return (
    <>
      <button onClick={handleOpenDetails} className="px-4 py-2 bg-blue-600 rounded text-white">
        View Item Details
      </button>

      <ItemDetailsModal
        isOpen={isOpen}
        item={selectedItem}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

// ============= EXAMPLE 3: CONFIRMATION MODAL =============
export const ConfirmationModalExample = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsOpen(false);
    alert("Action confirmed!");
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-red-600 rounded text-slate-900">
        Delete Item (with confirmation)
      </button>

      <ConfirmationModal
        isOpen={isOpen}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="No, Cancel"
        variant="danger"
        onConfirm={handleConfirm}
        onCancel={() => setIsOpen(false)}
        isLoading={isLoading}
      />
    </>
  );
};

// ============= EXAMPLE 4: FORM MODAL =============
export const FormModalExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  const formFields = [
    {
      name: "itemName",
      label: "Item Name",
      type: "text",
      placeholder: "Enter item name",
      defaultValue: "",
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      options: [
        { label: "Cardio", value: "Cardio" },
        { label: "Strength", value: "Strength" },
        { label: "Accessories", value: "Accessories" },
      ],
      defaultValue: "Cardio",
    },
    {
      name: "quantity",
      label: "Quantity",
      type: "number",
      placeholder: "Enter quantity",
      defaultValue: "",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Enter item description",
      rows: 4,
      defaultValue: "",
    },
    {
      name: "terms",
      label: "Terms & Conditions",
      type: "checkbox",
      checkboxLabel: "I agree to the terms and conditions",
      defaultValue: false,
    },
  ];

  const handleFormSubmit = (data) => {
    console.log("Form submitted:", data);
    setIsOpen(false);
    alert("Form submitted successfully!");
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-green-600 rounded text-slate-900">
        Add New Item (Form Modal)
      </button>

      <FormModal
        isOpen={isOpen}
        title="Add New Inventory Item"
        fields={formFields}
        onSubmit={handleFormSubmit}
        onClose={() => setIsOpen(false)}
        submitText="Add Item"
      />
    </>
  );
};

// ============= DEMO COMPONENT =============
export const ModalShowcase = () => {
  return (
    <div className="min-h-screen bg-[#FFFFFF] p-8 text-slate-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-8">Modal Components Showcase</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">Basic Modal</h2>
            <BasicModalExample />
          </div>

          <div className="bg-white p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">Item Details Modal</h2>
            <ItemDetailsModalExample />
          </div>

          <div className="bg-white p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">Confirmation Modal</h2>
            <ConfirmationModalExample />
          </div>

          <div className="bg-white p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">Form Modal</h2>
            <FormModalExample />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalShowcase;


