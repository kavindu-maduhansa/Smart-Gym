import React from "react";
import { useNavigate } from "react-router-dom";
import RecentActivity from "../components/RecentActivity";
import gymBg from "../assets/gym-bg.jpg"; // Import the image

const AdminInventoryDashboard = () => {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  const handleNavigation = (path) => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate(path);
    }, 400);
  };

  const cards = [
    {
      title: "ADD MACHINE",
      desc: "Create new entry for machine and target components.",
      btn: "Add",
      onClick: () => handleNavigation("/admin/add-item"),
      icon: "➕",
    },
    {
      title: "MANAGE MACHINES",
      desc: "Active Machines",
      btn: "Manage",
      onClick: () => handleNavigation("/admin/manage"),
      icon: "⚙️",
    },
    {
      title: "ALL INVENTORIES",
      desc: "Items in Stock",
      btn: "View All",
      onClick: () => handleNavigation("/admin/inventory"),
      icon: "📦",
    },
    {
      title: "GENERATE REPORT",
      desc: "Last Report: Today",
      btn: "Generate",
      onClick: () => alert("Coming soon"),
      icon: "📊",
    },
  ];

  return (
    <div 
      className="min-h-screen text-white flex flex-col bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.65) 0%, rgba(20, 24, 36, 0.7) 100%), url('${gymBg}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <style>{`
        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .transitioning-out {
          animation: slideOutRight 0.4s ease-in-out forwards;
        }
      `}</style>

      <div className={`relative z-10 flex flex-col min-h-screen ${isTransitioning ? 'transitioning-out' : ''}`}>

        {/* ================= TOP NAV ================= */}
        <header className="flex justify-between items-center px-8 py-5 bg-gradient-to-r from-[#141824]/95 via-[#141824]/90 to-[#1a1f2e]/90 backdrop-blur-xl border-b border-orange-500/30 shadow-xl">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
            💪 Gym Management System
          </h1>

          <nav className="flex gap-6 text-gray-300 font-medium">
            <span className="hover:text-orange-400 cursor-pointer transition duration-300">Home</span>
            <span className="hover:text-orange-400 cursor-pointer transition duration-300">About</span>
            <span className="hover:text-orange-400 cursor-pointer transition duration-300">Schedules</span>
            <span className="hover:text-orange-400 cursor-pointer transition duration-300">Contact</span>
            <span className="hover:text-orange-400 cursor-pointer transition duration-300">Dashboard</span>
            <span className="hover:text-orange-400 cursor-pointer transition duration-300">Store</span>
          </nav>

          <button className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-orange-500/50 font-semibold transition duration-300">
            Logout
          </button>
        </header>

        <div className="flex flex-1 w-full">

          {/* ================= MAIN ================= */}
          <main className="flex-1 p-8 w-full">

            {/* TITLE */}
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-white mb-2">Welcome to Admin Dashboard</h2>
              <p className="text-gray-300 font-medium">Manage your gym inventory efficiently</p>
            </div>

            {/* CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

              {cards.map((card, i) => (
                <div
                  key={i}
                  className="group bg-gradient-to-br from-[#1a1f2e]/85 to-[#0f1117]/85 backdrop-blur-md p-6 rounded-2xl border border-orange-400/30 shadow-xl hover:shadow-2xl hover:shadow-orange-500/40 hover:border-orange-400/60 transition duration-300 transform hover:-translate-y-2 cursor-pointer"
                >
                  <div className="text-5xl mb-3 group-hover:scale-125 transition duration-300">{card.icon}</div>

                  <h2 className="mt-3 font-bold text-lg text-orange-400 group-hover:text-orange-300 transition">
                    {card.title}
                  </h2>

                  <p className="text-gray-400 text-sm mt-1 group-hover:text-gray-300 transition">
                    {card.desc}
                  </p>

                  <button
                    onClick={card.onClick}
                    className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold shadow-lg hover:shadow-orange-500/50 transition duration-300 transform hover:scale-105"
                  >
                    {card.btn} →
                  </button>
                </div>
              ))}

            </div>

            {/* LOWER SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* RECENT ACTIVITY */}
              <div className="bg-gradient-to-br from-[#1a1f2e]/85 to-[#0f1117]/85 backdrop-blur-md p-6 rounded-2xl border border-orange-400/30 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                    ⏱ Recent Activity
                  </h3>
                  <button className="text-sm text-orange-400 hover:text-orange-300 transition font-semibold">
                    🔄 Refresh
                  </button>
                </div>

                <RecentActivity />
              </div>

              {/* STATS */}
              <div className="bg-gradient-to-br from-[#1a1f2e]/85 to-[#0f1117]/85 backdrop-blur-md p-6 rounded-2xl border border-orange-400/30 shadow-xl">
                <h3 className="text-lg font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent mb-6">
                  📈 Inventory Stats
                </h3>

                <div className="space-y-4">

                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-400/20 rounded-xl hover:border-orange-400/50 transition">
                    <span className="font-medium text-gray-200">Total Items</span>
                    <span className="text-2xl font-bold text-orange-400">150</span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-400/20 rounded-xl hover:border-green-400/50 transition">
                    <span className="font-medium text-gray-200">Available</span>
                    <span className="text-2xl font-bold text-green-400">128</span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-400/20 rounded-xl hover:border-red-400/50 transition">
                    <span className="font-medium text-gray-200">Out of Stock</span>
                    <span className="text-2xl font-bold text-red-400">12</span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-400/20 rounded-xl hover:border-yellow-400/50 transition">
                    <span className="font-medium text-gray-200">Maintenance</span>
                    <span className="text-2xl font-bold text-yellow-400">10</span>
                  </div>

                </div>
              </div>

            </div>

          </main>
        </div>

      </div>
    </div>
  );
};

export default AdminInventoryDashboard;