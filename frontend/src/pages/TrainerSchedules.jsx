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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("Upcoming");
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

    const now = new Date();
    const selectedDateTime = new Date(`${format(sessionDate, "yyyy-MM-dd")}T${sessionTime || "00:00"}`);

    if (selectedDateTime < now) {
      setError("Session cannot be scheduled in the past. Please select a future date and time.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const scheduleData = {
        title: sessionName,
        date: sessionDate ? format(sessionDate, "yyyy-MM-dd") : "",
        time: sessionTime
      };

      if (editId) {
        await axios.put(`${API_URL}/${editId}`, scheduleData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(API_URL, scheduleData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      fetchSchedules();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Server Error. Ensure you are logged in as a Trainer.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (s) => {
    setEditId(s._id);
    setSessionName(s.title);
    setSessionDate(new Date(s.date));
    setSessionTime(s.time);
    setShowForm(true);
  };

  const closeModal = () => {
    setShowForm(false);
    setEditId(null);
    setSessionName("");
    setSessionDate(null);
    setSessionTime("");
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

  const filteredSchedules = schedules.filter(s => {
    const studentName = s.bookedBy?.name || "";
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentName.toLowerCase().includes(searchTerm.toLowerCase());

    const sessionDateTime = new Date(`${s.date}T${s.time || "00:00"}`);
    const now = new Date();
    const isExpired = sessionDateTime < now;

    let matchesStatus = true;
    if (statusFilter === "Booked") {
      matchesStatus = !!s.bookedBy;
    } else if (statusFilter === "Available") {
      matchesStatus = !s.bookedBy && !isExpired;
    } else if (statusFilter === "Expired") {
      matchesStatus = !s.bookedBy && isExpired;
    } else if (statusFilter === "Pending") {
      matchesStatus = !!s.bookedBy && s.attendanceStatus === "Pending";
    } else if (statusFilter !== "All") {
      matchesStatus = s.attendanceStatus === statusFilter;
    }

    let matchesDate = true;
    if (dateFilter !== "All") {
      if (dateFilter === "Today") {
        matchesDate = new Date(s.date).toDateString() === now.toDateString();
      } else if (dateFilter === "Upcoming") {
        matchesDate = sessionDateTime >= now;
      } else if (dateFilter === "Past") {
        matchesDate = sessionDateTime < now;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  }).sort((a, b) => {
    const dateTimeA = new Date(`${a.date}T${a.time || "00:00"}`);
    const dateTimeB = new Date(`${b.date}T${b.time || "00:00"}`);
    const now = new Date();
    
    const isPastA = dateTimeA < now;
    const isPastB = dateTimeB < now;

    // Category sorting: Future first, Past last
    if (!isPastA && isPastB) return -1;
    if (isPastA && !isPastB) return 1;

    // Within same category:
    if (!isPastA) {
      return dateTimeA - dateTimeB; // Future: Earliest first
    } else {
      return dateTimeB - dateTimeA; // Past: Most recent first (at bottom)
    }
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSchedules.slice(indexOfFirstItem, indexOfLastItem);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlySchedules = schedules.filter(s => {
    const d = new Date(s.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const stats = {
    total: monthlySchedules.length,
    upcoming: monthlySchedules.filter(s => new Date(`${s.date}T${s.time || "00:00"}`) >= now).length,
    available: monthlySchedules.filter(s => !s.bookedBy && new Date(`${s.date}T${s.time || "00:00"}`) >= now).length,
    completed: monthlySchedules.filter(s => s.attendanceStatus === "Attended").length,
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 relative">
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black -z-10"></div>

      <div className="max-w-6xl mx-auto">
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div>
              <h2 className="text-3xl font-bold text-orange tracking-tight">My Schedules</h2>
              <p className="text-gray-400 mt-2">Manage your training sessions and track student attendance.</p>
            </div>
            <button onClick={() => setShowForm(true)} className="mt-4 md:mt-0 bg-orange px-6 py-2.5 rounded-xl font-bold hover:bg-orange/80 transition-all shadow-lg shadow-orange/20">
              + Add Session
            </button>
          </div>
        </div>

        {/* Integrated Performance Hub */}
        <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/10 rounded-3xl p-1 mb-8 shadow-2xl overflow-hidden group">
          <div className="flex flex-col lg:flex-row items-stretch">
            {/* Hub Header */}
            <div className="lg:w-1/4 p-6 bg-gradient-to-br from-orange/20 to-transparent border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-orange/10 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-orange/20 transition-all duration-700"></div>
               <h3 className="text-xl font-black text-white leading-tight relative z-10">Monthly<br /><span className="text-orange">Performance</span></h3>
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2 relative z-10">{format(now, 'MMMM yyyy')}</p>
            </div>
            
            {/* Stats Grid */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/5">
              {[
                { 
                  label: "Total Sessions", 
                  value: stats.total, 
                  icon: (
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  )
                },
                { 
                  label: "Upcoming", 
                  value: stats.upcoming, 
                  icon: (
                    <svg className="w-5 h-5 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )
                },
                { 
                  label: "Available", 
                  value: stats.available, 
                  icon: (
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  )
                },
                { 
                  label: "Completed", 
                  value: stats.completed, 
                  icon: (
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )
                },
              ].map((item, idx) => (
                <div key={idx} className="p-6 transition-all hover:bg-white/[0.03] relative group/stat overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-orange/0 to-transparent group-hover/stat:via-orange/40 transition-all duration-500"></div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center transition-all group-hover/stat:scale-110 group-hover/stat:border-orange/20 border border-white/5">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-2xl font-black text-white group-hover/stat:text-orange transition-colors tracking-tight">{item.value}</div>
                      <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5 whitespace-nowrap">{item.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <input
            type="text"
            placeholder="Search session or student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange/50 transition-all font-medium placeholder:text-gray-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange/50 transition-all cursor-pointer font-medium"
          >
            <option value="All" className="bg-gray-900">All Status</option>
            <option value="Booked" className="bg-gray-900">Booked</option>
            <option value="Available" className="bg-gray-900">Available</option>
            <option value="Expired" className="bg-gray-900">Expired</option>
            <option value="Pending" className="bg-gray-900">Pending Attendance</option>
            <option value="Attended" className="bg-gray-900">Attended</option>
            <option value="Absent" className="bg-gray-900">Absent</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange/50 transition-all cursor-pointer font-medium"
          >
            <option value="All" className="bg-gray-900">All Dates</option>
            <option value="Today" className="bg-gray-900">Today Only</option>
            <option value="Upcoming" className="bg-gray-900">Upcoming</option>
            <option value="Past" className="bg-gray-900">Past Sessions</option>
          </select>
        </div>

        {/* Add Session Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-all"></div>
            <div className="relative z-10 flex items-center justify-center w-full h-full">
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl max-w-md w-full p-8">
                {/* Header */}
                <div className="backdrop-blur-md bg-gradient-to-r from-orange/20 to-orange/10 border-b border-orange/30 -mx-8 -mt-8 px-8 py-6 mb-6 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">{editId ? 'Edit Session' : 'Add New Session'}</h3>
                  <button
                    className="text-white/60 hover:text-white text-2xl font-bold transition"
                    onClick={closeModal}
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
                    {loading ? "Saving..." : (editId ? "Update Session" : "Create Session")}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-white/10 backdrop-blur-md bg-white/5 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/10 border-b border-orange/20">
                  <th className="px-6 py-5 text-sm font-bold tracking-wider text-orange">Session</th>
                  <th className="px-6 py-5 text-sm font-bold tracking-wider text-orange text-center">Date</th>
                  <th className="px-6 py-5 text-sm font-bold tracking-wider text-orange text-center">Time</th>
                  <th className="px-6 py-5 text-sm font-bold tracking-wider text-orange">Student</th>
                  <th className="px-6 py-5 text-sm font-bold tracking-wider text-orange text-center">Attendance</th>
                  <th className="px-6 py-5 text-sm font-bold tracking-wider text-orange text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentItems.map((s) => {
                  const sessionDateTime = new Date(`${s.date}T${s.time || "00:00"}`);
                  const isExpired = sessionDateTime < new Date();

                  return (
                    <tr key={s._id} className={`hover:bg-white/5 transition-all group ${isExpired && !s.bookedBy ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-5">
                        <div className={`font-bold transition-colors ${isExpired && !s.bookedBy ? 'text-gray-500' : 'text-white group-hover:text-orange'}`}>
                          {s.title}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`${isExpired && !s.bookedBy ? 'text-gray-600' : 'text-gray-300'} text-sm font-medium`}>{s.date}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className={`inline-block px-3 py-1 bg-white/5 rounded-lg border font-bold text-xs ${isExpired && !s.bookedBy ? 'text-gray-600 border-white/5' : 'text-orange border-white/10'}`}>
                          {s.time}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {s.bookedBy ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-orange/20 rounded-full flex items-center justify-center text-[10px] text-orange font-bold border border-orange/30">
                              {s.bookedBy.name?.charAt(0)}
                            </div>
                            <span className="text-white font-bold text-sm tracking-tight">
                              {s.bookedBy.name}
                            </span>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-widest ${isExpired
                              ? 'bg-red-500/10 text-red-500/70 border-red-500/20'
                              : 'bg-white/5 text-gray-500 border border-white/10'
                            }`}>
                            {isExpired ? 'Expired' : 'Available'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-center">
                        {s.bookedBy ? (
                          <select
                            value={s.attendanceStatus || 'Pending'}
                            onChange={(e) => handleAttendance(s._id, e.target.value)}
                            className={`text-xs font-bold px-2 py-1 rounded bg-black border border-white/20 outline-none cursor-pointer hover:border-orange transition-colors ${s.attendanceStatus === 'Attended' ? 'text-green-500' :
                                s.attendanceStatus === 'Absent' ? 'text-red-500' : 'text-yellow-500'
                              }`}
                          >
                            <option value="Pending" className="text-yellow-500">Pending</option>
                            <option value="Attended" className="text-green-500">Attended</option>
                            <option value="Absent" className="text-red-500">Absent</option>
                          </select>
                        ) : (
                          <span className="text-gray-700 text-xs font-black">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end items-center gap-4">
                          {!isExpired && (
                            <button
                              onClick={() => handleEdit(s)}
                              className="text-orange hover:text-orange/80 text-sm font-bold transition-all"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(s._id)}
                            className="text-red-500 hover:text-red-400 text-sm font-bold transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {filteredSchedules.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-white/[0.02]">
                <div className="text-xs text-gray-500 font-medium">
                  Showing <span className="text-orange">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-orange">{Math.min(currentPage * itemsPerPage, filteredSchedules.length)}</span> of <span className="text-orange">{filteredSchedules.length}</span> sessions
                </div>
                {filteredSchedules.length > itemsPerPage && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-orange/20 hover:border-orange/50 disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:border-white/10 transition-all"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.ceil(filteredSchedules.length / itemsPerPage) }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${currentPage === i + 1
                            ? 'bg-orange border-orange text-white shadow-[0_0_10px_rgba(255,127,17,0.3)]'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-orange/50 hover:text-white'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredSchedules.length / itemsPerPage)))}
                      disabled={currentPage === Math.ceil(filteredSchedules.length / itemsPerPage)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-orange/20 hover:border-orange/50 disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:border-white/10 transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
            {filteredSchedules.length === 0 && (
              <div className="text-center py-10 text-gray-500 italic">No matching sessions found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerSchedules;