import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaTrash, FaDownload, FaUserPlus, FaUtensils, FaLeaf, FaEdit } from "react-icons/fa";

const TrainerMealPlans = () => {
    const [activeTab, setActiveTab] = useState("library");
    const [students, setStudents] = useState([]);
    const [plans, setPlans] = useState([]);
    const [trainer, setTrainer] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    // Form State for Meal Creator
    const [newPlan, setNewPlan] = useState({
        title: "",
        macros: { p: "", c: "" },
        meals: [{ name: "Breakfast", detail: "" }, { name: "Lunch", detail: "" }, { name: "Dinner", detail: "" }]
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
                    axios.get("http://localhost:5000/api/plans/meal", {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get("http://localhost:5000/api/users/profile", {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);
                setStudents(studentsRes.data);
                setPlans(plansRes.data);
                setTrainer(trainerRes.data);
                console.log("MY_PLANS_FETCHED:", plansRes.data);
                console.log("MY_PROFILE:", trainerRes.data);
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAddMeal = () => {
        setNewPlan({
            ...newPlan,
            meals: [...newPlan.meals, { name: "Snack", detail: "" }]
        });
    };

    const handleRemoveMeal = (index) => {
        const updatedMeals = newPlan.meals.filter((_, i) => i !== index);
        setNewPlan({ ...newPlan, meals: updatedMeals });
    };

    const handleMealChange = (index, field, value) => {
        const updatedMeals = [...newPlan.meals];
        updatedMeals[index][field] = value;
        setNewPlan({ ...newPlan, meals: updatedMeals });
    };

    const handleExportPDF = (plan) => {
        console.log("Exporting Meal Plan PDF for:", plan.title);
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
                ? `http://localhost:5000/api/plans/meal/${newPlan._id}`
                : "http://localhost:5000/api/plans/meal";
            const method = isEdit ? "put" : "post";

            const res = await axios[method](url, newPlan, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (isEdit) {
                setPlans(plans.map(p => p._id === res.data._id ? res.data : p));
            } else {
                setPlans([...plans, res.data]);
            }

            setNewPlan({ title: "", macros: { p: "", c: "" }, meals: [{ name: "Breakfast", detail: "" }, { name: "Lunch", detail: "" }, { name: "Dinner", detail: "" }] });
            setActiveTab("library");
            alert(isEdit ? "Meal plan updated successfully!" : "Meal plan published successfully!");
        } catch (err) {
            console.error("Publish failed", err);
            const errorMsg = err.response?.data?.message || err.message;
            const detail = err.response?.data?.error || "";
            alert(`Failed to publish meal plan: ${errorMsg} ${detail ? `\n\nDetail: ${detail}` : ""}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePlan = async (id) => {
        if (!window.confirm("Are you sure you want to delete this meal plan?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:5000/api/plans/meal/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPlans(plans.filter(p => p._id !== id));
            alert("Meal plan deleted successfully");
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete meal plan");
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
                planModel: "MealPlan"
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`Successfully assigned ${selectedPlan.title} to student!`);
            setShowAssignModal(false);
        } catch (err) {
            console.error("Assignment failed", err);
            alert("Failed to assign meal plan");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-slate-900 pt-24 px-6 relative print:p-0">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100 -z-10 print:hidden"></div>

            <div className="max-w-6xl mx-auto">
                {/* Header Information */}
                <header className="mb-10 print:hidden">
                    <h2 className="text-4xl font-black text-blue-600 tracking-tight">Meal Plans</h2>
                    <p className="text-slate-500 mt-2 text-lg">Design dietary templates and personalized nutrition guides for your students.</p>
                </header>

                {/* Tabs Menu */}
                <div className="flex gap-4 mb-8 border-b border-slate-200 pb-4 print:hidden">
                    <button
                        onClick={() => setActiveTab("library")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm tracking-wider ${activeTab === "library" ? "bg-blue-600 text-slate-900" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                            }`}
                    >
                        <FaUtensils /> Meal Library
                    </button>
                    <button
                        onClick={() => {
                            setNewPlan({ title: "", macros: { p: "", c: "" }, meals: [{ name: "Breakfast", detail: "" }, { name: "Lunch", detail: "" }, { name: "Dinner", detail: "" }] });
                            setActiveTab("creator");
                        }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm tracking-wider ${activeTab === "creator" ? "bg-blue-600 text-slate-900" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                            }`}
                    >
                        <FaLeaf /> Nutrition Planner
                    </button>
                </div>

                {/* Main Content Area */}
                {activeTab === "library" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:hidden">
                        {plans.length > 0 ? (
                            plans.map((plan) => (
                                <div key={plan._id} className="backdrop-blur-md bg-slate-50 border border-slate-200 rounded-2xl p-8 hover:border-blue-600/30 transition-all flex flex-col h-full group relative">
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
                                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-700 rounded-lg transition-all"
                                            title="Delete Plan"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                    <div className="mb-6">
                                        <h3 className="text-2xl font-bold tracking-tight mb-2 pr-12">{plan.title}</h3>
                                        <div className="flex gap-1">
                                            <span className="bg-blue-600/10 text-blue-600 text-[9px] font-black px-1.5 py-0.5 rounded tracking-tighter uppercase">P: {plan.macros.p}%</span>
                                            <span className="bg-blue-500/10 text-blue-400 text-[9px] font-black px-1.5 py-0.5 rounded tracking-tighter uppercase">C: {plan.macros.c}%</span>
                                        </div>
                                    </div>
                                    <p className="text-slate-500 text-sm mb-6 flex-grow">{plan.desc || "Professional nutritional guide designed for Smart Gym members."}</p>

                                    <div className="space-y-4 mb-8">
                                        {plan.meals.slice(0, 3).map((meal, idx) => (
                                            <div key={idx} className="border-b border-white/5 pb-3">
                                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-1">{meal.name}</span>
                                                <span className="text-slate-900 text-xs font-semibold leading-tight">{meal.detail}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleExportPDF(plan)}
                                            className="flex-1 bg-slate-100 hover:bg-white/15 text-slate-900 py-3 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-2 border border-slate-200"
                                        >
                                            <FaDownload /> PDF
                                        </button>
                                        <button
                                            onClick={() => handleOpenAssignModal(plan)}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700/90 text-slate-900 py-3 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                                        >
                                            <FaUserPlus /> Send
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border border-slate-200">
                                <p className="text-slate-600 font-medium italic">No meal plans found in your library.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="backdrop-blur-md bg-slate-50 border border-slate-200 rounded-2xl p-8 max-w-4xl mx-auto print:hidden">
                        <div className="mb-8 border-b border-slate-200 pb-6">
                            <h3 className="text-xl font-bold text-blue-600 tracking-tight mb-6">
                                {newPlan._id ? "Edit Meal Plan" : "Plan Identity & Macros"}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] text-slate-600 font-black uppercase tracking-widest block mb-2">Meal Plan Title</label>
                                    <input
                                        className="w-full bg-blue-50/40 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-600/50 transition-all font-medium"
                                        placeholder="E.g. Summer Shred Nutrition"
                                        value={newPlan.title}
                                        onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-blue-600 font-black uppercase tracking-widest block mb-2">Protein %</label>
                                    <input
                                        className="w-full bg-blue-50/40 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-center focus:border-blue-600/50 outline-none transition-all"
                                        placeholder="40"
                                        value={newPlan.macros.p}
                                        onChange={(e) => setNewPlan({ ...newPlan, macros: { ...newPlan.macros, p: e.target.value } })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-blue-400 font-black uppercase tracking-widest block mb-2">Carbs %</label>
                                    <input
                                        className="w-full bg-blue-50/40 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-center focus:border-blue-400/50 outline-none transition-all"
                                        placeholder="30"
                                        value={newPlan.macros.c}
                                        onChange={(e) => setNewPlan({ ...newPlan, macros: { ...newPlan.macros, c: e.target.value } })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-blue-600 tracking-tight">Structured Meals</h3>
                                <button
                                    onClick={handleAddMeal}
                                    className="text-slate-900 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                                >
                                    <FaPlus /> Add Meal
                                </button>
                            </div>

                            <div className="space-y-4">
                                {newPlan.meals.map((meal, idx) => (
                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-blue-50/20 p-5 rounded-xl border border-white/5">
                                        <div className="md:col-span-3">
                                            <label className="text-[10px] text-slate-500 mb-1 block">Meal Name</label>
                                            <input
                                                className="w-full bg-blue-50/40 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-bold"
                                                placeholder="Breakfast"
                                                value={meal.name}
                                                onChange={(e) => handleMealChange(idx, "name", e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-7">
                                            <label className="text-[10px] text-slate-500 mb-1 block">Recommended Foods / Quantities</label>
                                            <textarea
                                                className="w-full bg-blue-50/40 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 resize-none"
                                                placeholder="3 Egg Whites, 1 Whole Egg, 1/2 Cup Oats..."
                                                rows="1"
                                                value={meal.detail}
                                                onChange={(e) => handleMealChange(idx, "detail", e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <button
                                                onClick={() => handleRemoveMeal(idx)}
                                                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 py-2 rounded-lg transition-all"
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
                                className="w-full bg-blue-600 hover:bg-blue-700/90 text-slate-900 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                            >
                                {loading ? (newPlan._id ? "Updating..." : "Publishing...") : (newPlan._id ? "Update" : "Publish")}
                            </button>
                        </div>
                    </div>
                )}

                {/* Print-Only Professional Nutritional Guide */}
                {selectedPlan && (
                    <div className="hidden print:block text-black bg-white p-12 h-screen overflow-hidden font-serif">
                        {/* Office Header */}
                        <div className="flex justify-between items-start border-b-8 border-black pb-8 mb-12">
                            <div>
                                <h1 className="text-5xl font-black uppercase tracking-tighter leading-none mb-2 italic text-blue-600">Meal Plan</h1>
                                <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Gym Management System</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold uppercase tracking-widest leading-none">{selectedPlan.title}</p>
                                <p className="text-xs font-medium text-slate-500 mt-2">{selectedPlan.name}</p>
                            </div>
                        </div>

                        {/* Document Metadata Grid */}
                        <div className="grid grid-cols-3 gap-0 border-2 border-black mb-12">
                            <div className="border-r-2 border-black p-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1">Issue Date</label>
                                <p className="font-bold text-sm tracking-tight">{new Date().toLocaleDateString()}</p>
                            </div>
                            <div className="border-r-2 border-black p-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1 text-blue-600">Protein Target</label>
                                <p className="font-bold text-sm">{selectedPlan.macros.p}</p>
                            </div>
                            <div className="p-4 bg-gray-50">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1 text-blue-600">Carb Target</label>
                                <p className="font-bold text-sm">{selectedPlan.macros.c}</p>
                            </div>
                        </div>

                        {/* Meal Schedule - High Contrast */}
                        <div className="space-y-12">
                            {selectedPlan.meals.map((meal, i) => (
                                <div key={i} className="flex gap-12 border-b-2 border-black/5 pb-8 last:border-none">
                                    <div className="w-48 shrink-0">
                                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Time</h3>
                                        <p className="text-2xl font-black uppercase tracking-tighter italic">{meal.name}</p>
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Meal Details</h3>
                                        <p className="text-xl font-bold leading-relaxed text-gray-900">{meal.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Professional Disclaimer / Footer */}
                        <div className="mt-auto pt-16 border-t-4 border-black grid grid-cols-3 gap-12">
                            <div className="col-span-2">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-4">Nutritional Advisory & Disclosure</h4>
                                <p className="text-xs text-gray-600 leading-relaxed text-justify">
                                    These meal plans are designed to support your fitness goals and improve metabolic health. All macronutrient calculations are estimates based on standard caloric values. Please stay hydrated and monitor how you feel.
                                </p>
                            </div>
                            <div className="flex flex-col items-end justify-between uppercase">
                                <div className="text-right border-l-4 border-black pl-6">
                                    <p className="text-xs font-black text-slate-600 mb-1">Trainer / Publisher</p>
                                    <p className="text-sm font-bold uppercase">{trainer?.name || "Smart Gym Official"}</p>
                                    <p className="text-[10px] text-slate-500 lowercase">{trainer?.email}</p>
                                    <p className="text-[10px] text-slate-500 mt-1">Validated: {new Date().getFullYear()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Assignment Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-blue-50/80 backdrop-blur-sm" onClick={() => setShowAssignModal(false)}></div>
                    <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
                        <h3 className="text-2xl font-bold text-blue-600 mb-6 tracking-tight">Assign Meal Plan</h3>
                        <p className="text-slate-500 mb-6 text-sm italic">Selection: "{selectedPlan?.title}"</p>

                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {students.length > 0 ? students.map(student => (
                                <button
                                    key={student._id}
                                    onClick={() => handleAssignToStudent(student._id)}
                                    className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-blue-700/10 hover:border-blue-600/50 transition-all group"
                                >
                                    <div className="flex flex-col items-start">
                                        <span className="font-bold text-sm">{student.name}</span>
                                        <span className="text-[10px] text-slate-600">{student.email}</span>
                                    </div>
                                    <FaPlus className="text-gray-600 group-hover:text-blue-600 transition-colors" />
                                </button>
                            )) : (
                                <p className="text-center text-slate-600 py-6">No students assigned to you yet.</p>
                            )}
                        </div>

                        <button
                            onClick={() => setShowAssignModal(false)}
                            className="w-full mt-6 bg-slate-50 hover:bg-slate-100 text-slate-500 py-3 rounded-xl font-bold transition-all text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainerMealPlans;




