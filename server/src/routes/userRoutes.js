const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getMe, updateMe } = require('../controllers/userController');

const router = express.Router();

// Routes for regular logged-in users
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);

module.exports = router;
