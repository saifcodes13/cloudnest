import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show a premium dark spinner while profile hydration resolves
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#090d16] text-[#f1f5f9]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-indigo-600 border-[#1e293b]"></div>
        <p className="mt-4 text-sm font-medium text-slate-400">
          Loading CloudNest...
        </p>
      </div>
    );
  }

  // Redirect to login if user session is inactive
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
