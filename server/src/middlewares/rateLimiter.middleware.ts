import rateLimit from 'express-rate-limit';

// ── Auth Rate Limiter ─────────────────────────────────────────────────────────
// Applies to /api/auth/* routes — max 10 requests per 15 minutes per IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Too many attempts, please try again after 15 minutes' },
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
