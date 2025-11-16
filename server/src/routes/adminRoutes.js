const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getUsers, updateUserRole, getDashboard, adminLogin } = require('../controllers/adminController');

const router = express.Router();

router.post('/login', adminLogin);

// Admin-only routes
router.get('/users', protect, adminOnly, getUsers);
router.patch('/users/:id/role', protect, adminOnly, updateUserRole);
router.get('/dashboard', protect, adminOnly, getDashboard);

module.exports = router;
