import { useState } from "react";
import {
  handleVerifyOTP,
  validateOTP,
} from "../controllers/otp.controller.web";
import "../styles/auth.css";

interface VerifyOTPPageProps {
  email: string;
  onVerified: (email: string, otp: string) => void;
  onBack: () => void;
}

export function VerifyOTPPage({
  email,
  onVerified,
  onBack,
}: VerifyOTPPageProps) {
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [alert, setAlert] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAlert(null);
    setOtpError("");

    const error = validateOTP(otp);
    if (error) {
      setOtpError(error);
      return;
    }

    setLoading(true);
    const result = await handleVerifyOTP({ email, otp });
    setLoading(false);

    if (result.success) {
      setAlert({ type: "success", message: result.message });
      setTimeout(() => onVerified(email, otp), 1500);
    } else {
      setAlert({ type: "error", message: result.message });
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-panel auth-panel--form">
        <div className="form-card">
          <div className="form-logo">Freelance.dev</div>
          <h1 className="form-heading">Enter OTP</h1>
          <p className="form-subheading">
            We sent a 6-digit code to{" "}
            <strong style={{ color: "var(--text-pri)" }}>{email}</strong>
          </p>

          {alert && (
            <div className={`alert alert--${alert.type} visible`}>
              {alert.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="otp">6-digit OTP</label>
              <input
                id="otp"
                name="otp"
                type="text"
                placeholder="123456"
                value={otp}
                maxLength={6}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  setOtpError("");
                }}
                className={otpError ? "has-error" : ""}
                autoComplete="one-time-code"
              />
              {otpError && (
                <span className="field-error visible">{otpError}</span>
              )}
            </div>

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <p className="form-footer">
            Didn't receive the code?{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>
              Resend OTP
            </a>
          </p>
        </div>
      </div>

      <div className="auth-panel auth-panel--brand">
        <div className="brand-content">
          <h2 className="brand-tagline">
            Check your
            <br />
            <em>inbox.</em>
          </h2>
          <p className="brand-sub">
            Enter the 6-digit code we sent to your email to verify your
            identity.
          </p>
        </div>
      </div>
    </div>
  );
}
