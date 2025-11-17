import express from "express";
import { createYoutubeTranscript, getTranscriptById } from "../controllers/transcriptController.js";

const router = express.Router();

router.post("/youtube", createYoutubeTranscript);
router.get("/:id", getTranscriptById);

export default router;
