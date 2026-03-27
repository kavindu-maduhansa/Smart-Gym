import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
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
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import AdminOrderManagement from "./pages/AdminOrderManagement";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminUserProfile from "./pages/AdminUserProfile";
import Users from "./pages/Users";
import ViewUser from "./pages/ViewUser";
import EditUser from "./pages/EditUser";
import MembershipManagement from "./pages/MembershipManagement";
import AdminRenewMembership from "./pages/AdminRenewMembership";
import AdminRenewRequests from "./pages/AdminRenewRequests";
import ScheduleManagement from "./pages/ScheduleManagement";
import InventoryManagement from "./pages/InventoryManagement";
import AdminSupplementStore from "./pages/AdminSupplementStore";
import StudentSupplementStore from "./pages/StudentSupplementStore";
import AdminContactMessages from "./pages/AdminContactMessages";
import AdminContactMessageView from "./pages/AdminContactMessageView";

import TrainerDashboard from "./pages/TrainerDashboard";
import TrainerSchedules from "./pages/TrainerSchedules";
import TrainerFeedbacks from "./pages/TrainerFeedbacks";
import TrainerBooking from "./pages/TrainerBooking";
import TrainerStudents from "./pages/TrainerStudents";
import TrainerWorkoutPlans from "./pages/TrainerWorkoutPlans";
import TrainerMealPlans from "./pages/TrainerMealPlans";
import TrainerPlansHub from "./pages/TrainerPlansHub";
import Leaderboard from "./pages/Leaderboard";
import Schedules from "./pages/Schedules";
import AiGymAssistant from "./pages/AiGymAssistant";
import ChatWidget from "./components/Chatbot/ChatWidget";

function App() {
  return (
    <>
      <Navbar />
      <ChatWidget />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/schedules" element={<Schedules />} />
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
          path="/ai-gym-assistant"
          element={
            <ProtectedRoute>
              <AiGymAssistant />
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
          path="/supplement-store"
          element={
            <ProtectedRoute>
              <StudentSupplementStore />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
<Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyOrders />
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
        <Route
          path="/admin/renew-requests"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminRenewRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/schedules"
          element={
            <ProtectedRoute requiredRole="admin">
              <ScheduleManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminOrderManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute requiredRole="admin">
              <InventoryManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/store"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminSupplementStore />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trainer-dashboard"
          element={
            <ProtectedRoute requiredRole="trainer">
              <TrainerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/contact-messages"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminContactMessages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/schedules"
          element={
            <ProtectedRoute requiredRole="trainer">
              <TrainerSchedules />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/feedbacks"
          element={
            <ProtectedRoute requiredRole="trainer">
              <TrainerFeedbacks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/students"
          element={
            <ProtectedRoute requiredRole="trainer">
              <TrainerStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/plans"
          element={
            <ProtectedRoute requiredRole="trainer">
              <TrainerWorkoutPlans />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/meal-plans"
          element={
            <ProtectedRoute requiredRole="trainer">
              <TrainerMealPlans />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/manage-plans"
          element={
            <ProtectedRoute requiredRole="trainer">
              <TrainerPlansHub />
            </ProtectedRoute>
          }
        />
        {/* Removed /student/available route for cleanup */}
      <Route path="/my-bookings" element={<ProtectedRoute requiredRole="student"><TrainerBooking /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/admin/contact-messages/:id"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminContactMessageView />
            </ProtectedRoute>
          }
        />
        {/* Add more routes here as needed */}
      </Routes>
    </>
  );
}

export default App;
