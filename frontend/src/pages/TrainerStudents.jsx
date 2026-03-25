import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUser, FaComments, FaCheckCircle } from "react-icons/fa";

const TrainerStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [membershipFilter, setMembershipFilter] = useState("All");

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
    const matchesMembership = membershipFilter === "All" || student.membershipType === membershipFilter;
    return matchesSearch && matchesMembership;
  });

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
    <div className="min-h-screen bg-black text-white relative overflow-hidden pt-32 pb-20 px-6">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange rounded-full mix-blend-screen filter blur-3xl opacity-5 animate-pulse"></div>
      </div>

      <div className="relative z-10 container mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange to-orange/80 uppercase tracking-tighter">
            Assigned Students
          </h1>
          <p className="text-gray-400 mt-4 text-lg">Manage and track the progress of your assigned students.</p>
        </header>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-xl mb-8">
            {error}
          </div>
        )}

        {/* Filters Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange/50 transition-all placeholder:text-gray-500"
            />
          </div>
          <div className="md:w-64">
            <select 
              value={membershipFilter}
              onChange={(e) => setMembershipFilter(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange/50 transition-all cursor-pointer"
            >
              <option value="All" className="bg-gray-900">All Memberships</option>
              <option value="basic" className="bg-gray-900">Basic</option>
              <option value="monthly" className="bg-gray-900">Monthly</option>
              <option value="Premium" className="bg-gray-900">Premium</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="mt-4 overflow-hidden rounded-3xl border border-white/10 backdrop-blur-md bg-white/5 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/10">
                  <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider text-orange">Student Name</th>
                  <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider text-orange">Last Workout</th>
                  <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider text-orange">Program Progress</th>
                  <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider text-orange">Notes (Private)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange/20 rounded-full flex items-center justify-center text-orange font-bold border border-orange/30">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-orange transition-colors">{student.name}</div>
                          <div className="text-[10px] text-gray-400 uppercase tracking-widest">{student.email}</div>
                          <div className="text-[10px] text-gray-600 uppercase font-bold">{student.membershipType} Tier</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-gray-300 text-sm">{student.lastWorkout}</span>
                        <span className="text-green-500 text-[10px] flex items-center gap-1 font-bold mt-1">
                          <FaCheckCircle className="animate-pulse" /> {student.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2 min-w-[150px]">
                        <select 
                          value={student.progress}
                          onChange={(e) => handleSave(student.id, 'progress', parseInt(e.target.value))}
                          className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-orange font-bold focus:outline-none focus:border-orange/50 transition-all cursor-pointer hover:bg-black/70"
                        >
                          <option value="0" className="bg-gray-900 text-gray-400 font-normal italic">Not Started</option>
                          {[1, 2, 3, 4].map(v => (
                            <option key={v} value={v} className="bg-gray-900 font-bold">Session {v} of 4</option>
                          ))}
                        </select>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-orange h-full rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(255,127,17,0.4)]"
                            style={{ width: `${(student.progress / 4) * 100}%` }}
                          ></div>
                        </div>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerStudents;
