import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const TrainerSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [sessionDate, setSessionDate] = useState(null);
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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showForm]);

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
        date: sessionDate ? format(sessionDate, "yyyy-MM-dd") : "", 
        time: sessionTime 
      };

      // UPDATED URL to match backend trainerRoutes.js
      await axios.post(API_URL, newSchedule, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchSchedules();
      setSessionName("");
      setSessionDate(null);
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

  const handleAttendance = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/${id}/attendance`, { attendanceStatus: status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state smoothly
      setSchedules(prev => prev.map(s => s._id === id ? { ...s, attendanceStatus: status } : s));
    } catch (err) {
      alert("Failed to update attendance.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 relative">
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black -z-10"></div>
      
      <div className="max-w-6xl mx-auto backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-orange uppercase tracking-widest">My Schedules</h2>
          <button onClick={() => setShowForm(true)} className="bg-orange px-6 py-2 rounded-lg font-bold hover:bg-orange/80 transition-all">
            + Add Session
          </button>
        </div>

        {/* Add Session Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-all"></div>
            <div className="relative z-10 flex items-center justify-center w-full h-full">
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl max-w-md w-full p-8">
                {/* Header */}
                <div className="backdrop-blur-md bg-gradient-to-r from-orange/20 to-orange/10 border-b border-orange/30 -mx-8 -mt-8 px-8 py-6 mb-6 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">Add New Session</h3>
                  <button
                    className="text-white/60 hover:text-white text-2xl font-bold transition"
                    onClick={() => setShowForm(false)}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleSave} className="flex flex-col gap-4 w-full">
                  {error && (
                    <div className="bg-red-600/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm font-semibold text-center">
                      {error}
                    </div>
                  )}
                  <label className="text-gray-300 font-semibold text-sm">
                    Session Name
                    <input
                      type="text"
                      className="mt-2 w-full rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange focus:border-orange transition"
                      value={sessionName}
                      onChange={(e) => setSessionName(e.target.value)}
                      placeholder="e.g. Morning Yoga"
                      required
                    />
                  </label>
                  <label className="text-gray-300 font-semibold text-sm">
                    Date
                    <div className="mt-2 w-full">
                      <DatePicker
                        portalId="root"
                        selected={sessionDate}
                        onChange={(date) => setSessionDate(date)}
                        className="w-full rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange focus:border-orange transition"
                        placeholderText="Select a date"
                        dateFormat="yyyy-MM-dd"
                        minDate={new Date()}
                        required
                      />
                    </div>
                  </label>
                  <label className="text-gray-300 font-semibold text-sm">
                    Time
                    <input
                      type="time"
                      className="mt-2 w-full rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange focus:border-orange transition"
                      value={sessionTime}
                      onChange={(e) => setSessionTime(e.target.value)}
                      required
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 bg-orange hover:bg-orange/90 disabled:bg-orange/50 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300"
                  >
                    {loading ? "Saving..." : "Create Session"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/10 text-orange uppercase text-xs tracking-widest">
              <tr>
                <th className="py-4 px-2">Session</th>
                <th className="py-4 px-2">Date</th>
                <th className="py-4 px-2">Time</th>
                <th className="py-4 px-2">Booked By</th>
                <th className="py-4 px-2">Attendance</th>
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
                  <td className="py-4 px-2">
                    {s.bookedBy ? (
                      <select 
                        value={s.attendanceStatus || 'Pending'}
                        onChange={(e) => handleAttendance(s._id, e.target.value)}
                        className={`text-xs font-bold px-2 py-1 rounded bg-black border border-white/20 outline-none cursor-pointer hover:border-orange transition-colors ${
                          s.attendanceStatus === 'Attended' ? 'text-green-500' : 
                          s.attendanceStatus === 'Absent' ? 'text-red-500' : 'text-yellow-500'
                        }`}
                      >
                        <option value="Pending" className="text-yellow-500">Pending</option>
                        <option value="Attended" className="text-green-500">Attended</option>
                        <option value="Absent" className="text-red-500">Absent</option>
                      </select>
                    ) : (
                      <span className="text-gray-600 italic text-xs">-</span>
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