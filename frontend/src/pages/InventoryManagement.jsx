import React from "react";

const COLORS = {
  lime: "#9ACD32",
  green: "#7FBF3F",
  greenDark: "#6FA82F",
  greenSoft: "#B7D96A",
  black: "#000000",
  dark: "#1A1A1A",
  text: "#333333",
  white: "#FFFFFF",
  bg: "#F2F2F2",
  divider: "#E6E6E6",
};

const InventoryManagement = () => {
  return (
    <div className="min-h-screen text-slate-900 overflow-hidden" style={{ backgroundColor: COLORS.bg }}>
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0" style={{ background: `linear-gradient(145deg, ${COLORS.bg} 0%, ${COLORS.white} 40%, #edf4dd 100%)` }}></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(90deg, rgba(111,168,47,0.1) 1px, transparent 1px), linear-gradient(rgba(111,168,47,0.1) 1px, transparent 1px)", backgroundSize: "50px 50px" }}></div>
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ backgroundColor: COLORS.greenSoft }}></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" style={{ backgroundColor: COLORS.lime, animationDelay: "2s" }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-20">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 mb-8 border" style={{ background: `linear-gradient(145deg, ${COLORS.greenSoft} 0%, #dfeec0 100%)`, borderColor: COLORS.greenDark }}>
            <div className="flex items-center mb-4">
              <svg
                className="w-10 h-10 sm:w-12 sm:h-12 mr-3 sm:mr-4"
                style={{ color: COLORS.greenDark }}
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
              <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: COLORS.black }}>
                Inventory Management
              </h1>
            </div>
            <p className="text-base sm:text-lg" style={{ color: COLORS.text }}>
              Track gym equipment and stock levels
            </p>
          </div>

          <div className="backdrop-blur-md rounded-xl p-6 sm:p-8 border" style={{ backgroundColor: COLORS.white, borderColor: COLORS.divider }}>
            <div className="text-center">
              <svg
                className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-6"
                style={{ color: COLORS.greenDark }}
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
              <h2 className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: COLORS.black }}>Coming Soon</h2>
              <p className="text-base sm:text-lg mb-2" style={{ color: COLORS.text }}>
                This module will be used to track gym equipment and stock levels.
              </p>
              <p className="text-sm sm:text-base" style={{ color: "#6b7280" }}>
                This feature will be implemented in a future update.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="backdrop-blur-md rounded-lg p-6 text-center border" style={{ backgroundColor: "#f8fbef", borderColor: COLORS.divider }}>
                <h3 className="font-semibold mb-2" style={{ color: COLORS.black }}>
                  Equipment Tracking
                </h3>
                <p className="text-xs sm:text-sm" style={{ color: COLORS.text }}>
                  Monitor gym equipment inventory
                </p>
              </div>
              <div className="backdrop-blur-md rounded-lg p-6 text-center border" style={{ backgroundColor: "#f8fbef", borderColor: COLORS.divider }}>
                <h3 className="font-semibold mb-2" style={{ color: COLORS.black }}>Stock Alerts</h3>
                <p className="text-xs sm:text-sm" style={{ color: COLORS.text }}>
                  Get notified when stock is low
                </p>
              </div>
              <div className="backdrop-blur-md rounded-lg p-6 text-center border" style={{ backgroundColor: "#f8fbef", borderColor: COLORS.divider }}>
                <h3 className="font-semibold mb-2" style={{ color: COLORS.black }}>Maintenance Log</h3>
                <p className="text-xs sm:text-sm" style={{ color: COLORS.text }}>
                  Track equipment maintenance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;



