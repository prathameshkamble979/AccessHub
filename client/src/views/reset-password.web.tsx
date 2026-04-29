import { useState } from "react";
import { handleResetPassword } from "../controllers/otp.controller.web";
import "../styles/auth.css";

interface ResetPasswordPageProps {
  email: string;
  otp: string;
  onSuccess: () => void;
  onBack: () => void;
}

export function ResetPasswordPage({
  email,
  otp,
  onSuccess,
  onBack,
}: ResetPasswordPageProps) {
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [alert, setAlert] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAlert(null);

    setLoading(true);
    const result = await handleResetPassword({
      email,
      otp,
      newPassword: form.newPassword,
      confirmPassword: form.confirmPassword,
    });
    setLoading(false);

    if (result.success) {
      setAlert({ type: "success", message: result.message });
      setTimeout(() => onSuccess(), 2000);
    } else {
      if (result.message.includes("match")) {
        setErrors((prev) => ({ ...prev, confirmPassword: result.message }));
      } else if (result.message.includes("8 characters")) {
        setErrors((prev) => ({ ...prev, newPassword: result.message }));
      } else {
        setAlert({ type: "error", message: result.message });
      }
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-panel auth-panel--form">
        <div className="form-card">
          <div className="form-logo">Freelance.dev</div>
          <h1 className="form-heading">Reset password</h1>
          <p className="form-subheading">
            Set a new password for{" "}
            <strong style={{ color: "var(--text-pri)" }}>{email}</strong>
          </p>

          {alert && (
            <div className={`alert alert--${alert.type} visible`}>
              {alert.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="Min. 8 characters"
                value={form.newPassword}
                onChange={handleChange}
                className={errors.newPassword ? "has-error" : ""}
                autoComplete="new-password"
              />
              {errors.newPassword && (
                <span className="field-error visible">
                  {errors.newPassword}
                </span>
              )}
            </div>

            <div className="field">
              <label htmlFor="confirmPassword">Confirm new password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "has-error" : ""}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <span className="field-error visible">
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset password"}
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
            Almost
            <br />
            <em>there.</em>
          </h2>
          <p className="brand-sub">
            Choose a strong password you haven't used before.
          </p>
        </div>
      </div>
    </div>
  );
}
