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
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("Upcoming");
  const [editId, setEditId] = useState(null);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.custom-dropdown')) {
        setIsStatusOpen(false);
        setIsDateOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const statusLabels = {
    All: "All Status", Booked: "Booked", Available: "Available", 
    Expired: "Expired", Pending: "Pending Attendance", Attended: "Attended", Absent: "Absent"
  };
  const dateLabels = {
    All: "All Dates", Today: "Today Only", Upcoming: "Upcoming", Past: "Past Sessions"
  };

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
      setSuccessMsg(editId ? "Session successfully updated!" : "Session successfully created!");
      setTimeout(() => setSuccessMsg(""), 3000);
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

  const handleDeleteClick = (session) => {
    setSessionToDelete(session);
  };

  const confirmDelete = async () => {
    if (!sessionToDelete) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/${sessionToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSchedules(); // Refresh the list
      setSuccessMsg("Session successfully deleted!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert("Failed to delete the session.");
    } finally {
      setSessionToDelete(null);
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
    <div className="page-bg-base pt-24 px-6 relative">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100 -z-10"></div>
      
      {successMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
          <span className="font-bold text-sm tracking-wide">{successMsg}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="backdrop-blur-md bg-slate-50 border border-slate-200 rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div>
              <h2 className="text-3xl font-bold text-blue-600 tracking-tight">My Schedules</h2>
              <p className="text-slate-500 mt-2">Manage your training sessions and track student attendance.</p>
            </div>
            <button onClick={() => setShowForm(true)} className="mt-4 md:mt-0 bg-blue-600 px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700/80 transition-all shadow-lg shadow-blue-600/20">
              + Add Session
            </button>
          </div>
        </div>

        {/* Integrated Performance Hub */}
        <div className="backdrop-blur-2xl bg-white/[0.03] border border-slate-200 rounded-3xl p-1 mb-8 shadow-2xl overflow-hidden group">
          <div className="flex flex-col lg:flex-row items-stretch">
            {/* Hub Header */}
            <div className="lg:w-1/4 p-6 bg-gradient-to-br from-blue-600/20 to-transparent border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-blue-700/20 transition-all duration-700"></div>
               <h3 className="text-xl font-black text-slate-900 leading-tight relative z-10">Monthly<br /><span className="text-blue-600">Performance</span></h3>
               <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-2 relative z-10">{format(now, 'MMMM yyyy')}</p>
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
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )
                },
                {
                  label: "Available",
                  value: stats.available,
                  icon: (
                    <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-600/0 to-transparent group-hover/stat:via-blue-600/40 transition-all duration-500"></div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50/40 flex items-center justify-center transition-all group-hover/stat:scale-110 group-hover/stat:border-blue-600/20 border border-white/5">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-2xl font-black text-slate-900 group-hover/stat:text-blue-600 transition-colors tracking-tight">{item.value}</div>
                      <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-0.5 whitespace-nowrap">{item.label}</div>
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
            className="w-full bg-white shadow-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600/50 transition-all font-medium placeholder:text-slate-400"
          />
          {/* Custom Status Dropdown */}
          <div className="relative custom-dropdown">
            <button
              onClick={() => { setIsStatusOpen(!isStatusOpen); setIsDateOpen(false); }}
              className="w-full bg-white shadow-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600/50 transition-all font-medium text-left flex justify-between items-center"
            >
              {statusLabels[statusFilter]}
              <svg className={`w-4 h-4 text-slate-400 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isStatusOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                {Object.keys(statusLabels).map(opt => (
                  <div
                    key={opt}
                    onClick={() => { setStatusFilter(opt); setIsStatusOpen(false); }}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${statusFilter === opt ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-blue-50/50 hover:text-blue-600'}`}
                  >
                    {statusLabels[opt]}
                    {statusFilter === opt && <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Date Dropdown */}
          <div className="relative custom-dropdown">
            <button
              onClick={() => { setIsDateOpen(!isDateOpen); setIsStatusOpen(false); }}
              className="w-full bg-white shadow-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600/50 transition-all font-medium text-left flex justify-between items-center"
            >
              {dateLabels[dateFilter]}
              <svg className={`w-4 h-4 text-slate-400 transition-transform ${isDateOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isDateOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                {Object.keys(dateLabels).map(opt => (
                  <div
                    key={opt}
                    onClick={() => { setDateFilter(opt); setIsDateOpen(false); }}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${dateFilter === opt ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-blue-50/50 hover:text-blue-600'}`}
                  >
                    {dateLabels[opt]}
                    {dateFilter === opt && <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Session Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-blue-50/75 backdrop-blur-sm transition-all"></div>
            <div className="relative z-10 flex items-center justify-center w-full h-full">
              <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl shadow-2xl max-w-md w-full p-8">
                {/* Header */}
                <div className="backdrop-blur-md bg-gradient-to-r from-blue-600/20 to-blue-600/10 border-b border-blue-600/30 -mx-8 -mt-8 px-8 py-6 mb-6 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-slate-900">{editId ? 'Edit Session' : 'Add New Session'}</h3>
                  <button
                    className="text-slate-900/60 hover:text-slate-900 text-2xl font-bold transition"
                    onClick={closeModal}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleSave} className="flex flex-col gap-4 w-full">
                  {error && (
                    <div className="bg-red-600/20 border border-red-500/50 text-red-800 p-3 rounded-lg text-sm font-semibold text-center">
                      {error}
                    </div>
                  )}
                  <label className="text-slate-700 font-semibold text-sm">
                    Session Name
                    <input
                      type="text"
                      className="mt-2 w-full rounded-lg px-4 py-2 bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                      value={sessionName}
                      onChange={(e) => setSessionName(e.target.value)}
                      placeholder="e.g. Morning Yoga"
                      required
                    />
                  </label>
                  <label className="text-slate-700 font-semibold text-sm">
                    Date
                    <div className="mt-2 w-full">
                      <DatePicker
                        selected={sessionDate}
                        onChange={(date) => setSessionDate(date)}
                        className="w-full rounded-lg px-4 py-2 bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                        placeholderText="Select a date"
                        dateFormat="yyyy-MM-dd"
                        minDate={new Date()}
                        required
                      />
                    </div>
                  </label>
                  <label className="text-slate-700 font-semibold text-sm">
                    Time
                    <input
                      type="time"
                      className="mt-2 w-full rounded-lg px-4 py-2 bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                      value={sessionTime}
                      onChange={(e) => setSessionTime(e.target.value)}
                      required
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300"
                  >
                    {loading ? "Saving..." : (editId ? "Update Session" : "Create Session")}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-slate-200 backdrop-blur-md bg-slate-50 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-blue-600/20">
                  <th className="px-6 py-5 text-sm font-bold tracking-wider text-blue-600">Session</th>
                  <th className="px-6 py-5 text-sm font-bold tracking-wider text-blue-600 text-center">Date</th>
                  <th className="px-6 py-5 text-sm font-bold tracking-wider text-blue-600 text-center">Time</th>
                  <th className="px-6 py-5 text-sm font-bold tracking-wider text-blue-600">Student</th>
                  <th className="px-6 py-5 text-sm font-bold tracking-wider text-blue-600 text-center">Attendance</th>
                  <th className="px-6 py-5 text-sm font-bold tracking-wider text-blue-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentItems.map((s) => {
                  const sessionDateTime = new Date(`${s.date}T${s.time || "00:00"}`);
                  const isExpired = sessionDateTime < new Date();

                  return (
                    <tr key={s._id} className={`hover:bg-slate-50 transition-all group ${isExpired && !s.bookedBy ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-5">
                        <div className={`font-bold transition-colors ${isExpired && !s.bookedBy ? 'text-slate-600' : 'text-slate-900 group-hover:text-blue-600'}`}>
                          {s.title}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`${isExpired && !s.bookedBy ? 'text-gray-600' : 'text-slate-700'} text-sm font-medium`}>{s.date}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className={`inline-block px-3 py-1 bg-slate-50 rounded-lg border font-bold text-xs ${isExpired && !s.bookedBy ? 'text-gray-600 border-white/5' : 'text-blue-600 border-slate-200'}`}>
                          {s.time}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {s.bookedBy ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center text-[10px] text-blue-600 font-bold border border-blue-600/30">
                              {s.bookedBy.name?.charAt(0)}
                            </div>
                            <span className="text-slate-900 font-bold text-sm tracking-tight">
                              {s.bookedBy.name}
                            </span>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-widest ${isExpired
                              ? 'bg-red-500/10 text-red-500/70 border-red-500/20'
                              : 'bg-green-500/10 text-green-700 border-green-500/20'
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
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg border outline-none cursor-pointer transition-colors shadow-sm ${s.attendanceStatus === 'Attended' ? 'text-green-700 bg-green-50 border-green-200 hover:border-green-300' :
                                s.attendanceStatus === 'Absent' ? 'text-red-700 bg-red-50 border-red-200 hover:border-red-300' : 'text-amber-700 bg-amber-50 border-amber-200 hover:border-amber-300'
                              }`}
                          >
                            <option value="Pending" className="text-amber-700 bg-white">Pending</option>
                            <option value="Attended" className="text-green-700 bg-white">Attended</option>
                            <option value="Absent" className="text-red-700 bg-white">Absent</option>
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
                              className="text-blue-600 hover:text-blue-600/80 text-sm font-bold transition-all"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteClick(s)}
                            className="text-red-600 hover:text-red-700 text-sm font-bold transition-all"
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
                <div className="text-xs text-slate-600 font-medium">
                  Showing <span className="text-blue-600">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-blue-600">{Math.min(currentPage * itemsPerPage, filteredSchedules.length)}</span> of <span className="text-blue-600">{filteredSchedules.length}</span> sessions
                </div>
                {filteredSchedules.length > itemsPerPage && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 hover:bg-blue-700/20 hover:border-blue-600/50 disabled:opacity-30 disabled:hover:bg-slate-50 disabled:hover:border-slate-200 transition-all"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.ceil(filteredSchedules.length / itemsPerPage) }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${currentPage === i + 1
                            ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-blue-600/50 hover:text-slate-900'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredSchedules.length / itemsPerPage)))}
                      disabled={currentPage === Math.ceil(filteredSchedules.length / itemsPerPage)}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 hover:bg-blue-700/20 hover:border-blue-600/50 disabled:opacity-30 disabled:hover:bg-slate-50 disabled:hover:border-slate-200 transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
            {filteredSchedules.length === 0 && (
              <div className="text-center py-10 text-slate-600 italic">No matching sessions found.</div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {sessionToDelete && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSessionToDelete(null)}></div>
            <div className="relative z-10 bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-red-50/50">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Delete Session?</h3>
              <p className="text-slate-500 mb-8 leading-lax">Are you sure you want to delete <span className="font-bold text-slate-800">"{sessionToDelete.title}"</span>? This action cannot be undone.</p>
              <div className="flex gap-4 justify-center">
                <button onClick={() => setSessionToDelete(null)} className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors w-full">Cancel</button>
                <button onClick={confirmDelete} className="px-6 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 w-full">Delete It</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TrainerSchedules;




