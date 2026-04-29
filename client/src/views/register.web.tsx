import { useState } from "react";
import {
  handleRegister,
  validateRegisterForm,
} from "../controllers/auth.controller.web";
import "../styles/auth.css";

interface RegisterPageProps {
  onSuccess: () => void;
  onLogin: () => void;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface ErrorState {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export function RegisterPage({ onSuccess, onLogin }: RegisterPageProps) {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ErrorState>({
    name: "",
    email: "",
    phone: "",
    password: "",
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

    const validationErrors = validateRegisterForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors({
        name: validationErrors.name || "",
        email: validationErrors.email || "",
        phone: validationErrors.phone || "",
        password: validationErrors.password || "",
        confirmPassword: validationErrors.confirmPassword || "",
      });
      return;
    }

    setLoading(true);
    const result = await handleRegister(form);
    setLoading(false);

    if (result.success) {
      setAlert({ type: "success", message: result.message });
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } else {
      setAlert({ type: "error", message: result.message });
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-panel auth-panel--form">
        <div className="form-card">
          <div className="form-logo">Freelance.dev</div>
          <h1 className="form-heading">Create account</h1>
          <p className="form-subheading">Get started — it's completely free</p>

          {alert && (
            <div className={`alert alert--${alert.type} visible`}>
              {alert.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Prathamesh Kamble"
                value={form.name}
                onChange={handleChange}
                className={errors.name ? "has-error" : ""}
                autoComplete="name"
              />
              {errors.name && (
                <span className="field-error visible">{errors.name}</span>
              )}
            </div>

            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className={errors.email ? "has-error" : ""}
                autoComplete="email"
              />
              {errors.email && (
                <span className="field-error visible">{errors.email}</span>
              )}
            </div>

            <div className="field">
              <label htmlFor="phone">Phone number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="9876543210"
                value={form.phone}
                onChange={handleChange}
                className={errors.phone ? "has-error" : ""}
                autoComplete="tel"
              />
              {errors.phone && (
                <span className="field-error visible">{errors.phone}</span>
              )}
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange}
                className={errors.password ? "has-error" : ""}
                autoComplete="new-password"
              />
              {errors.password && (
                <span className="field-error visible">{errors.password}</span>
              )}
            </div>

            <div className="field">
              <label htmlFor="confirmPassword">Confirm password</label>
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
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="form-footer">
            Already have an account?{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); onLogin(); }}>
              Sign in
            </a>
          </p>
        </div>
      </div>

      <div className="auth-panel auth-panel--brand">
        <div className="brand-content">
          <h2 className="brand-tagline">
            Elevate your
            <br />
            <em>digital presence.</em>
          </h2>
          <p className="brand-sub">
            Partner with a dedicated freelance web developer to build modern,
            high-converting websites for your business.
          </p>
        </div>
      </div>
    </div>
  );
}
