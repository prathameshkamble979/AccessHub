import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getActiveUser } from "../controllers/api.client";

export function RoleRoute({ roles }: { roles: string[] }) {
  const user = getActiveUser();
  const location = useLocation();

  if (user === undefined) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Loading session...
      </div>
    );
  }

  // SECURITY WARNING: 
  // Frontend routing is cosmetic! Modifying local storage can bypass this.
  // ALWAYS verify the user's role and permissions on the backend API.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.role || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
