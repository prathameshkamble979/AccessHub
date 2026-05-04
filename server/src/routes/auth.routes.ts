import express from 'express';
import { loginUser, registerUser, loginWithGoogle } from '../controllers/auth.controller';
import { registerValidator, loginValidator, googleLoginValidator, validate } from '../middlewares/validate.middleware';
import { registerLimiter, loginLimiter, googleAuthLimiter } from '../middlewares/rateLimiter.middleware';

const router = express.Router();

router.post('/register', registerLimiter, registerValidator, validate, registerUser);
router.post('/login', loginLimiter, loginValidator, validate, loginUser);
router.post('/google', googleAuthLimiter, googleLoginValidator, validate, loginWithGoogle);

export default router;
