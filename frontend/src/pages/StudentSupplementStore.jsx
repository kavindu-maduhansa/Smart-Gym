import React from "react";

const StudentSupplementStore = () => {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(90deg, rgba(255,127,17,0.1) 1px, transparent 1px), linear-gradient(rgba(255,127,17,0.1) 1px, transparent 1px)", backgroundSize: "50px 50px" }}></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-orange rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-20">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="backdrop-blur-md bg-gradient-to-br from-orange/20 to-orange/10 border border-orange/30 rounded-2xl shadow-2xl p-6 sm:p-8 mb-8">
            <div className="flex items-center mb-4">
              <svg
                className="w-10 h-10 sm:w-12 sm:h-12 text-orange mr-3 sm:mr-4"
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
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Supplement Store</h1>
            </div>
            <p className="text-gray-300 text-base sm:text-lg">
              Browse and purchase gym supplements
            </p>
          </div>

          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 sm:p-8">
            <div className="text-center">
              <svg
                className="w-16 h-16 sm:w-24 sm:h-24 text-orange mx-auto mb-6"
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
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Coming Soon</h2>
              <p className="text-gray-300 text-base sm:text-lg mb-2">
                This section will allow students to purchase gym supplements in a
                future update.
              </p>
              <p className="text-gray-400 text-sm sm:text-base">
                Stay tuned for exciting products and special offers!
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-6 text-center">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-orange mx-auto mb-3"
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
                <h3 className="text-white font-semibold mb-2">
                  Quality Products
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Premium supplements for your fitness goals
                </p>
              </div>
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-6 text-center">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-orange mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-white font-semibold mb-2">
                  Special Discounts
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Exclusive member pricing and deals
                </p>
              </div>
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-6 text-center">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-orange mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
                <h3 className="text-white font-semibold mb-2">Easy Ordering</h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Simple checkout and quick delivery
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSupplementStore;
