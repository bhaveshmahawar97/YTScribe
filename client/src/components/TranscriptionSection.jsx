import { useEffect, useMemo, useRef, useState } from 'react';
import { createYoutubeTranscript } from '../api/transcript';
import { Loader2, Link as LinkIcon, Clock } from 'lucide-react';

const formatTime = (ms) => {
  const totalSeconds = Math.floor((ms || 0) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

function buildUrlWithTime(originalUrl, seconds) {
  try {
    const url = new URL(originalUrl);
    if (url.hostname.includes('youtu.be')) {
      url.searchParams.set('t', `${Math.floor(seconds)}s`);
      return url.toString();
    }
    url.searchParams.set('t', Math.floor(seconds).toString());
    return url.toString();
  } catch {
    return originalUrl;
  }
}

export default function TranscriptionSection() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [segments, setSegments] = useState([]);
  const [fullText, setFullText] = useState('');
  const [error, setError] = useState('');
  const [showFallbackNote, setShowFallbackNote] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (loading) {
      timerRef.current = setTimeout(() => setShowFallbackNote(true), 3000);
    } else {
      setShowFallbackNote(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [loading]);

  const hasResults = segments && segments.length > 0;

  const handleTranscribe = async () => {
    try {
      setError('');
      setSegments([]);
      setFullText('');
      if (!url.trim()) {
        setError('Please paste a YouTube URL');
        return;
      }
      setLoading(true);
      const data = await createYoutubeTranscript(url.trim());
      const segs = Array.isArray(data?.segments) ? data.segments : [];
      setSegments(segs);
      setFullText(typeof data?.fullText === 'string' ? data.fullText : (Array.isArray(segs) ? segs.map(s => s.text).join(' ') : ''));
    } catch (e) {
      setError(e?.message || 'Failed to transcribe');
    } finally {
      setLoading(false);
    }
  };

  const onTimestampClick = (offsetMs) => {
    const seconds = Math.floor((offsetMs || 0) / 1000);
    const u = buildUrlWithTime(url, seconds);
    window.open(u, '_blank', 'noopener,noreferrer');
  };

  const renderedSegments = useMemo(() => (segments || []).map((s, idx) => {
    const rawOffset = typeof s?.offset === 'number' ? s.offset : (typeof s?.start === 'number' ? s.start : 0);
    const rawDuration = typeof s?.duration === 'number' ? s.duration : (typeof s?.dur === 'number' ? s.dur : 0);
    // Normalize to ms: if looks like seconds (small number), convert to ms; if already large, assume ms
    const offset = rawOffset > 10000 ? rawOffset : Math.floor(rawOffset * 1000);
    const duration = rawDuration > 10000 ? rawDuration : Math.floor(rawDuration * 1000);
    return {
      text: s?.text || '',
      offset,
      duration,
      key: `${idx}-${offset}`,
    };
  }), [segments]);

  return (
    <div className="w-full max-w-3xl mx-auto py-10 px-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-blue-400 shrink-0" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube URL"
              className="w-full rounded-md bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 px-3 py-2 text-slate-100 placeholder-slate-500"
            />
          </div>
          <button
            onClick={handleTranscribe}
            disabled={loading}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2 text-slate-50 font-medium"
          >
            {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Transcribing…</>) : 'Transcribe'}
          </button>
        </div>
        {loading && showFallbackNote && (
          <div className="mt-3 text-sm text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" /> Using AI fallback...
          </div>
        )}
        {!!error && (
          <div className="mt-3 text-sm text-red-400">{error}</div>
        )}
      </div>

      {hasResults && (
        <div className="mt-6 space-y-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-200 text-sm leading-6 max-h-64 overflow-auto">
              {fullText}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
            <h3 className="text-slate-100 mb-3 font-medium">Segments</h3>
            <div className="max-h-80 overflow-auto divide-y divide-slate-800">
              {renderedSegments.map((s) => (
                <div key={s.key} className="py-3">
                  <button
                    onClick={() => onTimestampClick(s.offset)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-mono"
                  >
                    {formatTime(s.offset)}
                  </button>
                  <div className="text-sm text-slate-200 mt-1 leading-6">
                    {s.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Named export to support `import { TranscriptionSection } from './components/TranscriptionSection'`
export { TranscriptionSection };
