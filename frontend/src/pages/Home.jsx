import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-black pt-24">
      {/* Hero Section with Background Image */}
      <div
        className="relative min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/thumb-1920-692043.jpg')",
        }}
      >
        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-80"></div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="text-center mb-16 pt-20">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              Welcome to <span className="text-orange">Smart Gym</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue mb-8 drop-shadow-md">
              Your intelligent fitness companion for a healthier lifestyle
            </p>
            {/* Removed Get Started button */}
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            {/* Feature Card 1 */}
            <div
              className="bg-orange bg-opacity-30 backdrop-blur-lg p-8 rounded-xl shadow-lg hover:shadow-orange/70 transition duration-300 transform hover:scale-105 border-2 border-orange/60"
              style={{ boxShadow: "0 8px 32px 0 rgba(255,127,17,0.15)" }}
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                Track Progress
              </h3>
              <p className="text-white">
                Monitor your fitness journey with detailed analytics and
                insights
              </p>
            </div>

            {/* Feature Card 2 */}
            <div
              className="bg-orange bg-opacity-30 backdrop-blur-lg p-8 rounded-xl shadow-lg hover:shadow-orange/70 transition duration-300 transform hover:scale-105 border-2 border-orange/60"
              style={{ boxShadow: "0 8px 32px 0 rgba(255,127,17,0.15)" }}
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                Smart Analytics
              </h3>
              <p className="text-white">
                Get personalized recommendations based on your workout data
              </p>
            </div>

            {/* Feature Card 3 */}
            <div
              className="bg-orange bg-opacity-30 backdrop-blur-lg p-8 rounded-xl shadow-lg hover:shadow-orange/70 transition duration-300 transform hover:scale-105 border-2 border-orange/60"
              style={{ boxShadow: "0 8px 32px 0 rgba(255,127,17,0.15)" }}
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                Custom Plans
              </h3>
              <p className="text-white">
                Tailored workout plans designed to help you reach your goals
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div
            className="mt-20 bg-blue-dark bg-opacity-40 backdrop-blur-lg rounded-xl p-12 shadow-2xl border-2 border-orange"
            style={{ boxShadow: "0 8px 32px 0 rgba(0,36,77,0.12)" }}
          >
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-white mb-2">10K+</div>
                <div className="text-white text-lg">Active Users</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-white mb-2">50K+</div>
                <div className="text-white text-lg">Workouts Logged</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-white mb-2">95%</div>
                <div className="text-white text-lg">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-20 text-center pb-20">
            <h2 className="text-4xl font-bold text-orange mb-6 drop-shadow-lg">
              Ready to Transform Your Fitness?
            </h2>
            <p className="text-xl text-blue mb-8 drop-shadow-md">
              Join thousands of users who are already achieving their goals
            </p>
            <Link
              to="/register"
              className="inline-block bg-orange hover:bg-orange-dark text-white font-bold py-4 px-12 rounded-lg transition duration-300 transform hover:scale-105 shadow-2xl border-2 border-orange"
            >
              Start Your Journey Today
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t-2 border-orange py-8">
        <div className="container mx-auto px-4 text-center text-white">
          <p>
            <span className="text-orange">&copy; 2026 Smart Gym.</span> All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
