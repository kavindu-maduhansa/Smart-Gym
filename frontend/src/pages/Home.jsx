import { Link, useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaBox, FaShoppingCart } from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      id: 1,
      icon: FaShoppingCart,
      title: "Supplements",
      description: "Browse and request gym supplements online.",
      route: "/supplement-store",
    },
    {
      id: 2,
      icon: FaCalendarAlt,
      title: "Schedules",
      description: "Organize gym sessions and time slots seamlessly.",
      route: "/schedules",
    },
    {
      id: 3,
      icon: FaBox,
      title: "Inventories",
      description: "Manage gym equipment and resources effectively.",
      route: "/inventory-management",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        {/* Subtle Grid Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(255,127,17,0.1) 1px, transparent 1px), linear-gradient(rgba(255,127,17,0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        ></div>
        {/* Animated Blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-orange rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange to-orange/80">
                Smart Gym
              </span>
              <br />
              <span className="text-white">Management System</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Manage memberships, schedules, and fitness services efficiently. Your all-in-one solution for modern gym operations.
            </p>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
            <div className="text-center">
              <h3 className="text-3xl sm:text-4xl font-bold text-orange mb-2">100%</h3>
              <p className="text-gray-300">Feature Rich</p>
            </div>
            <div className="text-center">
              <h3 className="text-3xl sm:text-4xl font-bold text-orange mb-2">24/7</h3>
              <p className="text-gray-300">Accessible</p>
            </div>
            <div className="text-center">
              <h3 className="text-3xl sm:text-4xl font-bold text-orange mb-2">Real-time</h3>
              <p className="text-gray-300">Analytics</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-gray-400 text-lg">
              Everything you need to manage your gym operations efficiently
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.id}
                  onClick={() => {
                    const token = localStorage.getItem("token");
                    if (feature.title === "Schedules" && !token) {
                      navigate("/login");
                    } else {
                      navigate(feature.route);
                    }
                  }}
                  className="group relative backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 sm:p-8 hover:bg-white/15 hover:border-orange/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-orange/20 cursor-pointer"
                >
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange/0 to-orange/0 group-hover:from-orange/10 group-hover:to-orange/5 rounded-2xl transition-all duration-300"></div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-orange/20 rounded-xl mb-4 sm:mb-6 group-hover:bg-orange/30 transition-colors duration-300">
                      <IconComponent className="text-orange text-2xl sm:text-3xl" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>

                  {/* Border Glow on Hover */}
                  <div className="absolute inset-0 rounded-2xl border border-orange/0 group-hover:border-orange/50 transition-all duration-300 pointer-events-none"></div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="backdrop-blur-md bg-gradient-to-r from-orange/10 to-orange/5 border border-orange/30 rounded-3xl p-8 sm:p-12 md:p-16 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-gray-300 text-base sm:text-lg md:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto">
              Join thousands of gym owners and managers who are transforming their operations with our Smart Gym Management System.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <Link
                to="/register"
                className="px-8 sm:px-10 py-3 sm:py-4 bg-orange text-white font-bold rounded-lg hover:bg-orange/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-orange/50 text-base sm:text-lg"
              >
                Get Started Now
              </Link>
              <Link
                to="/login"
                className="px-8 sm:px-10 py-3 sm:py-4 border-2 border-orange text-orange font-bold rounded-lg hover:bg-orange/10 transition-all duration-300 transform hover:scale-105 text-base sm:text-lg"
              >
                Already a Member?
              </Link>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-gray-400 text-sm sm:text-base">
            © 2024 Smart Gym Management System. All rights reserved.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Home;
