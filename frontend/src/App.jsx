import AdminUserProfile from "./pages/AdminUserProfile";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Profile from "./pages/Profile";
import AdminUsers from "./pages/AdminUsers";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ProtectedRoute from "./ProtectedRoute";

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
        {/* Add more routes here as needed */}
      </Routes>
    </>
  );
}

export default App;
