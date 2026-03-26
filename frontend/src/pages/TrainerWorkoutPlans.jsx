import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaTrash, FaDownload, FaUserPlus, FaDumbbell, FaBookOpen, FaEdit } from "react-icons/fa";

const TrainerWorkoutPlans = () => {
    const [activeTab, setActiveTab] = useState("library");
    const [students, setStudents] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    const [plans, setPlans] = useState([]);
    const [trainer, setTrainer] = useState(null);

    // Form State for Plan Creator
    const [newPlan, setNewPlan] = useState({
        title: "",
        difficulty: "Beginner",
        exercises: [{ name: "", sets: "", reps: "" }]
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const [studentsRes, plansRes, trainerRes] = await Promise.all([
                    axios.get("http://localhost:5000/api/trainer/assigned-students", {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get("http://localhost:5000/api/plans/workout", {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get("http://localhost:5000/api/users/profile", {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);
                setStudents(studentsRes.data);
                setPlans(plansRes.data);
                setTrainer(trainerRes.data);
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAddExercise = () => {
        setNewPlan({
            ...newPlan,
            exercises: [...newPlan.exercises, { name: "", sets: "", reps: "" }]
        });
    };

    const handleRemoveExercise = (index) => {
        const updatedExercises = newPlan.exercises.filter((_, i) => i !== index);
        setNewPlan({ ...newPlan, exercises: updatedExercises });
    };

    const handleExerciseChange = (index, field, value) => {
        const updatedExercises = [...newPlan.exercises];
        updatedExercises[index][field] = value;
        setNewPlan({ ...newPlan, exercises: updatedExercises });
    };

    const handleExportPDF = (plan) => {
        // High-end print logic using standard window.print() but with optimized CSS
        console.log("Exporting PDF for:", plan.title);
        setSelectedPlan(plan);
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const handleOpenAssignModal = (plan) => {
        setSelectedPlan(plan);
        setShowAssignModal(true);
    };

    const handlePublishPlan = async () => {
        if (!newPlan.title) return alert("Please enter a plan name");
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const isEdit = !!newPlan._id;
            const url = isEdit
                ? `http://localhost:5000/api/plans/workout/${newPlan._id}`
                : "http://localhost:5000/api/plans/workout";
            const method = isEdit ? "put" : "post";

            const res = await axios[method](url, newPlan, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (isEdit) {
                setPlans(plans.map(p => p._id === res.data._id ? res.data : p));
            } else {
                setPlans([...plans, res.data]);
            }

            setNewPlan({ title: "", difficulty: "Beginner", exercises: [{ name: "", sets: "", reps: "" }] });
            setActiveTab("library");
            alert(isEdit ? "Plan updated successfully!" : "Plan published successfully!");
        } catch (err) {
            console.error("Publish failed", err);
            const errorMsg = err.response?.data?.message || err.message;
            alert(`Failed to publish workout plan: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePlan = async (id) => {
        if (!window.confirm("Are you sure you want to delete this plan?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:5000/api/plans/workout/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPlans(plans.filter(p => p._id !== id));
            alert("Plan deleted successfully");
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete plan");
        }
    };

    const handleEditPlan = (plan) => {
        setNewPlan({ ...plan });
        setActiveTab("creator");
    };

    const handleAssignToStudent = async (studentId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:5000/api/plans/assign", {
                studentId,
                planId: selectedPlan._id,
                planModel: "WorkoutPlan"
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`Successfully assigned ${selectedPlan.title} to student!`);
            setShowAssignModal(false);
        } catch (err) {
            console.error("Assignment failed", err);
            alert("Failed to assign plan");
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 px-6 relative print:p-0">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black -z-10 print:hidden"></div>

            <div className="max-w-6xl mx-auto">
                {/* Header Information */}
                <header className="mb-10 print:hidden">
                    <h2 className="text-4xl font-black text-orange tracking-tight">Workout Plans</h2>
                    <p className="text-gray-400 mt-2 text-lg">Create, manage, and assign custom training routines for your students.</p>
                </header>

                {/* Tabs Menu */}
                <div className="flex gap-4 mb-8 border-b border-white/10 pb-4 print:hidden">
                    <button
                        onClick={() => setActiveTab("library")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm tracking-wider ${activeTab === "library" ? "bg-orange text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
                            }`}
                    >
                        <FaBookOpen /> Library
                    </button>
                    <button
                        onClick={() => {
                            setNewPlan({ title: "", difficulty: "Beginner", exercises: [{ name: "", sets: "", reps: "" }] });
                            setActiveTab("creator");
                        }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm tracking-wider ${activeTab === "creator" ? "bg-orange text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
                            }`}
                    >
                        <FaDumbbell /> Plan Creator
                    </button>
                </div>

                {/* Main Content Area */}
                {activeTab === "library" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:hidden">
                        {plans.length > 0 ? (
                            plans.map((plan) => (
                                <div key={plan._id} className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-orange/30 transition-all flex flex-col h-full group relative">
                                    <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={() => handleEditPlan(plan)}
                                            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-all"
                                            title="Edit Plan"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDeletePlan(plan._id)}
                                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                                            title="Delete Plan"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded w-fit mb-4 ${plan.difficulty === "Beginner" ? "bg-green-500/10 text-green-400" : "bg-orange/10 text-orange"
                                        }`}>
                                        {plan.difficulty}
                                    </span>
                                    <h3 className="text-2xl font-bold mb-3 tracking-tight pr-12">{plan.title}</h3>
                                    <p className="text-gray-400 text-sm mb-6 flex-grow">{plan.desc || "Professional training protocol designed for Smart Gym members."}</p>

                                    <div className="space-y-3 mb-8">
                                        {plan.exercises.slice(0, 3).map((ex, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                                                <span className="text-gray-300">{ex.name}</span>
                                                <span className="text-orange font-bold font-mono">{ex.sets} × {ex.reps}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleExportPDF(plan)}
                                            className="flex-1 bg-white/10 hover:bg-white/15 text-white py-3 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-2 border border-white/10"
                                        >
                                            <FaDownload /> PDF
                                        </button>
                                        <button
                                            onClick={() => handleOpenAssignModal(plan)}
                                            className="flex-1 bg-orange hover:bg-orange/90 text-white py-3 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange/20"
                                        >
                                            <FaUserPlus /> Send
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center bg-white/5 rounded-3xl border border-white/10">
                                <p className="text-gray-500 font-medium italic">No workout plans found in your library.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 max-w-3xl mx-auto print:hidden">
                        <div className="mb-8 border-b border-white/10 pb-6">
                            <h3 className="text-xl font-bold text-orange tracking-tight mb-4">
                                {newPlan._id ? "Edit Workout Plan" : "Create New Plan"}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block mb-2">Plan Name</label>
                                    <input
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange/50 transition-all font-medium"
                                        placeholder="E.g. Full Body Blast"
                                        value={newPlan.title}
                                        onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block mb-2">Difficulty</label>
                                    <select
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange/50 transition-all font-medium"
                                        value={newPlan.difficulty}
                                        onChange={(e) => setNewPlan({ ...newPlan, difficulty: e.target.value })}
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-orange tracking-tight">Exercises</h3>
                                <button
                                    onClick={handleAddExercise}
                                    className="text-white bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                                >
                                    <FaPlus /> Add Exercise
                                </button>
                            </div>

                            <div className="space-y-4">
                                {newPlan.exercises.map((ex, idx) => (
                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-black/20 p-4 rounded-xl border border-white/5">
                                        <div className="md:col-span-6">
                                            <label className="text-[10px] text-gray-400 mb-1 block">Exercise Name</label>
                                            <input
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none border-none outline-none"
                                                placeholder="Squats"
                                                value={ex.name}
                                                onChange={(e) => handleExerciseChange(idx, "name", e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] text-gray-400 mb-1 block">Sets</label>
                                            <input
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white text-center"
                                                placeholder="3"
                                                type="number"
                                                value={ex.sets}
                                                onChange={(e) => handleExerciseChange(idx, "sets", e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] text-gray-400 mb-1 block">Reps</label>
                                            <input
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white text-center"
                                                placeholder="12"
                                                value={ex.reps}
                                                onChange={(e) => handleExerciseChange(idx, "reps", e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <button
                                                onClick={() => handleRemoveExercise(idx)}
                                                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded-lg transition-all"
                                            >
                                                <FaTrash className="mx-auto" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={handlePublishPlan}
                                disabled={loading}
                                className="w-full bg-orange hover:bg-orange/90 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-orange/20 disabled:opacity-50"
                            >
                                {loading ? (newPlan._id ? "Updating..." : "Publishing...") : (newPlan._id ? "Update" : "Publish")}
                            </button>
                        </div>
                    </div>
                )}

                {/* Print-Only Professional Document View */}
                {selectedPlan && (
                    <div className="hidden print:block text-black bg-white p-12 h-screen overflow-hidden font-sans">
                        {/* Office Header */}
                        <div className="flex justify-between items-start border-b-8 border-black pb-8 mb-12">
                            <div>
                                <h1 className="text-5xl font-black uppercase tracking-tighter leading-none mb-2 text-orange-600">Workout Plan</h1>
                                <p className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">Gym Management System</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold uppercase tracking-widest">{selectedPlan.title}</p>
                            </div>
                        </div>

                        {/* Document Metadata Grid */}
                        <div className="grid grid-cols-4 gap-0 border-2 border-black mb-12">
                            <div className="border-r-2 border-black p-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Date Issued</label>
                                <p className="font-bold text-sm">{new Date().toLocaleDateString()}</p>
                            </div>
                            <div className="border-r-2 border-black p-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Difficulty</label>
                                <p className="font-bold text-sm uppercase">{selectedPlan.difficulty}</p>
                            </div>
                            <div className="border-r-2 border-black p-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Assigned By</label>
                                <p className="font-bold text-sm italic">Smart Gym Official</p>
                            </div>
                            <div className="p-4 bg-gray-50">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Client Status</label>
                                <p className="font-black text-sm uppercase tracking-tighter">Verified Member</p>
                            </div>
                        </div>

                        {/* Exercise Table - High Legibility */}
                        <div className="mb-16">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-black text-white">
                                        <th className="py-4 px-6 text-left text-xs font-black uppercase tracking-widest">Exercise & Instruction</th>
                                        <th className="py-4 px-6 text-center text-xs font-black uppercase tracking-widest w-24">Sets</th>
                                        <th className="py-4 px-6 text-center text-xs font-black uppercase tracking-widest w-32">Reps / Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedPlan.exercises.map((ex, i) => (
                                        <tr key={i} className="border-b-2 border-black/10 hover:bg-gray-50 transition-colors">
                                            <td className="py-6 px-6">
                                                <p className="font-bold text-xl uppercase tracking-tight">{ex.name}</p>
                                            </td>
                                            <td className="py-6 px-6 text-center font-black text-2xl">{ex.sets}</td>
                                            <td className="py-6 px-6 text-center font-black text-2xl">{ex.reps}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Professional Disclaimer / Footer */}
                        <div className="mt-auto grid grid-cols-2 gap-12 pt-12 border-t-2 border-black/5">
                            <div>
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-4">Quality Assurance Disclosure</h4>
                                <p className="text-xs text-gray-600 leading-relaxed text-justify">
                                    All training protocols contained herein are designed for authorized Smart Gym members.
                                    Users are advised to maintain strict form and procedural safety during all exercises.
                                    This document serves as an official training plan and should be coupling with adequate recovery.
                                    In case of acute discomfort, de-escalate intensity and notify your trainer immediately.
                                </p>
                            </div>
                            <div className="flex flex-col items-end justify-between uppercase">
                                <div className="text-right border-l-4 border-black pl-6">
                                    <p className="text-xs font-black text-gray-500 mb-1">Trainer / Publisher</p>
                                    <p className="text-sm font-bold uppercase">{trainer?.name || "Smart Gym Official"}</p>
                                    <p className="text-[10px] text-gray-400 lowercase">{trainer?.email}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">Validated: {new Date().getFullYear()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Assignment Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAssignModal(false)}></div>
                    <div className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
                        <h3 className="text-2xl font-bold text-orange mb-6 tracking-tight">Send to Student</h3>
                        <p className="text-gray-400 mb-6 text-sm italic">"{selectedPlan?.title}" will be sent to the selected student dashboard.</p>

                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {students.length > 0 ? students.map(student => (
                                <button
                                    key={student._id}
                                    onClick={() => handleAssignToStudent(student._id)}
                                    className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-orange/10 hover:border-orange/50 transition-all group"
                                >
                                    <div className="flex flex-col items-start">
                                        <span className="font-bold text-sm">{student.name}</span>
                                        <span className="text-[10px] text-gray-500">{student.email}</span>
                                    </div>
                                    <FaPlus className="text-gray-600 group-hover:text-orange transition-colors" />
                                </button>
                            )) : (
                                <p className="text-center text-gray-500 py-6">No students assigned to you yet.</p>
                            )}
                        </div>

                        <button
                            onClick={() => setShowAssignModal(false)}
                            className="w-full mt-6 bg-white/5 hover:bg-white/10 text-gray-400 py-3 rounded-xl font-bold transition-all text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainerWorkoutPlans;
