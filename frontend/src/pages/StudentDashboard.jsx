import React from "react";

const StudentDashboard = () => {
  return (
    <div className="min-h-screen bg-black pt-24 relative">
      <div className="absolute inset-0 bg-black bg-opacity-80 -z-10"></div>
      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <div className="w-full max-w-3xl bg-white bg-opacity-90 rounded-xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold mb-8 text-center text-orange">
            Student Dashboard
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="flex flex-col items-center justify-center rounded-lg shadow-lg p-6 bg-blue-500 text-white">
              <div className="mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-2a4 4 0 10-8 0 4 4 0 008 0zm6-2a4 4 0 10-8 0 4 4 0 008 0z"
                  ></path>
                </svg>
              </div>
              <div className="text-xl font-semibold mb-2">My Profile</div>
              <div className="text-sm text-center">
                View and update your profile
              </div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg shadow-lg p-6 bg-green-500 text-white">
              <div className="mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
              <div className="text-xl font-semibold mb-2">Schedules</div>
              <div className="text-sm text-center">
                View your class schedules
              </div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg shadow-lg p-6 bg-yellow-500 text-white">
              <div className="mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0H4"
                  ></path>
                </svg>
              </div>
              <div className="text-xl font-semibold mb-2">Membership</div>
              <div className="text-sm text-center">
                Check your membership status
              </div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg shadow-lg p-6 bg-purple-500 text-white">
              <div className="mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 7h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
              <div className="text-xl font-semibold mb-2">Store</div>
              <div className="text-sm text-center">
                Browse and buy gym products
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
