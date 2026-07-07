import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import NotFound from "../pages/NotFound.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Console Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
      </Route>

      {/* Redirect Root Path to Dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
