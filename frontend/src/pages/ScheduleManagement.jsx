import React from "react";

const ScheduleManagement = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-2xl p-8 mb-8">
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h1 className="text-4xl font-bold text-white">
              Schedule Management
            </h1>
          </div>
          <p className="text-white text-opacity-90 text-lg">
            Manage gym class schedules and sessions
          </p>
        </div>

        <div className="bg-gray-800 bg-opacity-50 rounded-xl p-8">
          <div className="text-center">
            <svg
              className="w-24 h-24 text-purple-400 mx-auto mb-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-white mb-4">Coming Soon</h2>
            <p className="text-gray-300 text-lg mb-2">
              This module will be used to manage gym schedules and classes.
            </p>
            <p className="text-gray-400">
              This feature will be implemented in a future update.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-700 bg-opacity-50 rounded-lg p-6 text-center">
              <h3 className="text-white font-semibold mb-2">
                Class Scheduling
              </h3>
              <p className="text-gray-400 text-sm">
                Create and manage class schedules
              </p>
            </div>
            <div className="bg-gray-700 bg-opacity-50 rounded-lg p-6 text-center">
              <h3 className="text-white font-semibold mb-2">Session Booking</h3>
              <p className="text-gray-400 text-sm">
                Handle member session bookings
              </p>
            </div>
            <div className="bg-gray-700 bg-opacity-50 rounded-lg p-6 text-center">
              <h3 className="text-white font-semibold mb-2">
                Trainer Assignment
              </h3>
              <p className="text-gray-400 text-sm">
                Assign trainers to classes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleManagement;
