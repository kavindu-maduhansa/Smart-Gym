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

  const goFeature = (feature) => {
    const token = localStorage.getItem("token");
    if (feature.title === "Schedules" && !token) {
      navigate("/login");
    } else {
      navigate(feature.route);
    }
  };

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
            <p className="hero-eyebrow mb-6">Modern gyms · happier members · less admin</p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
                Smart Gym
              </span>
              <br />
              <span className="text-slate-900">Management System</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-slate-700 mb-10 leading-relaxed max-w-3xl mx-auto">
              Manage memberships, schedules, and fitness services in one calm, clear place—built for admins, trainers, and members.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
              <Link to="/register" className="ui-btn-primary px-8 text-base shadow-md shadow-blue-600/20">
                Create free account
              </Link>
              <a href="#features" className="ui-btn-ghost px-8 text-base">
                Explore features
              </a>
              <Link to="/contact" className="inline-flex min-h-[44px] items-center justify-center rounded-lg border-2 border-slate-300 bg-white/90 px-5 py-2.5 text-sm font-bold text-slate-800 shadow-sm transition hover:border-blue-400 hover:bg-blue-50/80">
                Talk to us
              </Link>
            </div>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-16 max-w-3xl mx-auto">
            {[
              { n: "100%", l: "Feature rich", d: "Schedules, store, inventory & more" },
              { n: "24/7", l: "Self‑service", d: "Access your tools whenever you need" },
              { n: "Live", l: "Connected", d: "Dashboards that stay in sync" },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-2xl border border-slate-200/90 bg-white/80 px-6 py-5 text-center shadow-md backdrop-blur-sm transition hover:border-blue-200 hover:shadow-lg"
              >
                <h3 className="text-3xl font-bold text-blue-600 sm:text-4xl">{s.n}</h3>
                <p className="mt-1 font-semibold text-slate-900">{s.l}</p>
                <p className="mt-2 text-xs text-slate-600 leading-snug">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="section-intro">
            <p className="section-kicker mb-2">Platform</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Powerful features
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              Everything you need to run the front desk, the training floor, and member services—without the clutter.
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => goFeature(feature)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      goFeature(feature);
                    }
                  }}
                  className="group tile-interactive"
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-600/15 rounded-xl mb-4 sm:mb-6 group-hover:bg-blue-600/25 transition-colors duration-300">
                      <IconComponent className="text-blue-600 text-2xl sm:text-3xl" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 group-hover:text-slate-700 transition-colors duration-300 leading-relaxed">
                      {feature.description}
                    </p>
                    <p className="mt-4 text-xs font-bold uppercase tracking-wider text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Open →
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Top Trainers Leaderboard Section */}
        <section
          id="leaderboard"
          className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 mb-20 rounded-3xl border border-blue-100/80 bg-gradient-to-br from-white via-blue-50/30 to-white shadow-xl shadow-blue-600/5"
        >
          <div className="text-center mb-12 sm:mb-16">
            <p className="section-kicker mb-2">Community</p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
              Top <span className="text-blue-600">trainers</span>
            </h2>
            <p className="text-slate-600 text-lg max-w-xl mx-auto leading-relaxed">
              Celebrating coaches members love—ranked from real feedback and ratings.
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
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="marketing-panel overflow-hidden border-blue-200/60 bg-gradient-to-br from-blue-600/8 via-white to-blue-50/40 p-8 text-center sm:p-12 md:p-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-slate-900 sm:mb-6">
              Ready to streamline your gym?
            </h2>
            <p className="text-slate-600 text-base sm:text-lg md:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
              Get your team on one calm dashboard—fewer spreadsheets, clearer days, happier members.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link to="/register" className="ui-btn-primary px-8 text-base justify-center sm:min-w-[200px]">
                Get started
              </Link>
              <Link to="/login" className="ui-btn-ghost px-8 text-base justify-center sm:min-w-[200px]">
                Log in
              </Link>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20 text-center border-t border-slate-200/80 pt-12">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Smart Gym Management System. Crafted for clarity.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Home;



