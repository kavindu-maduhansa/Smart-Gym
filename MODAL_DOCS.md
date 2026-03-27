# 🎨 Modern Modal Components Documentation

## Overview
This documentation covers the modern, reusable modal components created for your Smart Gym application.

---

## Components Available

### 1. **Modal** (Base Component)
The foundation modal component with backdrop, header, content area, and action buttons.

**Location:** `src/components/Modal.jsx`

**Props:**
```javascript
{
  isOpen: boolean,           // Show/hide modal
  title: string,             // Modal header title
  children: ReactNode,       // Modal content
  onClose: function,         // Callback when closing
  actionButtons: array       // [{ label, variant, onClick }]
}
```

**Button Variants:**
- `primary` - Orange button (main action)
- `secondary` - Gray button (cancel/close)
- `danger` - Red button (delete/warning)

**Example:**
```jsx
import Modal from "./Modal";
import { useState } from "react";

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      
      <Modal
        isOpen={isOpen}
        title="My Modal"
        onClose={() => setIsOpen(false)}
        actionButtons={[
          { label: "Close", variant: "secondary", onClick: () => setIsOpen(false) }
        ]}
      >
        <p>Your content here</p>
      </Modal>
    </>
  );
}
```

---

### 2. **ItemDetailsModal**
Pre-built modal for displaying inventory item details with images and all information.

**Location:** `src/components/ItemDetailsModal.jsx`

**Props:**
```javascript
{
  isOpen: boolean,
  item: {
    itemName, category, quantity, condition,
    status, image, supplier, purchase,
    createdAt, updatedAt
  },
  onClose: function
}
```

**Features:**
- ✅ Item image (or placeholder)
- ✅ All item details in card layout
- ✅ Status indicator (🟢 🔴 🟠)
- ✅ Action buttons (Edit, Delete, Close)
- ✅ Activity timestamps

**Example:**
```jsx
import ItemDetailsModal from "./ItemDetailsModal";
import { useState } from "react";

function InventoryList({ items }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setIsOpen(true);
  };

  return (
    <>
      {items.map(item => (
        <div key={item._id} onClick={() => handleViewDetails(item)}>
          {item.itemName}
        </div>
      ))}
      
      <ItemDetailsModal
        isOpen={isOpen}
        item={selectedItem}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
```

---

### 3. **ConfirmationModal**
For delete confirmations or important actions.

**Location:** `src/components/ConfirmationModal.jsx`

**Props:**
```javascript
{
  isOpen: boolean,
  title: string,                    // Modal title
  message: string,                  // Confirmation message
  confirmText: string,              // Confirm button label
  cancelText: string,               // Cancel button label
  variant: "primary" | "danger",    // Button style
  onConfirm: function,              // Confirm action
  onCancel: function,               // Cancel action
  isLoading: boolean                // Show loading spinner
}
```

**Example:**
```jsx
import ConfirmationModal from "./ConfirmationModal";
import { useState } from "react";
import axios from "axios";

function DeleteItemButton({ itemId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await axios.delete(`/api/inventory/${itemId}`);
      setIsOpen(false);
      alert("Item deleted!");
    } catch (err) {
      alert("Failed to delete");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Delete</button>

      <ConfirmationModal
        isOpen={isOpen}
        title="Delete Item"
        message="Are you sure? This cannot be undone."
        confirmText="Yes, Delete"
        cancelText="No, Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setIsOpen(false)}
        isLoading={isLoading}
      />
    </>
  );
}
```

---

### 4. **FormModal**
For collecting user input with various field types.

**Location:** `src/components/FormModal.jsx`

**Props:**
```javascript
{
  isOpen: boolean,
  title: string,
  fields: array,                    // Form field definitions
  onSubmit: function(formData),     // Submit handler
  onClose: function,
  submitText: string               // Custom submit button text
}
```

