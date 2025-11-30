import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2, Sparkles } from 'lucide-react';
import { generatePlaylistVideoNotes } from '../api/playlist';

export default function NotesPanel({ currentVideoUrl, currentVideoId }) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const onGenerate = async () => {
    try {
      setLoading(true);
      setError('');
      const payload = currentVideoId ? { videoId: currentVideoId } : { url: currentVideoUrl };
      const res = await generatePlaylistVideoNotes(payload);
      setNotes(res.notes || '');
    } catch (e) {
      setError(e?.message || 'Failed to generate notes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <button
          onClick={onGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-sm disabled:opacity-50"
        >
          {loading ? (<><Loader2 className="w-4 h-4 animate-spin"/> Reading video and writing notes...</>) : (<><Sparkles className="w-4 h-4"/> Generate AI Notes</>)}
        </button>
      </div>

      {error && <div className="text-red-400 text-sm">{error}</div>}

      {notes && (
        <div className="prose prose-invert max-w-none border border-purple-500/20 bg-purple-900/10 rounded-lg p-4">
          <ReactMarkdown>{notes}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
