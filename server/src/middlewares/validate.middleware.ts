import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// ── Reusable validator runner ─────────────────────────────────────────────────
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0]?.msg || 'Validation error' });
    return;
  }
  next();
};

// ── Auth Validators ───────────────────────────────────────────────────────────
export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Full name is required'),
  body('email').optional().isEmail().withMessage('Enter a valid email'),
  body('phone')
    .optional()
    .matches(/^\d{10}$/)
    .withMessage('Enter a valid 10-digit phone number'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
];

export const loginValidator = [
  body('identifier').trim().notEmpty().withMessage('Email or phone is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const googleLoginValidator = [
  body('idToken').trim().notEmpty().withMessage('Google token is required'),
];

// ── OTP Validators ────────────────────────────────────────────────────────────
export const forgotPasswordValidator = [
  body('identifier').trim().notEmpty().withMessage('Email or phone is required'),
  body('method')
    .isIn(['email', 'sms'])
    .withMessage('Method must be email or sms'),
];

export const verifyOtpValidator = [
  body('identifier').trim().notEmpty().withMessage('Identifier is required'),
  body('otp')
    .matches(/^\d{6}$/)
    .withMessage('OTP must be 6 digits'),
];

export const resetPasswordValidator = [
  body('identifier').trim().notEmpty().withMessage('Identifier is required'),
  body('otp')
    .matches(/^\d{6}$/)
    .withMessage('OTP must be 6 digits'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),
];

// ── User Profile Validators ───────────────────────────────────────────────────
export const updateProfileValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone')
    .optional()
    .matches(/^\d{10}$/)
    .withMessage('Enter a valid 10-digit phone number'),
];

export const updatePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),
];
