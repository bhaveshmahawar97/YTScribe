import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createCourse, getMarketplaceCourses, getAllCourses } from '../controllers/courseController.js';

const router = express.Router();

router.post('/', protect, createCourse);
router.get('/', getAllCourses);
router.get('/marketplace', getMarketplaceCourses);

export default router;
