import { useState } from "react";
import {
  handleForgotPassword,
} from "../controllers/otp.controller.web";
import "../styles/auth.css";

interface ForgotPasswordPageProps {
  onOTPSent: (email: string) => void;
  onBack: () => void;
}

export function ForgotPasswordPage({
  onOTPSent,
  onBack,
}: ForgotPasswordPageProps) {
  const [identifier, setIdentifier] = useState("");
  const [inputError, setInputError] = useState("");
  const [alert, setAlert] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetMethod, setResetMethod] = useState<"email" | "phone">("email");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAlert(null);
    setInputError("");

    if (!identifier.trim()) {
      setInputError("Please enter your email or phone number");
      return;
    }

    setLoading(true);
    const result = await handleForgotPassword({ identifier, method: resetMethod === "phone" ? "sms" : "email" });
    setLoading(false);

    if (result.success) {
      setAlert({ type: "success", message: result.message });
      setTimeout(() => onOTPSent(identifier), 1500);
    } else {
      setAlert({ type: "error", message: result.message });
      setInputError(result.message);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-panel auth-panel--form">
        <div className="form-card">
          <div className="form-logo">Freelance.dev</div>
          <h1 className="form-heading">Forgot password</h1>
          <p className="form-subheading">
            Enter your details and we'll send an OTP securely.
          </p>

          {alert && (
            <div className={`alert alert--${alert.type} visible`}>
              {alert.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
              <button 
                type="button" 
                onClick={() => { setResetMethod("email"); setIdentifier(""); setInputError(""); }}
                style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", border: resetMethod === "email" ? "2px solid var(--primary-color)" : "1px solid var(--border-color)", background: "transparent", cursor: "pointer", color: "var(--text-primary)", fontWeight: resetMethod === "email" ? "600" : "400" }}
              >
                Use Email
              </button>
              <button 
                type="button" 
                onClick={() => { setResetMethod("phone"); setIdentifier(""); setInputError(""); }}
                style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", border: resetMethod === "phone" ? "2px solid var(--primary-color)" : "1px solid var(--border-color)", background: "transparent", cursor: "pointer", color: "var(--text-primary)", fontWeight: resetMethod === "phone" ? "600" : "400" }}
              >
                Use Mobile
              </button>
            </div>

            <div className="field">
              <label htmlFor="identifier">{resetMethod === "email" ? "Email Address" : "Mobile Number"}</label>
              <input
                id="identifier"
                name="identifier"
                type={resetMethod === "email" ? "email" : "tel"}
                placeholder={resetMethod === "email" ? "you@example.com" : "9876543210"}
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setInputError("");
                }}
                className={inputError ? "has-error" : ""}
                autoComplete={resetMethod === "email" ? "email" : "tel"}
              />
              {inputError && (
                <span className="field-error visible">{inputError}</span>
              )}
            </div>

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>

          <p className="form-footer">
            Remember your password?{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>
              Back to sign in
            </a>
          </p>
        </div>
      </div>

      <div className="auth-panel auth-panel--brand">
        <div className="brand-content">
          <h2 className="brand-tagline">
            Forgot your
            <br />
            <em>password?</em>
          </h2>
          <p className="brand-sub">
            No worries. We'll send a one-time code to your inbox and get you
            back in.
          </p>
        </div>
      </div>
    </div>
  );
}
