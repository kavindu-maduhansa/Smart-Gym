import React from "react";

const InventoryManagement = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-2xl p-8 mb-8">
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
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h1 className="text-4xl font-bold text-white">
              Inventory Management
            </h1>
          </div>
          <p className="text-white text-opacity-90 text-lg">
            Track gym equipment and stock levels
          </p>
        </div>

        <div className="bg-gray-800 bg-opacity-50 rounded-xl p-8">
          <div className="text-center">
            <svg
              className="w-24 h-24 text-green-400 mx-auto mb-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <h2 className="text-2xl font-bold text-white mb-4">Coming Soon</h2>
            <p className="text-gray-300 text-lg mb-2">
              This module will be used to track gym equipment and stock levels.
            </p>
            <p className="text-gray-400">
              This feature will be implemented in a future update.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-700 bg-opacity-50 rounded-lg p-6 text-center">
              <h3 className="text-white font-semibold mb-2">
                Equipment Tracking
              </h3>
              <p className="text-gray-400 text-sm">
                Monitor gym equipment inventory
              </p>
            </div>
            <div className="bg-gray-700 bg-opacity-50 rounded-lg p-6 text-center">
              <h3 className="text-white font-semibold mb-2">Stock Alerts</h3>
              <p className="text-gray-400 text-sm">
                Get notified when stock is low
              </p>
            </div>
            <div className="bg-gray-700 bg-opacity-50 rounded-lg p-6 text-center">
              <h3 className="text-white font-semibold mb-2">Maintenance Log</h3>
              <p className="text-gray-400 text-sm">
                Track equipment maintenance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
