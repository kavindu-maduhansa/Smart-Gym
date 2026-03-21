import React from "react";

const AdminSupplementStore = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
          <div className="flex items-center mb-4">
            <svg
              className="w-12 h-12 text-white mr-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h1 className="text-4xl font-bold text-white">
              Supplement Store Management
            </h1>
          </div>
          <p className="text-white text-opacity-90 text-lg">
            Manage supplements and product listings
          </p>
        </div>

        <div className="bg-gray-800 bg-opacity-50 rounded-xl p-8">
          <div className="text-center">
            <svg
              className="w-24 h-24 text-pink-400 mx-auto mb-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-white mb-4">Coming Soon</h2>
            <p className="text-gray-300 text-lg mb-2">
              This section will allow administrators to manage supplement
              products in the future.
            </p>
            <p className="text-gray-400">
              This feature will be implemented in a future update.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-700 bg-opacity-50 rounded-lg p-6 text-center">
              <h3 className="text-white font-semibold mb-2">
                Product Management
              </h3>
              <p className="text-gray-400 text-sm">
                Add and manage supplement products
              </p>
            </div>
            <div className="bg-gray-700 bg-opacity-50 rounded-lg p-6 text-center">
              <h3 className="text-white font-semibold mb-2">
                Order Processing
              </h3>
              <p className="text-gray-400 text-sm">Handle customer orders</p>
            </div>
            <div className="bg-gray-700 bg-opacity-50 rounded-lg p-6 text-center">
              <h3 className="text-white font-semibold mb-2">
                Stock Management
              </h3>
              <p className="text-gray-400 text-sm">Track product inventory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSupplementStore;
