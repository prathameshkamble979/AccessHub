import express from 'express';
import { forgotPassword, verifyOtp, resetPassword } from '../controllers/otp.controller';
import {
  forgotPasswordValidator,
  verifyOtpValidator,
  resetPasswordValidator,
  validate,
} from '../middlewares/validate.middleware';
import { otpLimiter } from '../middlewares/rateLimiter.middleware';

const router = express.Router();

// Apply rate limiter to all OTP routes
router.use(otpLimiter);

router.post('/forgot-password', forgotPasswordValidator, validate, forgotPassword);
router.post('/verify', verifyOtpValidator, validate, verifyOtp);
router.post('/reset-password', resetPasswordValidator, validate, resetPassword);

export default router;
