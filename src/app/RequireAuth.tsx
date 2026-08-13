import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

/**
 * Wrap any route element that requires login with this.
 * Usage in routes.ts:
 *
 *   { path: "/my-memories", element: <RequireAuth><MyMemoriesScreen /></RequireAuth> }
 */
export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Session is still being checked on first load — avoid a flash-redirect to login.
    return (
      <div className="flex items-center justify-center min-h-full">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
