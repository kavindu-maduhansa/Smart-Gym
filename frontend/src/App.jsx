import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./ProtectedRoute";

// PUBLIC
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// STUDENT
import Profile from "./pages/Profile";
import StudentDashboard from "./pages/StudentDashboard";
import EditProfile from "./pages/EditProfile";
import Membership from "./pages/Membership";
import RenewMembership from "./pages/RenewMembership";
import StudentSupplementStore from "./pages/StudentSupplementStore";

// ADMIN
import AdminDashboard from "./pages/AdminDashboard";
import AdminInventoryDashboard from "./pages/AdminInventoryDashboard";
import AddItem from "./pages/AddItem";
import DisplayAllInventory from "./pages/DisplayAllInventory"; // ✅ NEW
import ManageInventory from "./pages/ManageInventory"; // ✅ NEW - MANAGE & UPDATE/DELETE

import Users from "./pages/Users";
import ViewUser from "./pages/ViewUser";
import EditUser from "./pages/EditUser";
import MembershipManagement from "./pages/MembershipManagement";
import AdminRenewMembership from "./pages/AdminRenewMembership";
import AdminRenewRequests from "./pages/AdminRenewRequests";
import ScheduleManagement from "./pages/ScheduleManagement";
import AdminSupplementStore from "./pages/AdminSupplementStore";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ================= STUDENT ================= */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/student-dashboard" element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/edit-profile" element={<ProtectedRoute requiredRole="student"><EditProfile /></ProtectedRoute>} />
        <Route path="/membership" element={<ProtectedRoute requiredRole="student"><Membership /></ProtectedRoute>} />
        <Route path="/renew-membership" element={<ProtectedRoute requiredRole="student"><RenewMembership /></ProtectedRoute>} />
        <Route path="/supplement-store" element={<ProtectedRoute requiredRole="student"><StudentSupplementStore /></ProtectedRoute>} />

        {/* ================= ADMIN ================= */}
        <Route path="/admin-dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />

        <Route path="/admin/inventory-dashboard" element={<ProtectedRoute requiredRole="admin"><AdminInventoryDashboard /></ProtectedRoute>} />

        <Route path="/admin/add-item" element={<ProtectedRoute requiredRole="admin"><AddItem /></ProtectedRoute>} />

        {/* ✅ NEW: VIEW ALL INVENTORY */}
        <Route path="/admin/inventory" element={<ProtectedRoute requiredRole="admin"><DisplayAllInventory /></ProtectedRoute>} />

        {/* ✅ NEW: MANAGE (UPDATE/DELETE) INVENTORY */}
        <Route path="/admin/manage" element={<ProtectedRoute requiredRole="admin"><ManageInventory /></ProtectedRoute>} />

        {/* ================= USERS ================= */}
        <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><Users /></ProtectedRoute>} />
        <Route path="/admin/users/:id" element={<ProtectedRoute requiredRole="admin"><ViewUser /></ProtectedRoute>} />
        <Route path="/admin/users/edit/:id" element={<ProtectedRoute requiredRole="admin"><EditUser /></ProtectedRoute>} />

        {/* ================= MEMBERSHIP ================= */}
        <Route path="/admin/memberships" element={<ProtectedRoute requiredRole="admin"><MembershipManagement /></ProtectedRoute>} />
        <Route path="/admin/memberships/renew/:id" element={<ProtectedRoute requiredRole="admin"><AdminRenewMembership /></ProtectedRoute>} />
        <Route path="/admin/renew-requests" element={<ProtectedRoute requiredRole="admin"><AdminRenewRequests /></ProtectedRoute>} />

        {/* ================= SCHEDULE ================= */}
        <Route path="/admin/schedules" element={<ProtectedRoute requiredRole="admin"><ScheduleManagement /></ProtectedRoute>} />

        {/* ================= STORE ================= */}
        <Route path="/admin/store" element={<ProtectedRoute requiredRole="admin"><AdminSupplementStore /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App;