import express from 'express';
import authRoutes from './auth.routes';
import otpRoutes from './otp.routes';
import userRoutes from './user.routes';
import { getDashboardData } from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/otp', otpRoutes);
router.use('/user', userRoutes);

// Root level protected route for dashboard data as expected by frontend
router.get('/dashboard', protect, getDashboardData);

export default router;
