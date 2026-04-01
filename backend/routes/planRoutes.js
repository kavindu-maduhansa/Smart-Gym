import express from "express";
import { authenticateJWT } from "../middleware/authMiddleware.js";
import WorkoutPlan from "../models/WorkoutPlan.js";
import MealPlan from "../models/MealPlan.js";
import PlanAssignment from "../models/PlanAssignment.js";

const router = express.Router();

// --- Workout Plans ---

// Create Workout Plan
router.post("/workout", authenticateJWT, async (req, res) => {
  try {
    const { title, exercises, difficulty, isTemplate } = req.body;
    const newWorkout = new WorkoutPlan({
      trainerId: req.user.id,
      title,
      exercises,
      difficulty,
      isTemplate: isTemplate || false,
    });
    await newWorkout.save();
    res.status(201).json(newWorkout);
  } catch (error) {
    res.status(400).json({ message: "Failed to create workout plan", error: error.message });
  }
});

// Get Trainer's Workout Plans + Templates
router.get("/workout", authenticateJWT, async (req, res) => {
  try {
    const plans = await WorkoutPlan.find({
      $or: [{ trainerId: req.user.id }, { isTemplate: true }],
    });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch workout plans", error: error.message });
  }
});

// Update Workout Plan
router.put("/workout/:id", authenticateJWT, async (req, res) => {
  try {
    const { title, exercises, difficulty, isTemplate } = req.body;
    const plan = await WorkoutPlan.findOneAndUpdate(
      { _id: req.params.id, trainerId: req.user.id },
      { title, exercises, difficulty, isTemplate },
      { new: true }
    );
    if (!plan) return res.status(404).json({ message: "Plan not found or unauthorized" });
    res.json(plan);
  } catch (error) {
    res.status(400).json({ message: "Update failed", error: error.message });
  }
});

// Delete Workout Plan
router.delete("/workout/:id", authenticateJWT, async (req, res) => {
  try {
    const plan = await WorkoutPlan.findOneAndDelete({
      _id: req.params.id,
      trainerId: req.user.id,
    });
    if (!plan) return res.status(404).json({ message: "Plan not found or unauthorized" });
    res.json({ message: "Workout plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Deletion failed", error: error.message });
  }
});

// --- Meal Plans ---

// Create Meal Plan
router.post("/meal", authenticateJWT, async (req, res) => {
  try {
    const { title, macros, meals, isTemplate } = req.body;
    const newMeal = new MealPlan({
      trainerId: req.user.id,
      title,
      macros,
      meals,
      isTemplate: isTemplate || false,
    });
    await newMeal.save();
    res.status(201).json(newMeal);
  } catch (error) {
    res.status(400).json({ message: "Failed to create meal plan", error: error.message });
  }
});

// Update Meal Plan
router.put("/meal/:id", authenticateJWT, async (req, res) => {
  try {
    const { title, macros, meals, isTemplate } = req.body;
    const plan = await MealPlan.findOneAndUpdate(
      { _id: req.params.id, trainerId: req.user.id },
      { title, macros, meals, isTemplate },
      { new: true }
    );
    if (!plan) return res.status(404).json({ message: "Plan not found or unauthorized" });
    res.json(plan);
  } catch (error) {
    res.status(400).json({ message: "Update failed", error: error.message });
  }
});

// Get Trainer's Meal Plans + Templates
router.get("/meal", authenticateJWT, async (req, res) => {
  try {
    const plans = await MealPlan.find({
      $or: [{ trainerId: req.user.id }, { isTemplate: true }],
    });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch meal plans", error: error.message });
  }
});

// Delete Meal Plan
router.delete("/meal/:id", authenticateJWT, async (req, res) => {
  try {
    const plan = await MealPlan.findOneAndDelete({
      _id: req.params.id,
      trainerId: req.user.id,
    });
    if (!plan) return res.status(404).json({ message: "Plan not found or unauthorized" });
    res.json({ message: "Meal plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Deletion failed", error: error.message });
  }
});

// --- Assignments ---

// Assign Plan to Student
router.post("/assign", authenticateJWT, async (req, res) => {
  try {
    const { studentId, planId, planModel, notes } = req.body;
    const newAssignment = new PlanAssignment({
      trainerId: req.user.id,
      studentId,
      planId,
      planModel,
      notes,
    });
    await newAssignment.save();
    res.status(201).json({ message: "Plan successfully assigned to student", assignment: newAssignment });
  } catch (error) {
    res.status(400).json({ message: "Failed to assign plan", error: error.message });
  }
});

// Debug endpoint (Temporary)
router.get("/debug", authenticateJWT, async (req, res) => {
  try {
    const mealPlans = await MealPlan.find({});
    const workoutPlans = await WorkoutPlan.find({});
    res.json({
      decodedUser: req.user,
      counts: {
        meals: mealPlans.length,
        workouts: workoutPlans.length
      },
      mealSample: mealPlans.map(p => ({ title: p.title, trainerId: p.trainerId, isTemplate: p.isTemplate })),
      workoutSample: workoutPlans.map(p => ({ title: p.title, trainerId: p.trainerId, isTemplate: p.isTemplate }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Student's Assigned Plans
router.get("/student/assignments", authenticateJWT, async (req, res) => {
  try {
    const assignments = await PlanAssignment.find({ studentId: req.user.id })
      .populate({
        path: "planId",
        select: "title exercises difficulty macros meals" // Fetch fields for both models
      })
      .populate("trainerId", "name email");
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch student assignments", error: error.message });
  }
});

export default router;
