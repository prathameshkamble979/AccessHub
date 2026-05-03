import { useEffect } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { LoginPage } from "../views/login.web";
import { RegisterPage } from "../views/register.web";
import { ForgotPasswordPage } from "../views/forget-password.web";
import { VerifyOTPPage } from "../views/verify-otp.web";
import { ResetPasswordPage } from "../views/reset-password.web";
import { DashboardPage } from "../views/dashboard.web";
import {
  getActiveUser,
  setActiveSession,
  getDashboardDataApi,
} from "../controllers/api.client";
import { PrivateRoute } from "./PrivateRoute";
import { RoleRoute } from "./RoleRoute";
// import { auth } from "../config/firebase";
// import { signOut } from "firebase/auth";

const ADMIN_ROUTES = ["/admin"];

function AdminPage() {
  return <div>Admin Dashboard</div>;
}

function LoginWrapper() {
  const navigate = useNavigate();
  const location = useLocation();

  // Firebase redirect
  /*
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && location.pathname === "/login") {
        navigate("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [location.pathname]);
  */

  // 24hr logout check
  useEffect(() => {
    const checkSession = async () => {
      const loginTime = localStorage.getItem("login_time");

      if (loginTime) {
        const now = Date.now();
        const diff = now - Number(loginTime);

        if (diff > 24 * 60 * 60 * 1000) {
          // await auth.signOut();
          localStorage.removeItem("login_time");
          navigate("/login");
        }
      }
    };

    checkSession();
  }, [navigate]);

  return (
    <LoginPage
      onSuccess={() => {
        const from = location.state?.from || { pathname: "/dashboard" };
        const user = getActiveUser();

        const isAdminRoute = ADMIN_ROUTES.some(
          (route) =>
            from?.pathname === route || from?.pathname?.startsWith(route + "/"),
        );

        if (isAdminRoute && user?.role !== "admin") {
          navigate("/dashboard", { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      }}
      onRegister={() => navigate("/register")}
      onForgotPassword={() => navigate("/forgot-password")}
    />
  );
}

function RegisterWrapper() {
  const navigate = useNavigate();
  return (
    <RegisterPage
      onSuccess={() => navigate("/login")}
      onLogin={() => navigate("/login")}
    />
  );
}

function ForgotPasswordWrapper() {
  const navigate = useNavigate();
  return (
    <ForgotPasswordPage
      onOTPSent={(sentEmail) =>
        navigate("/verify-otp", { state: { email: sentEmail } })
      }
      onBack={() => navigate("/login")}
    />
  );
}

function VerifyOTPWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  return (
    <VerifyOTPPage
      email={email}
      onVerified={(verifiedEmail, verifiedOtp) =>
        navigate("/reset-password", {
          state: { email: verifiedEmail, otp: verifiedOtp },
        })
      }
      onBack={() => navigate("/forgot-password")}
    />
  );
}

function ResetPasswordWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const otp = location.state?.otp;

  if (!email || !otp) {
    return <Navigate to="/forgot-password" replace />;
  }

  return (
    <ResetPasswordPage
      email={email}
      otp={otp}
      onSuccess={() => navigate("/login")}
      onBack={() => navigate("/login")}
    />
  );
}

function DashboardWrapper() {
  const navigate = useNavigate();
  const user = getActiveUser();

  return (
    <DashboardPage
      user={user!}
      onLogout={() => {
        setActiveSession(null);
        navigate("/login");
      }}
    />
  );
}

/*
function DashboardWrapper() {
  const navigate = useNavigate();

  const firebaseUser = auth.currentUser;

  const user = firebaseUser
    ? {
      name: firebaseUser.displayName || "User",
      email: firebaseUser.email || "",
      profilePicture: firebaseUser.photoURL || "",
    }
    : null;

  if (!user) {
    return <div>Loading user...</div>;
  }

  return (
    <DashboardPage
      user={user}
      onLogout={async () => {
        await signOut(auth); // 🔥 IMPORTANT
        localStorage.removeItem("login_time"); // optional
        navigate("/login");
      }}
    />
  );
}
*/
export function AppRoutes() {
  const navigate = useNavigate();

  // Listen for 401 Unauthorized events from api.client.ts
  useEffect(() => {
    const handleUnauthorized = () => {
      const fullPath =
        window.location.pathname +
        window.location.search +
        window.location.hash;
      navigate("/login", {
        state: { from: { pathname: fullPath } },
        replace: true,
      });
    };
    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, [navigate]);

  // Idle tab fix: Validate session when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      if (getActiveUser()) {
        getDashboardDataApi().catch(() => { });
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginWrapper />} />
      <Route path="/register" element={<RegisterWrapper />} />
      <Route path="/forgot-password" element={<ForgotPasswordWrapper />} />
      <Route path="/verify-otp" element={<VerifyOTPWrapper />} />
      <Route path="/reset-password" element={<ResetPasswordWrapper />} />

      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<DashboardWrapper />} />
      </Route>

      <Route element={<RoleRoute roles={["admin"]} />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
