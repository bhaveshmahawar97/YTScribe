import express from 'express';
import authMw from '../middleware/authMiddleware.js';
import { getUsers, updateUserRole, getDashboard, adminLogin } from '../controllers/adminController.js';

const router = express.Router();
const { protect, adminOnly } = authMw;

router.post('/login', adminLogin);

// Admin-only routes
router.get('/users', protect, adminOnly, getUsers);
router.patch('/users/:id/role', protect, adminOnly, updateUserRole);
router.get('/dashboard', protect, adminOnly, getDashboard);

export default router;
