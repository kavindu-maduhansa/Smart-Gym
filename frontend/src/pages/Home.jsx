import { Link, useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaBox, FaShoppingCart } from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();

  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTrainer, setExpandedTrainer] = useState(null);
  const [feedbacks, setFeedbacks] = useState({});
  const [fetchingFeedback, setFetchingFeedback] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/trainer/leaderboard");
        setTrainers(res.data);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const handleExpand = async (trainer) => {
    const trainerId = trainer.userId?._id;
    if (!trainerId) return;

    if (expandedTrainer === trainer._id) {
      setExpandedTrainer(null);
      return;
    }

    setExpandedTrainer(trainer._id);

    if (!feedbacks[trainer._id]) {
      setFetchingFeedback(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/feedback/trainer/${trainerId}`);
        const top3 = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
        setFeedbacks(prev => ({ ...prev, [trainer._id]: top3 }));
      } catch (err) {
        console.error("Error fetching feedback:", err);
      } finally {
        setFetchingFeedback(false);
      }
    }
  };

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
      route: "/disply-inventorys-user",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-slate-900 overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100"></div>
        {/* Subtle Grid Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        ></div>
        {/* Animated Blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-600/80">
                Smart Gym
              </span>
              <br />
              <span className="text-slate-900">Management System</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-slate-800 mb-8 leading-relaxed">
              Manage memberships, schedules, and fitness services efficiently. Your all-in-one solution for modern gym operations.
            </p>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
            <div className="text-center">
              <h3 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">100%</h3>
              <p className="text-slate-700">Feature Rich</p>
            </div>
            <div className="text-center">
              <h3 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">24/7</h3>
              <p className="text-slate-700">Accessible</p>
            </div>
            <div className="text-center">
              <h3 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">Real-time</h3>
              <p className="text-slate-700">Analytics</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-slate-700 text-lg">
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
                  className="group relative backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl p-6 sm:p-8 hover:bg-white/15 hover:border-blue-600/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-600/20 cursor-pointer"
                >
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/10 group-hover:to-blue-600/5 rounded-2xl transition-all duration-300"></div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-600/20 rounded-xl mb-4 sm:mb-6 group-hover:bg-blue-700/30 transition-colors duration-300">
                      <IconComponent className="text-blue-600 text-2xl sm:text-3xl" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-700 group-hover:text-slate-800 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>

                  {/* Border Glow on Hover */}
                  <div className="absolute inset-0 rounded-2xl border border-blue-600/0 group-hover:border-blue-600/50 transition-all duration-300 pointer-events-none"></div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Top Trainers Leaderboard Section */}
        <section id="leaderboard" className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-white/50 to-blue-50/50 rounded-3xl border border-white/50 shadow-xl mb-20 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Top <span className="text-blue-600">Trainers</span>
            </h2>
            <p className="text-slate-700 text-lg">
              Top performing trainers based on student feedback and ratings.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {loading ? (
              <div className="text-center py-12"><p className="text-slate-500 animate-pulse font-bold tracking-widest uppercase">Loading leaderboard...</p></div>
            ) : trainers.length > 0 ? (
              trainers.map((trainer, index) => {
                const isFirst = index === 0;
                const isSecond = index === 1;
                const isThird = index === 2;

                let cardStyle = "bg-white border-slate-200";
                let rankStyle = "bg-slate-100 text-slate-600";
                
                if (isFirst) {
                  cardStyle = "bg-gradient-to-r from-blue-50 to-white border-blue-200 shadow-blue-900/10";
                  rankStyle = "bg-blue-600 text-white shadow-lg shadow-blue-600/40";
                } else if (isSecond) {
                  cardStyle = "bg-gradient-to-r from-sky-50 to-white border-sky-200 shadow-sky-900/5";
                  rankStyle = "bg-sky-500 text-white shadow-lg shadow-sky-500/40";
                } else if (isThird) {
                  cardStyle = "bg-gradient-to-r from-slate-50 to-white border-slate-300 shadow-slate-900/5";
                  rankStyle = "bg-slate-400 text-white shadow-lg shadow-slate-400/40";
                }

                return (
                <div
                  key={trainer._id}
                  className={`flex flex-col rounded-2xl shadow-xl transition-all border overflow-hidden hover:-translate-y-1 hover:shadow-2xl cursor-pointer ${cardStyle}`}
                  onClick={() => handleExpand(trainer)}
                >
                  <div className="flex items-center justify-between p-6 md:px-8">
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-black ${rankStyle}`}>
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                          {trainer.userId?.name || "Unknown Trainer"}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">{trainer.userId?.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5 bg-slate-900 text-white px-4 py-1.5 rounded-full shadow-md">
                        <span className="text-lg font-bold">
                          {trainer.metrics?.avgRating?.toFixed(1) || "0.0"}
                        </span>
                        <svg className="w-5 h-5 text-yellow-400 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {expandedTrainer === trainer._id && (
                    <div className="px-6 md:px-8 pb-6 pt-4 border-t border-slate-100 bg-slate-50/50">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Recent Feedback</h4>
                      {fetchingFeedback && !feedbacks[trainer._id] ? (
                        <p className="text-sm text-blue-600 animate-pulse font-medium">Loading student feedback...</p>
                      ) : feedbacks[trainer._id]?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {feedbacks[trainer._id].map(fb => (
                            <div key={fb._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-bold text-slate-900 truncate pr-2">{fb.studentId?.name || "Student"}</span>
                                <div className="flex gap-0.5 text-yellow-400 text-xs shrink-0">
                                  {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-4 h-4 ${i < fb.rating ? "text-yellow-400" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                  ))}
                                </div>
                              </div>
                              {fb.comment && (
                                <p className="text-sm text-slate-600 italic">"{fb.comment}"</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                          <p className="text-sm text-slate-500 font-medium">No feedback is available for this trainer yet.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                );
              })
            ) : (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
                <p className="text-slate-500 font-medium text-lg">No trainers ranked yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="backdrop-blur-md bg-gradient-to-r from-blue-600/10 to-blue-600/5 border border-blue-600/30 rounded-3xl p-8 sm:p-12 md:p-16 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-slate-700 text-base sm:text-lg md:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto">
              Join thousands of gym owners and managers who are transforming their operations with our Smart Gym Management System.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <Link
                to="/register"
                className="px-8 sm:px-10 py-3 sm:py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-600/50 text-base sm:text-lg"
              >
                Get Started Now
              </Link>
              <Link
                to="/login"
                className="px-8 sm:px-10 py-3 sm:py-4 border-2 border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-700/10 transition-all duration-300 transform hover:scale-105 text-base sm:text-lg"
              >
                Already a Member?
              </Link>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-slate-500 text-sm sm:text-base">
            © 2024 Smart Gym Management System. All rights reserved.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Home;



