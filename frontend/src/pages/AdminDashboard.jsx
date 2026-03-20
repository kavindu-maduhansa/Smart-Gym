import React from "react";
import { useNavigate } from "react-router-dom";

const dashboardItems = [
  {
    label: "Users",
    description: "Manage all users",
    route: "/admin-users",
    color: "bg-blue-500",
    icon: (
      <svg
        className="w-8 h-8 text-white"
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
    ),
  },
  {
    label: "Schedules",
    description: "View and manage schedules",
    route: "/admin-schedules",
    color: "bg-green-500",
    icon: (
      <svg
        className="w-8 h-8 text-white"
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
    ),
  },
  {
    label: "Inventories",
    description: "Manage gym inventories",
    route: "/admin-inventories",
    color: "bg-yellow-500",
    icon: (
      <svg
        className="w-8 h-8 text-white"
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
    ),
  },
  {
    label: "Store",
    description: "Manage store items",
    route: "/admin-store",
    color: "bg-purple-500",
    icon: (
      <svg
        className="w-8 h-8 text-white"
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
    ),
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  return (
    <div
      className="min-h-screen pt-24 relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/thumb-1920-692043.jpg')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-80 -z-10"></div>
      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <div
          className="w-full max-w-7xl rounded-2xl p-12 border-2 border-orange/60"
          style={{ background: "transparent", boxShadow: "none" }}
        >
          <h2 className="text-4xl font-bold mb-10 text-center text-orange drop-shadow-lg">
            Admin Dashboard
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
            {dashboardItems.map((item) => (
              <div
                key={item.label}
                className={
                  "flex flex-col items-center justify-center rounded-xl shadow-lg p-8 cursor-pointer transition-transform transform hover:scale-105 bg-orange bg-opacity-30 backdrop-blur-lg border-2 border-orange/60"
                }
                onClick={() => navigate(item.route)}
                style={{
                  minHeight: "180px",
                  boxShadow: "0 8px 32px 0 rgba(255,127,17,0.15)",
                }}
              >
                <div className="mb-4">{item.icon}</div>
                <div className="text-2xl font-semibold text-white mb-2">
                  {item.label}
                </div>
                <div className="text-white text-sm text-center">
                  {item.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
