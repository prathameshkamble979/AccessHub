import { useState } from "react";
import {
  handleLogin,
  validateLoginForm,
} from "../controllers/auth.controller.web";
import "../styles/auth.css";

interface LoginPageProps {
  onSuccess: () => void;
  onRegister: () => void;
  onForgotPassword: () => void;
}

interface FormState {
  identifier: string;
  password: string;
}

interface ErrorState {
  identifier: string;
  password: string;
}

export function LoginPage({
  onSuccess,
  onRegister,
  onForgotPassword,
}: LoginPageProps) {
  const [form, setForm] = useState<FormState>({ identifier: "", password: "" });
  const [errors, setErrors] = useState<ErrorState>({ identifier: "", password: "" });
  const [alert, setAlert] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAlert(null);

    const validationErrors = validateLoginForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors({
        identifier: validationErrors.identifier || "",
        password: validationErrors.password || "",
      });
      return;
    }

    setLoading(true);
    const result = await handleLogin(form);
    setLoading(false);

    if (result.success) {
      setAlert({ type: "success", message: result.message });
      onSuccess();
    } else {
      setAlert({ type: "error", message: result.message });
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-panel auth-panel--form">
        <div className="form-card">
          <div className="form-logo">Freelance.dev</div>
          <h1 className="form-heading">Welcome back</h1>
          <p className="form-subheading">Sign in to continue to your account</p>

          {alert && (
            <div className={`alert alert--${alert.type} visible`}>
              {alert.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
              <button 
                type="button" 
                onClick={() => { setLoginMethod("email"); setForm(f => ({...f, identifier: ""})); setErrors(e => ({...e, identifier: ""})); }}
                style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", border: loginMethod === "email" ? "2px solid var(--primary-color)" : "1px solid var(--border-color)", background: "transparent", cursor: "pointer", color: "var(--text-primary)", fontWeight: loginMethod === "email" ? "600" : "400" }}
              >
                Use Email
              </button>
              <button 
                type="button" 
                onClick={() => { setLoginMethod("phone"); setForm(f => ({...f, identifier: ""})); setErrors(e => ({...e, identifier: ""})); }}
                style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", border: loginMethod === "phone" ? "2px solid var(--primary-color)" : "1px solid var(--border-color)", background: "transparent", cursor: "pointer", color: "var(--text-primary)", fontWeight: loginMethod === "phone" ? "600" : "400" }}
              >
                Use Mobile
              </button>
            </div>

            <div className="field">
              <label htmlFor="identifier">{loginMethod === "email" ? "Email Address" : "Mobile Number"}</label>
              <input
                id="identifier"
                name="identifier"
                type={loginMethod === "email" ? "email" : "tel"}
                placeholder={loginMethod === "email" ? "you@example.com" : "9876543210"}
                value={form.identifier}
                onChange={handleChange}
                className={errors.identifier ? "has-error" : ""}
                autoComplete={loginMethod === "email" ? "email" : "tel"}
              />
              {errors.identifier && (
                <span className="field-error visible">{errors.identifier}</span>
              )}
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className={errors.password ? "has-error" : ""}
                autoComplete="current-password"
              />
              {errors.password && (
                <span className="field-error visible">{errors.password}</span>
              )}
            </div>

            <div
              style={{
                textAlign: "right",
                marginTop: "-8px",
                marginBottom: "16px",
              }}
            >
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); onForgotPassword(); }}
                style={{
                  fontSize: "13px",
                  color: "var(--accent)",
                  cursor: "pointer",
                }}
              >
                Forgot password?
              </a>
            </div>

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="form-footer">
            Don't have an account?{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); onRegister(); }}>
              Create one
            </a>
          </p>
        </div>
      </div>

      <div className="auth-panel auth-panel--brand">
        <div className="brand-content">
          <h2 className="brand-tagline">
            Welcome to your{" "}
            <br />
            <em>client portal.</em>
          </h2>
          <p className="brand-sub">
            Log in to track your website's progress, review designs, and manage your project seamlessly.
          </p>
        </div>
      </div>
    </div>
  );
}
