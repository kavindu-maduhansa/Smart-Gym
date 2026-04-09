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
      <div className="page-bg-base flex items-center justify-center">
        <div className="text-blue-600 text-2xl animate-pulse font-bold uppercase tracking-widest">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg-base pt-24 px-4 md:px-10 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Trainer <span className="text-blue-600">Leaderboard</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">Top performing trainers based on student feedback and ratings.</p>
        </div>

        <div className="space-y-6">
          {trainers.length > 0 ? (
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
                            <p className="text-sm text-slate-600 italic">"{fb.comment || "No comment."}"</p>
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
      </div>
    </div>
  );
};

export default Leaderboard;

