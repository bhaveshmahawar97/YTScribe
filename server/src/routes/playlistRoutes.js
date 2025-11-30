import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createPlaylist,
  importPlaylistFromYoutube,
  getMyPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  updateVideoStatus,
  deletePlaylist,
  importYoutubePlaylist,
  getUserPlaylists,
  generatePlaylistVideoNotes,
} from '../controllers/playlistController.js';

const router = express.Router();

router.post('/', protect, createPlaylist);
router.post('/import', protect, importPlaylistFromYoutube);
router.post('/import-youtube', protect, importYoutubePlaylist);
router.get('/', protect, getMyPlaylists);
router.get('/me', protect, getUserPlaylists);
router.get('/:id', protect, getPlaylistById);
router.post('/:id/videos', protect, addVideoToPlaylist);
router.patch('/:id/videos/:videoId/status', protect, updateVideoStatus);
router.delete('/:id', protect, deletePlaylist);

// Generate transient AI notes for a video (no DB writes)
router.post('/notes/generate', protect, generatePlaylistVideoNotes);

export default router;
