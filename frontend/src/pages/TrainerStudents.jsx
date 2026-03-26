import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUser, FaComments, FaCheckCircle } from "react-icons/fa";

const TrainerStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [weekFilter, setWeekFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/trainer/assigned-students", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudents(res.data);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Failed to load students roster.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleSave = async (studentId, field, value) => {
    try {
      const token = localStorage.getItem("token");
      const payload = { studentId };
      payload[field] = value;
      
      await axios.post("http://localhost:5000/api/trainer/student-note", 
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, [field]: value } : s));
    } catch (err) {
      console.error(`Error saving ${field}:`, err);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (weekFilter === "All") return matchesSearch;

    if (student.lastWorkout === "None yet") return false;

    // Parse 'YYYY-MM-DD @ HH:mm'
    const lastDate = new Date(student.lastWorkout.split(' @ ')[0]);
    const now = new Date();
    const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));

    if (weekFilter === "This Week") return matchesSearch && diffDays <= 7;
    if (weekFilter === "Last Week") return matchesSearch && diffDays > 7 && diffDays <= 14;

    return matchesSearch;
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, weekFilter]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-orange text-2xl animate-pulse font-bold uppercase tracking-widest">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden pt-24 pb-20 px-6">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black -z-10"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div>
              <h2 className="text-3xl font-bold text-orange tracking-tight">Assigned Students</h2>
              <p className="text-gray-400 mt-2">Manage and track the progress of your assigned students.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-xl mb-8">
            {error}
          </div>
        )}

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <input 
            type="text" 
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange/50 transition-all font-medium placeholder:text-gray-500"
          />
          <select 
            value={weekFilter}
            onChange={(e) => setWeekFilter(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange/50 transition-all cursor-pointer font-medium"
          >
            <option value="All" className="bg-gray-900">All Activity</option>
            <option value="This Week" className="bg-gray-900">Active This Week</option>
            <option value="Last Week" className="bg-gray-900">Active Last Week</option>
          </select>
        </div>

        {/* Data Table */}
        <div className="mt-4 overflow-hidden rounded-3xl border border-white/10 backdrop-blur-md bg-white/5 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/10 border-b border-orange/20">
                  <th className="px-6 py-5 text-sm font-bold tracking-wider text-orange">Student</th>
                  <th className="px-6 py-5 text-sm font-bold tracking-wider text-orange text-center">Last Workout</th>
                  <th className="px-6 py-5 text-sm font-bold tracking-wider text-orange text-center">Sessions</th>
                  <th className="px-6 py-5 text-sm font-bold tracking-wider text-orange">Notes (Private)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentItems.map((student) => (
                  <tr key={student.id} className="hover:bg-white/5 transition-all group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange/20 rounded-full flex items-center justify-center text-xs text-orange font-bold border border-orange/30">
                          {student.name?.charAt(0)}
                        </div>
                        <div>
                          <div className="text-white font-bold text-sm tracking-tight group-hover:text-orange transition-colors">
                            {student.name}
                          </div>
                          <div className="text-gray-400 text-xs font-medium tracking-tight lowercase italic mt-0.5">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-gray-400 text-xs font-medium">{student.lastWorkout || 'No recent workout'}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-orange/10 border border-orange/20 text-orange font-black text-xs uppercase tracking-tighter">
                          {student.progress || 0} / 4 {student.progress === 1 ? 'Session' : 'Sessions'}
                        </div>
                        <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-orange/60 to-orange transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(255,127,17,0.4)]"
                            style={{ width: `${Math.min(((student.progress || 0) / 4) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Monthly Target</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 min-w-[200px]">
                      <div className="relative group/note">
                        <textarea 
                          rows="1"
                          defaultValue={student.note}
                          placeholder="Add private note..."
                          onBlur={(e) => handleSave(student.id, 'note', e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-orange/50 focus:bg-white/10 transition-all placeholder:text-gray-600 resize-none min-h-[40px]"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && !loading && (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center text-gray-500 italic text-lg bg-black/20">
                      No matching students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {filteredStudents.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-white/[0.02]">
                <div className="text-xs text-gray-500 font-medium">
                  Showing <span className="text-orange">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-orange">{Math.min(currentPage * itemsPerPage, filteredStudents.length)}</span> of <span className="text-orange">{filteredStudents.length}</span> students
                </div>
                {filteredStudents.length > itemsPerPage && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-orange/20 hover:border-orange/50 disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:border-white/10 transition-all"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.ceil(filteredStudents.length / itemsPerPage) }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${
                          currentPage === i + 1 
                          ? 'bg-orange border-orange text-white shadow-[0_0_10px_rgba(255,127,17,0.3)]' 
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-orange/50 hover:text-white'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredStudents.length / itemsPerPage)))}
                      disabled={currentPage === Math.ceil(filteredStudents.length / itemsPerPage)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-orange/20 hover:border-orange/50 disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:border-white/10 transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerStudents;
