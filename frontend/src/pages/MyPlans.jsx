import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus, FaTrash, FaDownload, FaUserPlus, FaDumbbell, FaBookOpen, FaUtensils, FaUserShield } from "react-icons/fa";

const MyPlans = () => {
  const [activeTab, setActiveTab] = useState("workout");
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/plans/student/assignments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAssignments(response.data);
      } catch (err) {
        console.error("Failed to fetch assignments", err);
        setError("Failed to load your plans.");
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  const workoutAssignments = assignments.filter(a => a.planModel === "WorkoutPlan" && a.planId);
  const mealAssignments = assignments.filter(a => a.planModel === "MealPlan" && a.planId);

  const handleExportPDF = (plan) => {
    setSelectedPlan(plan);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  if (loading) {
    return (
      <div className="page-bg-base pt-24 flex items-center justify-center">
        <div className="text-slate-900 text-xl font-bold animate-pulse">Loading Plans...</div>
      </div>
    );
  }

  return (
    <div className="page-bg-base pt-24 px-6 relative print:p-0">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100 -z-10 print:hidden"></div>

      <div className="max-w-6xl mx-auto">
        <header className="mb-10 print:hidden text-center md:text-left">
          <h2 className="text-4xl font-black text-blue-600 tracking-tight">My Training & Nutrition</h2>
          <p className="text-slate-500 mt-2 text-lg italic">Personalized plans assigned by your professional trainer.</p>
        </header>

        {/* Tabs Menu */}
        <div className="flex gap-4 mb-8 border-b border-slate-200 pb-4 print:hidden">
          <button
            onClick={() => setActiveTab("workout")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm tracking-wider ${activeTab === "workout" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}
          >
            <FaDumbbell /> Workout Plans
          </button>
          <button
            onClick={() => setActiveTab("meal")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm tracking-wider ${activeTab === "meal" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}
          >
            <FaUtensils /> Meal Plans
          </button>
        </div>

        {/* Workout Plans */}
        {activeTab === "workout" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:hidden">
            {workoutAssignments.length > 0 ? workoutAssignments.map((assignment) => {
              const plan = assignment.planId;
              const trainer = assignment.trainerId;
              return (
                <div key={assignment._id} className="backdrop-blur-md bg-white border border-slate-200 rounded-2xl p-8 hover:border-blue-600/30 transition-all flex flex-col h-full group relative shadow-md">
                   <div className="flex items-center gap-2 mb-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${plan.difficulty === "Beginner" ? "bg-green-500/10 text-green-700" : "bg-blue-600/10 text-blue-600"}`}>
                        {plan.difficulty}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">WORKOUT</span>
                   </div>
                  
                  <h3 className="text-2xl font-bold mb-3 tracking-tight">{plan.title}</h3>
                  
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 bg-blue-50/50 p-2 rounded-lg">
                    <FaUserShield className="text-blue-600" />
                    <span className="font-semibold">Trainer: {trainer?.name || "Official Trainer"}</span>
                  </div>

                  <div className="space-y-3 mb-8 flex-grow">
                    {plan.exercises?.slice(0, 4).map((ex, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                        <span className="text-slate-700 font-medium">{ex.name}</span>
                        <span className="text-blue-600 font-bold font-mono">{ex.sets} × {ex.reps}</span>
                      </div>
                    ))}
                    {plan.exercises?.length > 4 && (
                        <p className="text-[10px] text-slate-400 text-center font-bold italic mt-2">+ {plan.exercises.length - 4} More Exercises</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleExportPDF(plan)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                  >
                    <FaDownload /> View Full Details (PDF)
                  </button>
                </div>
              );
            }) : (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-slate-600 font-medium italic">Your trainer hasn't assigned any workout plans yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Meal Plans */}
        {activeTab === "meal" && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:hidden">
           {mealAssignments.length > 0 ? mealAssignments.map((assignment) => {
             const plan = assignment.planId;
             const trainer = assignment.trainerId;
             return (
               <div key={assignment._id} className="backdrop-blur-md bg-white border border-slate-200 rounded-2xl p-8 hover:border-blue-600/30 transition-all flex flex-col h-full group relative shadow-md">
                   <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-blue-600/10 text-blue-600">P: {plan.macros?.p}%</span>
                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-blue-400/10 text-blue-400">C: {plan.macros?.c}%</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">MEAL PLAN</span>
                   </div>
                 
                 <h3 className="text-2xl font-bold mb-3 tracking-tight">{plan.title}</h3>
                 
                 <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 bg-blue-50/50 p-2 rounded-lg">
                   <FaUserShield className="text-blue-600" />
                   <span className="font-semibold">Trainer: {trainer?.name || "Official Nutritionist"}</span>
                 </div>

                 <div className="space-y-4 mb-8 flex-grow">
                    {plan.meals?.map((meal, idx) => (
                        <div key={idx} className="border-l-2 border-blue-600 pl-3">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{meal.name}</h4>
                            <p className="text-[10px] text-slate-500 truncate mt-1">{meal.detail}</p>
                        </div>
                    ))}
                 </div>

                 <button
                   onClick={() => handleExportPDF(plan)}
                   className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                 >
                   <FaDownload /> View Full Details (PDF)
                 </button>
               </div>
             );
           }) : (
             <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
               <p className="text-slate-600 font-medium italic">Your trainer hasn't assigned any meal plans yet.</p>
             </div>
           )}
         </div>
        )}

        {/* Print-Only Professional Document View */}
        {selectedPlan && (
          <div className="hidden print:block text-black bg-white p-12 h-screen overflow-hidden font-sans">
            <div className="flex justify-between items-start border-b-8 border-black pb-8 mb-12">
              <div>
                <h1 className="text-5xl font-black uppercase tracking-tighter leading-none mb-2 text-blue-600">SMART GYM OFFICIAL</h1>
                <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">
                    {selectedPlan.exercises ? "Personalized Workout Plan" : "Personalized Nutritional Guide"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold uppercase tracking-widest">{selectedPlan.title}</p>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tight">{new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-0 border-2 border-black mb-12">
              <div className="border-r-2 border-black p-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1">Issue Date</label>
                <p className="font-bold text-sm tracking-tighter uppercase">{new Date().toLocaleDateString()}</p>
              </div>
              <div className="border-r-2 border-black p-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1">Plan Category</label>
                <p className="font-bold text-sm uppercase">{selectedPlan.exercises ? "Fitness" : "Nutrition"}</p>
              </div>
              <div className="border-r-2 border-black p-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1">Authenticated For</label>
                <p className="font-bold text-sm italic">Verified Member</p>
              </div>
              <div className="p-4 bg-gray-50 uppercase text-center">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1">Document Verify</label>
                <p className="font-black text-sm text-blue-600">OFFICIAL</p>
              </div>
            </div>

            {selectedPlan.exercises ? (
              <table className="w-full mb-16">
                <thead>
                  <tr className="bg-blue-50 text-slate-900">
                    <th className="py-4 px-6 text-left text-xs font-black uppercase tracking-widest">Exercise Routine</th>
                    <th className="py-4 px-6 text-center text-xs font-black uppercase tracking-widest w-24">Sets</th>
                    <th className="py-4 px-6 text-center text-xs font-black uppercase tracking-widest w-32">Reps</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPlan.exercises.map((ex, i) => (
                    <tr key={i} className="border-b-2 border-black/10">
                      <td className="py-6 px-6 font-bold text-xl uppercase tracking-tight">{ex.name}</td>
                      <td className="py-6 px-6 text-center font-black text-2xl">{ex.sets}</td>
                      <td className="py-6 px-6 text-center font-black text-2xl">{ex.reps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
                <div className="mb-16">
                    <div className="flex gap-4 mb-8">
                        <div className="bg-blue-600 text-white p-4 flex-1 rounded text-center">
                            <p className="text-[10px] font-black uppercase mb-1">Protein Target</p>
                            <p className="text-3xl font-black">{selectedPlan.macros?.p}%</p>
                        </div>
                        <div className="bg-blue-400 text-white p-4 flex-1 rounded text-center">
                            <p className="text-[10px] font-black uppercase mb-1">Carb Target</p>
                            <p className="text-3xl font-black">{selectedPlan.macros?.c}%</p>
                        </div>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="bg-blue-50">
                                <th className="py-4 px-6 text-left text-xs font-black uppercase tracking-widest">Meal Name</th>
                                <th className="py-4 px-6 text-left text-xs font-black uppercase tracking-widest">Description & Foods</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedPlan.meals.map((meal, i) => (
                                <tr key={i} className="border-b-2 border-black/10">
                                    <td className="py-6 px-6 font-black text-lg uppercase w-1/4">{meal.name}</td>
                                    <td className="py-6 px-6 font-bold text-sm text-gray-700">{meal.detail}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-auto pt-12 border-t-2 border-black/5 italic text-gray-500 text-[10px] text-justify leading-relaxed">
              Disclaimer: These plans are issued by Smart Gym professionals for registered members only. Always perform exercises with proper safety and maintain proper nutrition. Consult your trainer before changing your schedule.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPlans;
