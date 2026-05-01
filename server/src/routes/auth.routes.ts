import express from 'express';
import { loginUser, registerUser } from '../controllers/auth.controller';
import { registerValidator, loginValidator, validate } from '../middlewares/validate.middleware';
import { authLimiter } from '../middlewares/rateLimiter.middleware';

const router = express.Router();

// Apply rate limiter to all auth routes
router.use(authLimiter);

router.post('/register', registerValidator, validate, registerUser);
router.post('/login', loginValidator, validate, loginUser);

export default router;
