import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section with Background Image */}
      <div 
        className="relative min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/thumb-1920-692043.jpg')",
        }}
      >
        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-70"></div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="text-center mb-16 pt-20">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              Welcome to <span className="text-blue-500">Smart Gym</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 drop-shadow-md">
              Your intelligent fitness companion for a healthier lifestyle
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-lg transition duration-300 transform hover:scale-105 shadow-xl"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 text-white font-bold py-4 px-8 rounded-lg transition duration-300 transform hover:scale-105 shadow-xl border-2 border-white"
              >
                Sign In
              </Link>
            </div>
          </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-black bg-opacity-50 backdrop-blur-sm p-8 rounded-xl shadow-2xl hover:shadow-blue-500/50 transition duration-300 transform hover:scale-105 border border-gray-700">
            <div className="text-blue-500 text-5xl mb-4">💪</div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Track Progress
            </h3>
            <p className="text-gray-300">
              Monitor your fitness journey with detailed analytics and insights
            </p>
          </div>

          <div className="bg-black bg-opacity-50 backdrop-blur-sm p-8 rounded-xl shadow-2xl hover:shadow-blue-500/50 transition duration-300 transform hover:scale-105 border border-gray-700">
            <div className="text-blue-500 text-5xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Smart Analytics
            </h3>
            <p className="text-gray-300">
              Get personalized recommendations based on your workout data
            </p>
          </div>

          <div className="bg-black bg-opacity-50 backdrop-blur-sm p-8 rounded-xl shadow-2xl hover:shadow-blue-500/50 transition duration-300 transform hover:scale-105 border border-gray-700">
            <div className="text-blue-500 text-5xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-white mb-4">Custom Plans</h3>
            <p className="text-gray-300">
              Tailored workout plans designed to help you reach your goals
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-black bg-opacity-60 backdrop-blur-md rounded-xl p-12 shadow-2xl border border-gray-700">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-blue-500 mb-2">10K+</div>
              <div className="text-gray-300 text-lg">Active Users</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-blue-500 mb-2">50K+</div>
              <div className="text-gray-300 text-lg">Workouts Logged</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-blue-500 mb-2">95%</div>
              <div className="text-gray-300 text-lg">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center pb-20">
          <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
            Ready to Transform Your Fitness?
          </h2>
          <p className="text-xl text-gray-200 mb-8 drop-shadow-md">
            Join thousands of users who are already achieving their goals
          </p>
          <Link
            to="/register"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-12 rounded-lg transition duration-300 transform hover:scale-105 shadow-2xl"
          >
            Start Your Journey Today
          </Link>
        </div>
      </div>
    </div>

    {/* Footer */}
    <footer className="bg-gray-900 border-t border-gray-800 py-8">
      <div className="container mx-auto px-4 text-center text-gray-400">
        <p>&copy; 2026 Smart Gym. All rights reserved.</p>
      </div>
    </footer>
  </div>
  );
};

export default Home;
