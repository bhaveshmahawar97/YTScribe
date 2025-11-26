import express from "express";
import {
  createYoutubeTranscript,
  getTranscriptById,
} from "../controllers/transcriptController.js";

const router = express.Router();

// POST /api/transcript/youtube
router.post("/youtube", createYoutubeTranscript);

// GET /api/transcript/:id
router.get("/:id", getTranscriptById);

export default router;
