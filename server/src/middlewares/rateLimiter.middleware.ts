import rateLimit from 'express-rate-limit';

// ── Generic Auth Rate Limiter ─────────────────────────────────────────────────
// Backward-compatible limiter (kept for existing imports)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Too many attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Register should not be blocked by frequent login/google retries.
export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many registration attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const googleAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many Google login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── OTP Rate Limiter ──────────────────────────────────────────────────────────
// Applies to /api/otp/* routes — max 5 OTP requests per 10 minutes per IP
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: { message: 'Too many OTP requests, please try again after 10 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
