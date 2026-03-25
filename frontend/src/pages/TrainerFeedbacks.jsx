import React, { useState, useEffect } from "react";
import axios from "axios";

const TrainerFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/feedback/my-feedbacks", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFeedbacks(res.data);
      } catch (err) {
        console.error("Failed to fetch feedbacks", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  const averageRating = feedbacks.length 
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) 
    : 0;

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 relative">
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black -z-10"></div>
      
      <div className="max-w-6xl mx-auto">
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-orange uppercase tracking-widest">My Feedbacks</h2>
              <p className="text-gray-400 mt-2">See what your students are saying about your training sessions.</p>
            </div>
            <div className="mt-4 md:mt-0 text-center bg-black/50 p-4 rounded-xl border border-orange/30 shadow-lg">
              <p className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-1">Average Rating</p>
              <div className="text-4xl font-black text-orange">{averageRating} <span className="text-xl text-yellow-400">★</span></div>
              <p className="text-xs text-gray-500 mt-1">Based on {feedbacks.length} reviews</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-orange animate-pulse font-bold text-xl">Loading Feedbacks...</div>
        ) : feedbacks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedbacks.map((fb) => (
              <div key={fb._id} className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 hover:border-orange/50 transition-colors shadow-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-lg text-white">{fb.studentId?.name || "Unknown Student"}</h4>
                    <span className="text-xs text-gray-400">{new Date(fb.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex text-yellow-500 text-lg">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < fb.rating ? "opacity-100" : "opacity-30"}>★</span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed italic border-l-2 border-orange/50 pl-3">
                  "{fb.comment || "No comment provided."}"
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
            <h3 className="text-xl text-gray-400 font-bold mb-2">No Feedbacks Yet</h3>
            <p className="text-sm text-gray-500">Your students haven't left any reviews for your sessions yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerFeedbacks;
