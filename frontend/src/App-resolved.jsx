import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./ProtectedRoute";

// PUBLIC
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Schedules from "./pages/Schedules";
import Leaderboard from "./pages/Leaderboard";

// STUDENT
import Profile from "./pages/Profile";
import StudentDashboard from "./pages/StudentDashboard";
import SiteSettings from "./pages/SiteSettings";
import EditAccount from "./pages/EditAccount";
import Membership from "./pages/Membership";
import RenewMembership from "./pages/RenewMembership";
import StudentSupplementStore from "./pages/StudentSupplementStore";
import Cart from "./pages/Cart";
import AiGymAssistant from "./pages/AiGymAssistant";
import TrainerBooking from "./pages/TrainerBooking";
import MyGymNotifications from "./pages/MyGymNotifications";

// ADMIN
import AdminDashboard from "./pages/AdminDashboard";
import AdminInventoryDashboard from "./pages/AdminInventoryDashboard";
import AddItem from "./pages/AddItem";
import DisplayAllInventory from "./pages/DisplayAllInventory";
import ManageInventory from "./pages/ManageInventory";
import Users from "./pages/Users";
import ViewUser from "./pages/ViewUser";
import EditUser from "./pages/EditUser";
import MembershipManagement from "./pages/MembershipManagement";
import AdminRenewMembership from "./pages/AdminRenewMembership";
import AdminRenewRequests from "./pages/AdminRenewRequests";
import ScheduleManagement from "./pages/ScheduleManagement";
import AdminSupplementStore from "./pages/AdminSupplementStore";
import AdminContactMessages from "./pages/AdminContactMessages";
import AdminContactMessageView from "./pages/AdminContactMessageView";

// TRAINER
import TrainerDashboard from "./pages/TrainerDashboard";
import TrainerSchedules from "./pages/TrainerSchedules";
import TrainerFeedbacks from "./pages/TrainerFeedbacks";
import TrainerStudents from "./pages/TrainerStudents";
import TrainerWorkoutPlans from "./pages/TrainerWorkoutPlans";
import TrainerMealPlans from "./pages/TrainerMealPlans";
import TrainerPlansHub from "./pages/TrainerPlansHub";

// COMPONENTS
import ChatWidget from "./components/Chatbot/ChatWidget";

function App() {
  return (
    <>
      <Navbar />
      <ChatWidget />
      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/schedules" element={<Schedules />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ================= STUDENT ================= */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/student-dashboard" element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/edit-profile" element={<Navigate to="/my-settings" replace />} />
        <Route path="/site-settings" element={<Navigate to="/my-settings" replace />} />
        <Route path="/my-settings" element={<ProtectedRoute requiredRole="student"><SiteSettings /></ProtectedRoute>} />
        <Route path="/edit-account" element={<ProtectedRoute requiredRole="student"><EditAccount /></ProtectedRoute>} />
        <Route path="/membership" element={<ProtectedRoute requiredRole="student"><Membership /></ProtectedRoute>} />
        <Route path="/renew-membership" element={<ProtectedRoute requiredRole="student"><RenewMembership /></ProtectedRoute>} />
        <Route path="/supplement-store" element={<ProtectedRoute><StudentSupplementStore /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/ai-gym-assistant" element={<ProtectedRoute><AiGymAssistant /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute requiredRole="student"><TrainerBooking /></ProtectedRoute>} />
        <Route path="/my-notifications" element={<ProtectedRoute requiredRole="student"><MyGymNotifications /></ProtectedRoute>} />

        {/* ================= ADMIN ================= */}
        <Route path="/admin-dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />

        {/* INVENTORY MANAGEMENT */}
        <Route path="/admin/inventory-dashboard" element={<ProtectedRoute requiredRole="admin"><AdminInventoryDashboard /></ProtectedRoute>} />
        <Route path="/admin/add-item" element={<ProtectedRoute requiredRole="admin"><AddItem /></ProtectedRoute>} />
        <Route path="/admin/inventory" element={<ProtectedRoute requiredRole="admin"><DisplayAllInventory /></ProtectedRoute>} />
        <Route path="/admin/manage" element={<ProtectedRoute requiredRole="admin"><ManageInventory /></ProtectedRoute>} />

        {/* USER MANAGEMENT */}
        <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><Users /></ProtectedRoute>} />
        <Route path="/admin/users/:id" element={<ProtectedRoute requiredRole="admin"><ViewUser /></ProtectedRoute>} />
        <Route path="/admin/users/edit/:id" element={<ProtectedRoute requiredRole="admin"><EditUser /></ProtectedRoute>} />

        {/* MEMBERSHIP MANAGEMENT */}
        <Route path="/admin/memberships" element={<ProtectedRoute requiredRole="admin"><MembershipManagement /></ProtectedRoute>} />
        <Route path="/admin/memberships/renew/:id" element={<ProtectedRoute requiredRole="admin"><AdminRenewMembership /></ProtectedRoute>} />
        <Route path="/admin/renew-requests" element={<ProtectedRoute requiredRole="admin"><AdminRenewRequests /></ProtectedRoute>} />

        {/* SCHEDULE MANAGEMENT */}
        <Route path="/admin/schedules" element={<ProtectedRoute requiredRole="admin"><ScheduleManagement /></ProtectedRoute>} />

        {/* STORE MANAGEMENT */}
        <Route path="/admin/store" element={<ProtectedRoute requiredRole="admin"><AdminSupplementStore /></ProtectedRoute>} />

        {/* CONTACT MESSAGES */}
        <Route path="/admin/contact-messages" element={<ProtectedRoute requiredRole="admin"><AdminContactMessages /></ProtectedRoute>} />
        <Route path="/admin/contact-messages/:id" element={<ProtectedRoute requiredRole="admin"><AdminContactMessageView /></ProtectedRoute>} />

        {/* ================= TRAINER ================= */}
        <Route path="/trainer-dashboard" element={<ProtectedRoute requiredRole="trainer"><TrainerDashboard /></ProtectedRoute>} />
        <Route path="/trainer/schedules" element={<ProtectedRoute requiredRole="trainer"><TrainerSchedules /></ProtectedRoute>} />
        <Route path="/trainer/feedbacks" element={<ProtectedRoute requiredRole="trainer"><TrainerFeedbacks /></ProtectedRoute>} />
        <Route path="/trainer/students" element={<ProtectedRoute requiredRole="trainer"><TrainerStudents /></ProtectedRoute>} />
        <Route path="/trainer/plans" element={<ProtectedRoute requiredRole="trainer"><TrainerWorkoutPlans /></ProtectedRoute>} />
        <Route path="/trainer/meal-plans" element={<ProtectedRoute requiredRole="trainer"><TrainerMealPlans /></ProtectedRoute>} />
        <Route path="/trainer/manage-plans" element={<ProtectedRoute requiredRole="trainer"><TrainerPlansHub /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App;
