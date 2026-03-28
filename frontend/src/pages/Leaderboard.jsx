import React, { useState, useEffect } from "react";
import axios from "axios";

const Leaderboard = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTrainer, setExpandedTrainer] = useState(null);
  const [feedbacks, setFeedbacks] = useState({});
  const [fetchingFeedback, setFetchingFeedback] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Change this URL if your backend port is different
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
      setExpandedTrainer(null); // toggle off
      return;
    }

    setExpandedTrainer(trainer._id);

    // Fetch only if we haven't already
    if (!feedbacks[trainer._id]) {
      setFetchingFeedback(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/feedback/trainer/${trainerId}`);
        // Keep top 3 most recent
        const top3 = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
        setFeedbacks(prev => ({ ...prev, [trainer._id]: top3 }));
      } catch (err) {
        console.error("Error fetching feedback:", err);
      } finally {
        setFetchingFeedback(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-blue-600 text-2xl animate-pulse font-bold uppercase tracking-widest">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-100 text-slate-900 pt-24 px-4 md:px-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center tracking-wide uppercase">
          Trainer <span className="text-yellow-400">Leaderboard</span>
        </h1>

        <div className="space-y-4">
          {trainers.length > 0 ? (
            trainers.map((trainer, index) => (
              <div
                key={trainer._id}
                className={`flex flex-col rounded-xl shadow-lg transition-all border bg-gradient-to-br overflow-hidden ${index === 0
                  ? "from-yellow-700/60 to-yellow-900/80 border-yellow-400"
                  : index === 1
                    ? "from-gray-700/60 to-gray-900/80 border-gray-400"
                    : index === 2
                      ? "from-amber-700/60 to-amber-900/80 border-amber-600"
                      : "from-gray-900/60 to-gray-950/80 border-gray-800"
                  }`}
              >
                <div
                  className="flex items-center justify-between px-8 py-5 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => handleExpand(trainer)}
                >
                  <div className="flex items-center gap-6">
                    <span className="text-2xl font-bold text-slate-700 w-10 text-center">
                      {index === 0 ? "1" : index === 1 ? "2" : index === 2 ? "3" : `#${index + 1}`}
                    </span>
                    <div>
                      <span className="text-lg font-semibold text-slate-900 tracking-wide block group-hover:text-yellow-400 transition-colors">
                        {trainer.userId?.name || "Unknown Trainer"}
                      </span>
                      <span className="text-sm text-slate-500 block">{trainer.userId?.email}</span>
                    </div>
                  </div>
                  <span className="text-lg font-mono text-yellow-300 font-bold flex items-center gap-1">
                    {trainer.metrics?.avgRating?.toFixed(1) || "0.0"}
                    <span className="text-yellow-300 text-xl">★</span>
                  </span>
                </div>

                {expandedTrainer === trainer._id && (
                  <div className="px-8 pb-5 pt-2 border-t border-slate-200 bg-blue-50/20">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Recent Feedbacks</h4>
                    {fetchingFeedback && !feedbacks[trainer._id] ? (
                      <p className="text-xs text-slate-600 italic animate-pulse">Loading feedback...</p>
                    ) : feedbacks[trainer._id]?.length > 0 ? (
                      <div className="space-y-3">
                        {feedbacks[trainer._id].map(fb => (
                          <div key={fb._id} className="bg-blue-50/30 p-3 rounded-lg border border-white/5 backdrop-blur-sm shadow-inner">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-bold text-blue-600">{fb.studentId?.name || "Student"}</span>
                              <span className="text-xs text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className={i < fb.rating ? "opacity-100" : "opacity-30"}>★</span>
                                ))}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 italic leading-relaxed">"{fb.comment || "No comment."}"</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600 italic">No feedback is available for this trainer yet.</p>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-20 text-center text-slate-600 italic">No trainers ranked yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

