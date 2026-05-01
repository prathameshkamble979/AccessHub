import express from 'express';
import {
  getDashboardData,
  updateProfile,
  updateProfilePicture,
  updatePassword,
} from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';
import {
  updateProfileValidator,
  updatePasswordValidator,
  validate,
} from '../middlewares/validate.middleware';

const router = express.Router();

router.put('/profile', protect, updateProfileValidator, validate, updateProfile);
router.put('/profile-picture', protect, updateProfilePicture);
router.put('/password', protect, updatePasswordValidator, validate, updatePassword);

export default router;
