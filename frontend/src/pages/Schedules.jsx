import React, { useState, useEffect } from "react";
import axios from "axios";

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
  const [filterDate, setFilterDate] = useState("");

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

  // Filtered schedules
  const filteredSchedules = schedules.filter((s) => {
    const matchesTitle = s.title?.toLowerCase().includes(filterTitle.toLowerCase());
    const matchesTrainer = s.trainer?.name?.toLowerCase().includes(filterTrainer.toLowerCase());
    const matchesDate = filterDate ? s.date === filterDate : true;
    return matchesTitle && matchesTrainer && matchesDate;
  });

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-orange mb-4">Available Trainer Schedules</h2>
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Filter by session title"
          value={filterTitle}
          onChange={e => setFilterTitle(e.target.value)}
          className="bg-black border border-white/20 p-2 rounded text-white"
        />
        <input
          type="text"
          placeholder="Filter by trainer name"
          value={filterTrainer}
          onChange={e => setFilterTrainer(e.target.value)}
          className="bg-black border border-white/20 p-2 rounded text-white"
        />
        <input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          className="bg-black border border-white/20 p-2 rounded text-white"
        />
        {(filterTitle || filterTrainer || filterDate) && (
          <button
            onClick={() => { setFilterTitle(""); setFilterTrainer(""); setFilterDate(""); }}
            className="bg-orange text-white px-4 py-2 rounded font-bold"
          >
            Clear Filters
          </button>
        )}
      </div>
      {loading ? (
        <div className="text-center py-6 text-orange animate-pulse font-bold">Loading Sessions...</div>
      ) : error ? (
        <div className="text-center py-6 text-red-500 font-bold">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchedules.length === 0 ? (
            <div className="col-span-3 text-center text-gray-400 italic">No sessions match your filters.</div>
          ) : filteredSchedules.map((s) => (
            <div key={s._id} className="p-4 border border-white/10 rounded-xl bg-white/5 hover:border-orange/50 transition-all group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-white group-hover:text-orange transition-colors">{s.title}</h3>
                <span className="text-xs bg-orange/20 text-orange px-2 py-1 rounded border border-orange/30 uppercase font-bold">Open</span>
              </div>
              <div className="space-y-1 text-sm text-gray-400 mb-2">
                <div><span className="font-bold text-white">Trainer:</span> {s.trainer?.name || "N/A"}</div>
                <div><span className="font-bold text-white">Date:</span> {s.date}</div>
                <div><span className="font-bold text-white">Time:</span> {s.time}</div>
              </div>
              <button
                onClick={() => handleBook(s._id)}
                disabled={bookingId === s._id}
                className="mt-2 w-full bg-orange text-white font-bold py-2 rounded hover:bg-orange/90 transition-all disabled:opacity-60"
              >
                {bookingId === s._id ? "Booking..." : "Book"}
              </button>
            </div>
          ))}
        </div>
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
