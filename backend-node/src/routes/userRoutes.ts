import express from 'express';
import { getUserProfile } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// The "protect" middleware runs first. If it succeeds, "getUserProfile" runs.
router.get('/me', protect, getUserProfile);

export default router;