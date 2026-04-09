import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TrainerFeedbacks = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.rating-dropdown') && !e.target.closest('.date-dropdown')) {
        setIsRatingOpen(false);
        setIsDateOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, ratingFilter, dateFilter]);

  const averageRating = feedbacks.length 
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) 
    : 0;

  const filteredFeedbacks = feedbacks.filter(fb => {
    const matchesSearch = fb.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === "All" || fb.rating === parseInt(ratingFilter);
    
    let matchesDate = true;
    if (dateFilter !== "All") {
      const fbDate = new Date(fb.createdAt);
      const now = new Date();
      if (dateFilter === "Today") {
        matchesDate = fbDate.toDateString() === now.toDateString();
      } else if (dateFilter === "Last 7 Days") {
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        matchesDate = fbDate >= weekAgo;
      } else if (dateFilter === "Last 30 Days") {
        const monthAgo = new Date(now.setDate(now.getDate() - 30));
        matchesDate = fbDate >= monthAgo;
      }
    }
    
    return matchesSearch && matchesRating && matchesDate;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFeedbacks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);

  return (
    <div className="page-bg-base pt-24 px-6 relative">
      <div className="fixed inset-0 ambient-gradient -z-10"></div>
      
      <div className="max-w-6xl mx-auto">
        {/* Back to Dashboard Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => navigate("/trainer-dashboard")}
            className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 active:scale-95 text-sm"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="backdrop-blur-md bg-slate-50 border border-slate-200 rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-blue-600 tracking-tight">My Feedbacks</h2>
              <p className="text-slate-500 mt-2">See what your students are saying about your training sessions.</p>
            </div>
            <div className="mt-4 md:mt-0 text-center bg-blue-50/50 p-4 rounded-xl border border-blue-600/30 shadow-lg">
              <p className="text-sm font-bold text-slate-700 tracking-tight mb-1">Average Rating</p>
              <div className="text-4xl font-black text-blue-600">{averageRating} <span className="text-xl text-yellow-400">★</span></div>
              <p className="text-xs text-slate-600 mt-1">Based on {feedbacks.length} reviews</p>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <input
            type="text"
            placeholder="Search student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-600/50 transition-all font-medium placeholder:text-slate-500 shadow-sm"
          />
          
          <div className="relative w-full rating-dropdown">
            <button
              onClick={() => {
                setIsRatingOpen(!isRatingOpen);
                setIsDateOpen(false);
              }}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 flex items-center justify-between hover:border-blue-600/50 transition-all font-medium focus:outline-none shadow-sm"
            >
              <span>{ratingFilter === "All" ? "All Ratings" : `${ratingFilter} Stars`}</span>
              <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isRatingOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isRatingOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {["All", 5, 4, 3, 2, 1].map((val) => (
                  <button
                    key={val}
                    onClick={() => {
                      setRatingFilter(val);
                      setIsRatingOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-blue-50 ${ratingFilter === val ? 'bg-blue-50 text-blue-700' : 'text-slate-700'}`}
                  >
                    {val === "All" ? "All Ratings" : `${val} Stars`}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative w-full date-dropdown">
            <button
              onClick={() => {
                setIsDateOpen(!isDateOpen);
                setIsRatingOpen(false);
              }}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 flex items-center justify-between hover:border-blue-600/50 transition-all font-medium focus:outline-none shadow-sm"
            >
              <span>{dateFilter === "All" ? "All Time" : dateFilter}</span>
              <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDateOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDateOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {["All", "Today", "Last 7 Days", "Last 30 Days"].map((val) => (
                  <button
                    key={val}
                    onClick={() => {
                      setDateFilter(val);
                      setIsDateOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-blue-50 ${dateFilter === val ? 'bg-blue-50 text-blue-700' : 'text-slate-700'}`}
                  >
                    {val === "All" ? "All Time" : val}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-blue-600 animate-pulse font-bold text-xl">Loading Feedbacks...</div>
        ) : filteredFeedbacks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {currentItems.map((fb) => (
              <div key={fb._id} className="backdrop-blur-md bg-slate-50 border border-slate-200 rounded-xl p-6 hover:border-blue-600/50 transition-colors shadow-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-lg text-slate-900">{fb.studentId?.name || "Unknown Student"}</h4>
                    <span className="text-xs text-slate-500">{new Date(fb.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex text-yellow-500 text-lg">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < fb.rating ? "opacity-100" : "opacity-30"}>★</span>
                    ))}
                  </div>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed italic border-l-2 border-blue-600/50 pl-3">
                  "{fb.comment || "No comment provided."}"
                </p>
              </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mb-10">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-30 transition-all shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-lg font-bold transition-all shadow-sm ${currentPage === i + 1 
                      ? 'bg-blue-600 text-white shadow-blue-600/20' 
                      : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-600/50 hover:text-blue-600'}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-30 transition-all shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-slate-50 border border-slate-200 rounded-2xl">
            <h3 className="text-xl text-slate-500 font-bold mb-2">No Feedbacks Yet</h3>
            <p className="text-sm text-slate-600">Your students haven't left any reviews for your sessions yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerFeedbacks;



