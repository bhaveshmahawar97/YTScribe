import express from 'express';
import { createNote, getNotes } from '../controllers/noteController.js';

const router = express.Router();

// Public simple notes API (can be secured later)
router.get('/', getNotes);
router.post('/', createNote);

export default router;
