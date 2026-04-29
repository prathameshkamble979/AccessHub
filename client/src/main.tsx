import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { getActiveUser, setActiveSession } from "./controllers/api.client";
import { LoginPage } from "./views/login.web";
import { RegisterPage } from "./views/register.web";
import { ForgotPasswordPage } from "./views/forget-password.web";
import { VerifyOTPPage } from "./views/verify-otp.web";
import { ResetPasswordPage } from "./views/reset-password.web";
import { DashboardPage } from "./views/dashboard.web";

type Page =
  | "login"
  | "register"
  | "forgot-password"
  | "verify-otp"
  | "reset-password"
  | "dashboard";

// eslint-disable-next-line react-refresh/only-export-components
function App() {
  const [page, setPage] = useState<Page>("login");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  if (page === "register") {
    return (
      <RegisterPage
        onSuccess={() => setPage("login")}
        onLogin={() => setPage("login")}
      />
    );
  }

  if (page === "forgot-password") {
    return (
      <ForgotPasswordPage
        onOTPSent={(sentEmail) => {
          setEmail(sentEmail);
          setPage("verify-otp");
        }}
        onBack={() => setPage("login")}
      />
    );
  }

  if (page === "verify-otp") {
    return (
      <VerifyOTPPage
        email={email}
        onVerified={(verifiedEmail, verifiedOtp) => {
          setEmail(verifiedEmail);
          setOtp(verifiedOtp);
          setPage("reset-password");
        }}
        onBack={() => setPage("forgot-password")}
      />
    );
  }

  if (page === "reset-password") {
    return (
      <ResetPasswordPage
        email={email}
        otp={otp}
        onSuccess={() => {
          setEmail("");
          setOtp("");
          setPage("login");
        }}
        onBack={() => setPage("login")}
      />
    );
  }

  if (page === "dashboard") {
    const active = getActiveUser();
    if (!active) {
      setTimeout(() => setPage("login"), 0);
      return null;
    }
    return (
      <DashboardPage
        user={active}
        onLogout={() => {
          setActiveSession(null);
          setPage("login");
        }}
      />
    );
  }

  return (
    <LoginPage
      onSuccess={() => setPage("dashboard")}
      onRegister={() => setPage("register")}
      onForgotPassword={() => setPage("forgot-password")}
    />
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
