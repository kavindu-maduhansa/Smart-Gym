import React, { useState, useEffect } from "react";
import axios from "axios";

const Leaderboard = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Change this URL if your backend port is different
        const res = await axios.get("http://localhost:5000/api/leaderboard");
        setTrainers(res.data);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <div className="text-yellow-400 p-20 text-center animate-pulse">Ranking Trainers...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-24 px-4 md:px-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center tracking-wide uppercase">
          Trainer <span className="text-yellow-400">Leaderboard</span>
        </h1>

        <div className="space-y-4">
          {trainers.length > 0 ? (
            trainers.map((trainer, index) => (
              <div
                key={trainer._id}
                className={`flex items-center justify-between rounded-xl shadow-lg px-8 py-5 transition-all border bg-gradient-to-br ${
                  index === 0
                    ? "from-yellow-700/60 to-yellow-900/80 border-yellow-400"
                    : index === 1
                    ? "from-gray-700/60 to-gray-900/80 border-gray-400"
                    : index === 2
                    ? "from-amber-700/60 to-amber-900/80 border-amber-600"
                    : "from-gray-900/60 to-gray-950/80 border-gray-800"
                }`}
              >
                <div className="flex items-center gap-6">
                  <span className="text-2xl font-bold text-gray-300 w-10 text-center">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                  </span>
                  {/* No profile photo shown as requested */}
                  <div>
                    <span className="text-lg font-semibold text-white tracking-wide block">
                      {trainer.userId?.name || "Unknown Trainer"}
                    </span>
                    <span className="text-sm text-gray-400 block">{trainer.userId?.email}</span>
                  </div>
                </div>
                <span className="text-lg font-mono text-yellow-300 font-bold flex items-center gap-1">
                  {trainer.metrics?.avgRating?.toFixed(1) || "0.0"}
                  <span className="text-yellow-300 text-xl">★</span>
                </span>
              </div>
            ))
          ) : (
            <div className="p-20 text-center text-gray-500 italic">No trainers ranked yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;