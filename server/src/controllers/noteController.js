import Note from '../models/noteModel.js';

export async function createNote(req, res) {
  try {
    const { title, description, content, isAIGenerated, videoId, tags } = req.body || {};
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'title and content are required' });
    }

    const note = await Note.create({
      title,
      description: description || '',
      content,
      isAIGenerated: !!isAIGenerated,
      videoId: videoId || undefined,
      tags: Array.isArray(tags) ? tags : [],
    });

    return res.status(201).json({ success: true, note });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to create note' });
  }
}

export async function getNotes(req, res) {
  try {
    const notes = await Note.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, notes });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch notes' });
  }
}
