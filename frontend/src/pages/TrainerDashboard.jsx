import React from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaUsers, FaClipboardList, FaStar, FaUtensils } from "react-icons/fa";

const TrainerDashboard = () => {
  // Added 'path' to each feature to enable navigation
  const trainerFeatures = [
    {
      id: 1,
      icon: FaCalendarAlt,
      title: "My Schedules",
      desc: "View and edit your training sessions.",
      path: "/trainer/schedules"
    },
    {
      id: 2,
      icon: FaUsers,
      title: "Assigned Students",
      desc: "Manage students under your guidance.",
      path: "/trainer/students"
    },
    {
      id: 3,
      icon: FaClipboardList,
      title: "Manage Plans",
      desc: "Manage workout and meal plans.",
      path: "/trainer/manage-plans"
    },
    {
      id: 4,
      icon: FaStar,
      title: "My Feedbacks",
      desc: "View student reviews and ratings.",
      path: "/trainer/feedbacks"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-slate-900 relative overflow-hidden">
      {/* Team Background Theme - Glassmorphism style */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100"></div>
        {/* Animated Blobs to match Home.jsx */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-5 animate-pulse"></div>
      </div>

      <div className="relative z-10 pt-32 pb-20 container mx-auto px-6">
        <header className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-600/80 tracking-tight">
            Trainer Dashboard
          </h1>
          <p className="text-slate-500 mt-4 text-lg">Welcome back. Manage your classes and students below.</p>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trainerFeatures.map((f) => {
            const Icon = f.icon;
            return (
              <Link to={f.path} key={f.id} className="block group">
                <div className="h-full backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl p-8 hover:bg-white/15 hover:border-blue-600/50 transition-all duration-300 transform hover:-translate-y-2">

                  {/* Icon Container */}
                  <div className="w-16 h-16 bg-blue-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-700/30 transition-colors duration-300">
                    <Icon className="text-blue-600 text-3xl transform group-hover:scale-110 transition-transform duration-300" />
                  </div>

                  {/* Text Content */}
                  <h3 className="text-2xl font-bold mb-3 text-slate-900 group-hover:text-blue-600 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed">
                    {f.desc}
                  </p>

                  {/* Arrow Indicator */}
                  <div className="mt-6 flex items-center text-blue-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Open Section <span className="ml-2">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;

