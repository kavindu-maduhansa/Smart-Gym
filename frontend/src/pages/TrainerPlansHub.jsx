import React from "react";
import { Link } from "react-router-dom";
import { FaClipboardList, FaUtensils, FaArrowRight } from "react-icons/fa";

const TrainerPlansHub = () => {
  const categories = [
    {
      id: "workout",
      title: "Workout Plans",
      desc: "Create and assign custom routines, templates, and high performance exercise plans.",
      icon: FaClipboardList,
      path: "/trainer/plans",
      color: "from-orange to-orange/80"
    },
    {
      id: "meal",
      title: "Meal Plans",
      desc: "Design nutritional guides and manage custom dietary templates for your students.",
      icon: FaUtensils,
      path: "/trainer/meal-plans",
      color: "from-blue-500 to-blue-400"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 container mx-auto px-6 relative overflow-hidden">
      {/* Background Theme */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange rounded-full mix-blend-screen filter blur-3xl opacity-5 animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <header className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange to-white tracking-tighter mb-4">
            Manage Plans
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Manage training and nutrition plans. Choose a category to start drafting or assigning routines.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                to={cat.path}
                key={cat.id}
                className="group relative h-full flex flex-col"
              >
                <div className="h-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-10 hover:bg-white/10 hover:border-orange/30 transition-all duration-500 overflow-hidden">
                  {/* Decorative Background Icon */}
                  <Icon className="absolute -top-10 -right-10 text-[200px] text-white opacity-[0.02] group-hover:opacity-5 group-hover:scale-110 transition-all duration-700 pointer-events-none" />

                  {/* Icon Container */}
                  <div className={`w-20 h-20 bg-gradient-to-br ${cat.color} rounded-2xl flex items-center justify-center mb-10 shadow-2xl shadow-orange/20 group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className="text-black text-4xl" />
                  </div>

                  {/* Text Content */}
                  <h3 className="text-3xl font-black mb-4 tracking-tight group-hover:text-orange transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-gray-400 text-lg leading-relaxed mb-8">
                    {cat.desc}
                  </p>

                  <div className="mt-auto flex items-center gap-2 text-orange font-black uppercase text-sm tracking-widest">
                    Enter Category <FaArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
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

export default TrainerPlansHub;
