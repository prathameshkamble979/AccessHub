import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getActiveUser } from "../controllers/api.client";

export function PrivateRoute() {
  const activeUser = getActiveUser();
  const location = useLocation();
  
  if (activeUser === undefined) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Loading session...
      </div>
    );
  }

  if (!activeUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