**Field Definition:**
```javascript
{
  name: "itemName",                // Field name (key in form data)
  label: "Item Name",              // Display label
  type: "text" | "number" | "email" | "select" | "textarea" | "checkbox",
  placeholder: "Enter...",         // Input placeholder
  defaultValue: "",                // Default value
  options: [],                     // For select fields
  rows: 4,                         // For textarea
  checkboxLabel: "...",            // For checkbox
  helperText: "...",               // Helper text below field
  disabled: false                  // Disable field
}
```

**Example:**
```jsx
import FormModal from "./FormModal";
import { useState } from "react";
import axios from "axios";

function AddItemModal() {
  const [isOpen, setIsOpen] = useState(false);

  const formFields = [
    {
      name: "itemName",
      label: "Item Name",
      type: "text",
      placeholder: "Enter item name",
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
      defaultValue: "1",
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
      rows: 3,
    },
  ];

  const handleSubmit = async (formData) => {
    try {
      await axios.post("/api/inventory/add", formData);
      alert("Item added!");
      setIsOpen(false);
    } catch (err) {
      alert("Failed to add item");
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>+ Add Item</button>

      <FormModal
        isOpen={isOpen}
        title="Add New Item"
        fields={formFields}
        onSubmit={handleSubmit}
        onClose={() => setIsOpen(false)}
        submitText="Add Item"
      />
    </>
  );
}
```

---

## 🎨 Color Scheme (Maintained)

All modals use your existing color scheme:
- **Background:** `#121418` / `#1c1f26` (Dark gray)
- **Text:** `#e0e0e0` (Light gray)
- **Primary:** `#f97316` (Orange)
- **Success:** `#22c55e` (Green)
- **Danger:** `#dc2626` (Red)

---

## 🚀 Features

✅ **Modern Design**
- Smooth animations and transitions
- Backdrop blur effect
- Rounded corners and shadows
- Responsive padding and spacing

✅ **Accessibility**
- Close button (X) in header
- Click backdrop to close
- Keyboard-friendly
- Clear visual hierarchy

✅ **Reusable**
- Base Modal component can be used anywhere
- Pre-built specialized modals for common tasks
- Easy to customize

✅ **Responsive**
- Works on all screen sizes
- Max-width constraint
- Scroll on long content

---

## 📚 Integration Examples

### In RecentActivity Component
```jsx
import ItemDetailsModal from "./ItemDetailsModal";
import { useState } from "react";

function RecentActivity() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const handleViewActivity = (activity) => {
    setSelectedActivity(activity);
    setIsOpen(true);
  };

  return (
    <>
      {/* Activity list */}
      {activities.map(activity => (
        <div 
          key={activity.id}
          onClick={() => handleViewActivity(activity)}
          className="cursor-pointer"
        >
          {activity.itemName}
        </div>
      ))}

      <ItemDetailsModal
        isOpen={isOpen}
        item={selectedActivity}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
```

### In ManageInventory Component
```jsx
import ItemDetailsModal from "./ItemDetailsModal";
import ConfirmationModal from "./ConfirmationModal";
import { useState } from "react";

function ManageInventory() {
  const [viewModal, setViewModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setViewModal(true);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setDeleteModal(true);
  };

  return (
    <>
      {/* Item list buttons */}
      <button onClick={() => handleEdit(item)}>Edit</button>
      <button onClick={() => handleDelete(item)}>Delete</button>

      <ItemDetailsModal
        isOpen={viewModal}
        item={selectedItem}
        onClose={() => setViewModal(false)}
      />

      <ConfirmationModal
        isOpen={deleteModal}
        title="Delete Item"
        message={`Delete "${selectedItem?.itemName}"?`}
        variant="danger"
        onConfirm={() => deleteItem(selectedItem._id)}
        onCancel={() => setDeleteModal(false)}
      />
    </>
  );
}
```

---

## 📝 Notes

- All modals maintain your existing color scheme
- No breaking changes to current functionality
- Can be used individually or together
- Fully responsive and mobile-friendly

---

## 🔧 Ready to Use!

All modal components are now available in your `src/components/` folder. Import and use them throughout your application!

