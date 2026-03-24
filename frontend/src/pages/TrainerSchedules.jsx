import React, { useState, useEffect } from "react";
import axios from "axios";

const TrainerSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // BASE URL - Adjust if your backend port is different
  const API_URL = "http://localhost:5000/api/trainer/schedules";

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchedules(res.data);
    } catch (err) {
      console.error("Failed to fetch schedules:", err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!sessionName || !sessionDate || !sessionTime) {
      setError("All fields (Name, Date, and Time) are required.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const newSchedule = { 
        title: sessionName, 
        date: sessionDate, 
        time: sessionTime 
      };

      // UPDATED URL to match backend trainerRoutes.js
      await axios.post(API_URL, newSchedule, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchSchedules();
      setSessionName("");
      setSessionDate("");
      setSessionTime("");
      setShowForm(false);
    } catch (err) {
      // Improved error message for debugging
      setError(err.response?.data?.message || "Server Error. Ensure you are logged in as a Trainer.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this session?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchSchedules(); // Refresh the list
      } catch (err) {
        alert("Failed to delete the session.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 relative">
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black -z-10"></div>
      
      <div className="max-w-6xl mx-auto backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-orange uppercase tracking-widest">My Schedules</h2>
          <button onClick={() => setShowForm(!showForm)} className="bg-orange px-6 py-2 rounded-lg font-bold hover:bg-orange/80 transition-all">
            {showForm ? "Cancel" : "+ Add Session"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSave} className="mb-10 p-6 border border-orange/30 rounded-xl bg-white/5 animate-fadeIn">
            {error && <p className="text-red-500 mb-4 bg-red-500/10 p-2 rounded border border-red-500/20 text-sm font-bold">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input 
                type="text" placeholder="Session Name" value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                className="bg-black border border-white/20 p-2 rounded focus:border-orange outline-none"
              />
              <input 
                type="date" value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="bg-black border border-white/20 p-2 rounded focus:border-orange outline-none"
              />
              <input 
                type="time" value={sessionTime}
                onChange={(e) => setSessionTime(e.target.value)}
                className="bg-black border border-white/20 p-2 rounded focus:border-orange outline-none"
              />
              <button type="submit" disabled={loading} className="bg-white text-black font-bold py-2 rounded hover:bg-orange hover:text-white transition-all">
                {loading ? "Saving..." : "Save Session"}
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/10 text-orange uppercase text-xs tracking-widest">
              <tr>
                <th className="py-4 px-2">Session</th>
                <th className="py-4 px-2">Date</th>
                <th className="py-4 px-2">Time</th>
                <th className="py-4 px-2">Booked By</th>
                <th className="py-4 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-2 font-medium">{s.title}</td>
                  <td className="py-4 px-2 text-gray-400">{s.date}</td>
                  <td className="py-4 px-2 text-gray-400">{s.time}</td>
                  <td className="py-4 px-2">
                    {s.bookedBy ? (
                      <span className="text-orange font-bold text-sm">
                        {s.bookedBy.name || "Student Assigned"}
                      </span>
                    ) : (
                      <span className="text-gray-600 italic text-xs">Available</span>
                    )}
                  </td>
                  <td className="py-4 px-2 text-right">
                    <button 
                      onClick={() => handleDelete(s._id)}
                      className="text-red-500 hover:text-red-400 text-sm font-bold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {schedules.length === 0 && (
            <div className="text-center py-10 text-gray-500 italic">No sessions found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerSchedules;