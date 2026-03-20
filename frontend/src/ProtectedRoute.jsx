import React from "react";
import { Navigate } from "react-router-dom";

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (requiredRole) {
    const payload = parseJwt(token);
    if (!payload || payload.role !== requiredRole) {
      return <Navigate to="/profile" replace />;
    }
  }
  return children;
};

export default ProtectedRoute;
