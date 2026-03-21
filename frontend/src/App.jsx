import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./ProtectedRoute";

// Student Pages
import Profile from "./pages/Profile";
import StudentDashboard from "./pages/StudentDashboard";
import EditProfile from "./pages/EditProfile";
import Membership from "./pages/Membership";
import RenewMembership from "./pages/RenewMembership";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminUserProfile from "./pages/AdminUserProfile";
import Users from "./pages/Users";
import ViewUser from "./pages/ViewUser";
import EditUser from "./pages/EditUser";
import MembershipManagement from "./pages/MembershipManagement";
import AdminRenewMembership from "./pages/AdminRenewMembership";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-users"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-users/:id"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminUserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute requiredRole="student">
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/membership"
          element={
            <ProtectedRoute requiredRole="student">
              <Membership />
            </ProtectedRoute>
          }
        />
        <Route
          path="/renew-membership"
          element={
            <ProtectedRoute requiredRole="student">
              <RenewMembership />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:id"
          element={
            <ProtectedRoute requiredRole="admin">
              <ViewUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/edit/:id"
          element={
            <ProtectedRoute requiredRole="admin">
              <EditUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/memberships"
          element={
            <ProtectedRoute requiredRole="admin">
              <MembershipManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/memberships/renew/:id"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminRenewMembership />
            </ProtectedRoute>
          }
        />
        {/* Add more routes here as needed */}
      </Routes>
    </>
  );
}

export default App;
