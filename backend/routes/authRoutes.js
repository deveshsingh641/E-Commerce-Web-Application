import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { createRateLimiter } from '../middleware/securityMiddleware.js';

const router = express.Router();

// Strict rate limiter on login and register: max 15 requests per 15 minutes per IP
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 15,
  message: 'Too many authentication attempts from this IP. Please wait 15 minutes before retrying.',
});

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

export default router;
