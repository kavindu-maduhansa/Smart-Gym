import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const TrainerAvailability = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = "http://localhost:5000/api/student";

  useEffect(() => {
    const fetchAvailableSchedules = async () => {
      const token = localStorage.getItem("token");
      console.log("[DEBUG] JWT token in localStorage:", token);
      try {
        const res = await axios.get(`${API_URL}/available`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSchedules(res.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load schedules. Please try again.");
        setLoading(false);
      }
    };
    fetchAvailableSchedules();
  }, []);


  const [bookingId, setBookingId] = useState(null);
  const [filterTitle, setFilterTitle] = useState("");
  const [filterTrainer, setFilterTrainer] = useState("");
  const [filterDate, setFilterDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const handleBook = async (id) => {
    if (!window.confirm("Do you want to book this session?")) return;
    setBookingId(id);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/book/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Session booked successfully!");
      // Refresh the list so the booked session disappears
      const res = await axios.get(`${API_URL}/available`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchedules(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed.");
    } finally {
      setBookingId(null);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Filtered schedules
  const filteredSchedules = schedules.filter((s) => {
    const matchesTitle = s.title?.toLowerCase().includes(filterTitle.toLowerCase());
    const matchesTrainer = s.trainer?.name?.toLowerCase().includes(filterTrainer.toLowerCase());
    const matchesDate = filterDate ? s.date === format(filterDate, "yyyy-MM-dd") : true;

    // Combine date and time to check if session is expired
    const sessionDateTime = new Date(`${s.date}T${s.time || "00:00"}`);
    const now = new Date();
    const isExpired = sessionDateTime < now;

    let matchesStatus = true;
    if (statusFilter === "available") {
      matchesStatus = !isExpired;
    } else if (statusFilter === "closed") {
      matchesStatus = isExpired;
    }

    return matchesTitle && matchesTrainer && matchesDate && matchesStatus;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterTitle, filterTrainer, filterDate, statusFilter]);

  const totalPages = Math.ceil(filteredSchedules.length / pageSize);
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = filteredSchedules.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-orange mb-4 tracking-tight text-center sm:text-left">Available Trainer Schedules</h2>
      <div className="flex flex-nowrap gap-4 mb-6 items-center bg-black/40 p-4 rounded-xl border border-white/10 whitespace-nowrap min-w-0 overflow-x-auto no-scrollbar">
        <span className="text-gray-500 font-semibold text-xs tracking-tight mr-2 shrink-0">Filter By:</span>
        
        <div className="relative flex-1 max-w-[200px]">
          <input
            type="text"
            placeholder="Session title..."
            value={filterTitle}
            onChange={e => setFilterTitle(e.target.value)}
            className="bg-black/50 border border-white/10 p-2 rounded-lg text-white focus:outline-none focus:border-orange transition-all text-xs font-medium placeholder:text-gray-600 w-full"
          />
        </div>

        <div className="w-px h-6 bg-white/10 mx-2 shrink-0"></div>

        <div className="relative flex-1 max-w-[180px]">
          <input
            type="text"
            placeholder="Trainer name..."
            value={filterTrainer}
            onChange={e => setFilterTrainer(e.target.value)}
            className="bg-black/50 border border-white/10 p-2 rounded-lg text-white focus:outline-none focus:border-orange transition-all text-xs font-medium placeholder:text-gray-600 w-full"
          />
        </div>

        <div className="w-px h-6 bg-white/10 mx-2 shrink-0"></div>

        <div className="relative shrink-0">
          <DatePicker
            selected={filterDate}
            onChange={(date) => setFilterDate(date)}
            className="bg-black/50 border border-white/10 p-2 rounded-lg text-white focus:outline-none focus:border-orange transition-all text-xs font-medium placeholder:text-gray-600 min-w-[140px]"
            placeholderText="Search Date"
            dateFormat="yyyy-MM-dd"
            isClearable
            portalId="root-portal"
          />
        </div>

        <div className="w-px h-6 bg-white/10 mx-2 shrink-0"></div>

        <div className="relative shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black/50 border border-white/10 p-2 rounded-lg text-white focus:outline-none focus:border-orange transition-all min-w-[130px] text-[10px] font-bold uppercase tracking-widest cursor-pointer appearance-none pr-8"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="closed">Closed</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-[10px]">▼</div>
        </div>

        {(filterTitle || filterTrainer || filterDate || statusFilter !== "all") && (
          <button
            onClick={() => { setFilterTitle(""); setFilterTrainer(""); setFilterDate(null); setStatusFilter("all"); }}
            className="bg-white/5 border border-white/10 text-gray-400 px-4 py-2 rounded-lg font-bold hover:bg-white/10 hover:text-white transition-all text-[10px] uppercase tracking-widest ml-auto shrink-0"
          >
            Clear All
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 bg-black/40 rounded-2xl border border-white/5 mx-auto max-w-md">
          <div className="text-orange animate-pulse font-bold tracking-[0.3em] uppercase text-sm mb-2">Syncing Schedules</div>
          <div className="h-0.5 w-full bg-white/5 overflow-hidden">
             <div className="h-full bg-orange w-1/2 animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500 font-bold bg-red-500/5 rounded-2xl border border-red-500/10">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchedules.length === 0 ? (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 bg-black/20 rounded-2xl border border-white/5 italic text-gray-500 tracking-wide">
                No available sessions match your filters.
              </div>
            ) : currentItems.map((s) => {
              // Combine date and time for precise comparison
              const sessionDateTime = new Date(`${s.date}T${s.time || "00:00"}`);
              const now = new Date();
              const isExpired = sessionDateTime < now;

              return (
                <div key={s._id} className={`p-5 border rounded-2xl bg-black/40 backdrop-blur-sm transition-all group relative overflow-hidden ${isExpired ? 'border-white/5 opacity-60 grayscale-[0.8]' : 'border-white/10 hover:border-orange/40 hover:bg-white/5 shadow-xl hover:shadow-orange/5'}`}>
                  {!isExpired && <div className="absolute top-0 right-0 w-12 h-12 bg-orange/10 rotate-45 translate-x-6 -translate-y-6 group-hover:bg-orange/20 transition-all"></div>}
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex flex-col">
                      <h3 className={`text-xl font-bold transition-colors ${isExpired ? 'text-gray-500' : 'text-white group-hover:text-orange'}`}>{s.title}</h3>
                      <div className="text-[11px] text-gray-500 font-semibold mt-1 tracking-wide">Session Protocol</div>
                    </div>
                    <span className={`text-[10px] px-3 py-1.5 rounded-lg border uppercase font-bold tracking-wider leading-none ${isExpired ? 'bg-red-500/5 text-red-500 border-red-500/10' : 'bg-green-500/5 text-green-400 border-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.05)]'}`}>
                      {isExpired ? "Closed" : "Available"}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs text-gray-400 mb-6 bg-black/40 p-4 rounded-xl border border-white/5 relative z-10">
                    <div className="flex justify-between items-center group/row">
                      <span className="font-semibold text-gray-500 text-xs tracking-tight">Assigned Trainer</span>
                      <span className={`text-sm font-semibold ${isExpired ? 'text-gray-600' : 'text-white group-hover/row:text-orange transition-colors'}`}>{s.trainer?.name || "Unassigned"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-500 text-xs tracking-tight">Date</span>
                      <span className={`text-sm font-medium ${isExpired ? 'text-gray-600' : 'text-white font-mono'}`}>{s.date}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-500 text-xs tracking-tight">Time</span>
                      <span className={`text-sm font-bold ${isExpired ? 'text-gray-600' : 'text-orange font-mono'}`}>{s.time}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => !isExpired && handleBook(s._id)}
                    disabled={isExpired || bookingId === s._id}
                    className={`w-full font-bold py-3.5 rounded-xl transition-all uppercase text-xs tracking-wider relative z-10 ${isExpired
                      ? 'bg-white/5 text-gray-700 cursor-not-allowed border border-white/5 mt-auto'
                      : 'bg-orange text-white hover:bg-orange/90 shadow-lg shadow-orange/20 active:scale-[0.96] mt-auto'
                      }`}
                  >
                    {isExpired ? "Expired" : (bookingId === s._id ? "Processing..." : "Book Now")}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-8 mt-12 pt-8 border-t border-white/10">
              <button
                className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-orange/50 disabled:opacity-20 disabled:hover:border-white/10 transition-all uppercase tracking-wider text-xs font-semibold flex items-center gap-3 group"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Prev
              </button>
              
              <div className="flex items-center gap-4">
                <span className="text-orange font-bold text-sm tracking-wider">{currentPage}</span>
                <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest leading-none">of</span>
                <span className="text-white font-bold text-sm tracking-wider">{totalPages}</span>
              </div>

              <button
                className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-orange/50 disabled:opacity-20 disabled:hover:border-white/10 transition-all uppercase tracking-wider text-xs font-semibold flex items-center gap-3 group"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const SlotAvailability = () => (
  <>
    {/* Place your Smart Schedule summary, filters, and slot content here (as in your screenshot) */}
    <div className="rounded-xl bg-white/5 border border-white/10 p-8 mb-8">
      <h2 className="text-3xl font-bold text-orange mb-2">Smart Schedules</h2>
      <p className="text-gray-300 mb-6">Weekly calendar view, smart booking rules, waitlist support, and quick actions.</p>
      {/* ...rest of your summary, filters, and slot UI... */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-black/40 rounded-lg p-4 text-center">
          <div className="text-lg text-gray-400">Total Slots</div>
          <div className="text-2xl font-bold text-white">18</div>
        </div>
        <div className="bg-black/40 rounded-lg p-4 text-center">
          <div className="text-lg text-gray-400">Available</div>
          <div className="text-2xl font-bold text-green-400">18</div>
        </div>
        <div className="bg-black/40 rounded-lg p-4 text-center">
          <div className="text-lg text-gray-400">Full</div>
          <div className="text-2xl font-bold text-orange">0</div>
        </div>
        <div className="bg-black/40 rounded-lg p-4 text-center">
          <div className="text-lg text-gray-400">Avg Occupancy</div>
          <div className="text-2xl font-bold text-orange">1%</div>
        </div>
      </div>
      {/* ...filters and other controls... */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button className="bg-orange/20 text-orange px-4 py-2 rounded font-bold">Today</button>
        <button className="bg-orange/20 text-orange px-4 py-2 rounded font-bold">Next 7 Days</button>
        <button className="bg-orange/20 text-orange px-4 py-2 rounded font-bold">Next 30 Days</button>
        <button className="bg-orange/10 text-orange px-4 py-2 rounded font-bold">Clear Filters</button>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <input type="date" className="bg-black/40 border border-white/10 rounded px-3 py-2 text-white" />
        <input type="date" className="bg-black/40 border border-white/10 rounded px-3 py-2 text-white" />
        <input type="text" placeholder="Filter by slot tag" className="bg-black/40 border border-white/10 rounded px-3 py-2 text-white" />
        <select className="bg-black/40 border border-white/10 rounded px-3 py-2 text-white">
          <option>All status</option>
        </select>
      </div>
    </div>
  </>
);

const Schedules = () => {
  const [tab, setTab] = useState("trainer");
  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 relative">
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black -z-10"></div>
      <div className="max-w-6xl mx-auto backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8">
        <h1 className="text-4xl font-bold text-orange mb-8 text-center">Smart Schedules</h1>
        <div className="flex justify-center mb-8">
          <button
            className={`px-6 py-2 rounded-t-lg font-bold text-lg transition-colors duration-200 ${tab === "trainer" ? "bg-orange text-black" : "bg-gray-800 text-white"}`}
            onClick={() => setTab("trainer")}
          >
            Trainer Availability
          </button>
          <button
            className={`px-6 py-2 rounded-t-lg font-bold text-lg transition-colors duration-200 ml-2 ${tab === "slot" ? "bg-orange text-black" : "bg-gray-800 text-white"}`}
            onClick={() => setTab("slot")}
          >
            Slot Availability
          </button>
        </div>
        {tab === "trainer" && <TrainerAvailability />}
        {tab === "slot" && <SlotAvailability />}
      </div>
    </div>
  );
};

export default Schedules;
