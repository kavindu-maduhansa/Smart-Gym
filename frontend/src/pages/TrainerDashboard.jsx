import React from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaUsers, FaClipboardList, FaStar } from "react-icons/fa";

const TrainerDashboard = () => {
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
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(59,130,246,0.12) 1px, transparent 1px), linear-gradient(rgba(59,130,246,0.12) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-blue-600 mix-blend-screen opacity-10 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-blue-600 mix-blend-screen opacity-[0.06] blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 container mx-auto px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <header className="dashboard-hero mb-10 sm:mb-14">
          <p className="section-kicker mb-2">Trainer workspace</p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
              Trainer
            </span>{" "}
            dashboard
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-600 sm:text-lg leading-relaxed">
            Schedules, students, and plans—open a card below to get to work. Tab to each link, then Enter to open.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {trainerFeatures.map((f) => {
            const Icon = f.icon;
            return (
              <Link
                to={f.path}
                key={f.id}
                className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <div className="tile-interactive flex h-full min-h-[220px] flex-col">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-blue-600/15 transition-colors duration-300 group-hover:bg-blue-600/25">
                    <Icon className="text-3xl text-blue-600 transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-700 sm:text-2xl">
                    {f.title}
                  </h3>
                  <p className="flex-1 text-sm leading-relaxed text-slate-600">
                    {f.desc}
                  </p>
                  <div className="mt-6 flex items-center text-sm font-bold text-blue-600 opacity-80 transition group-hover:opacity-100">
                    Open <span className="ml-2 transition group-hover:translate-x-0.5">→</span>
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

