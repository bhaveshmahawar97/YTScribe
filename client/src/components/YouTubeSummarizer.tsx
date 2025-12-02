import { useState } from 'react';
import { Youtube, Video, Headphones, FileText, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { createYoutubeTranscript } from '../api/transcript';
import { AudioSummarizer } from './AudioSummarizer';

interface YouTubeSummarizerProps {
  setActiveSection?: (section: any) => void;
  setTranscriptId?: (id: string) => void;
  setVideoUrl?: (url: string) => void;
}

export function YouTubeSummarizer({ setActiveSection, setTranscriptId, setVideoUrl }: YouTubeSummarizerProps) {
  const [activeTab, setActiveTab] = useState<'youtube' | 'video' | 'audio'>('youtube');
  const [links, setLinks] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);

  const addMoreLink = () => {
    setLinks([...links, '']);
  };

  const updateLink = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const extractYouTubeId = (input: string): string | null => {
    if (!input) return null;
    const match = input.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})(?:&|\?|\/|$)/);
    return match ? match[1] : (input.length === 11 ? input : null);
  };

  const handleGenerateSummary = async () => {
    const validLinks = links.filter((link) => link.trim());
    if (!validLinks.length) {
      toast.error('Please paste at least one YouTube link');
      return;
    }

    const url = validLinks[0];
    const videoId = extractYouTubeId(url);
    if (!videoId) {
      toast.error('Could not extract video ID from URL');
      return;
    }

    try {
      setLoading(true);
      await createYoutubeTranscript(url);

      if (setActiveSection && setTranscriptId) {
        setTranscriptId(videoId);
        if (setVideoUrl) {
          setVideoUrl(url);
        }
        setActiveSection('summary-detail');
      } else {
        toast.success('Transcription completed!');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const exampleVideos = [
    'figma:asset/45fe781c31db21d0700a5c8b08ebe6c3b04bc44e.png',
    'figma:asset/45fe781c31db21d0700a5c8b08ebe6c3b04bc44e.png',
    'figma:asset/45fe781c31db21d0700a5c8b08ebe6c3b04bc44e.png',
    'figma:asset/45fe781c31db21d0700a5c8b08ebe6c3b04bc44e.png',
  ];

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="mb-3">Free YouTube Video Summarizer</h1>
        <p className="text-gray-600">
          Batch summarize YouTube videos in seconds, generating comprehensive and in-depth summaries.
        </p>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 mb-6 justify-center">
        <button
          onClick={() => setActiveTab('youtube')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'youtube'
              ? 'bg-blue-50 text-blue-600'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Youtube size={18} />
          YouTube
        </button>
        <button
          onClick={() => setActiveTab('video')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'video'
              ? 'bg-blue-50 text-blue-600'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Video size={18} />
          Video
        </button>
        <button
          onClick={() => setActiveTab('audio')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'audio'
              ? 'bg-blue-50 text-blue-600'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Headphones size={18} />
          Audio
        </button>
      </div>

      {activeTab === 'audio' || activeTab === 'video' ? (
        <div className="mt-6">
          <AudioSummarizer mode={activeTab === 'video' ? 'video' : 'audio'} />
        </div>
      ) : (
        <>
          {/* YouTube Video Input */}
          <div className="mb-6">
            {links.map((link, index) => (
              <div key={index} className="mb-3">
                <input
                  type="text"
                  value={link}
                  onChange={(e) => updateLink(index, e.target.value)}
                  placeholder="Paste the YouTube video link, for example: https://www.youtube.com/watch?v=example"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
            
            <button
              onClick={addMoreLink}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Plus size={18} />
              Add More Link
            </button>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateSummary}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors mb-8"
          >
            <Sparkles size={18} />
            {loading ? 'Processing…' : 'Get Summary'}
          </button>

          {/* Example Section */}
          <div className="mb-4">
            <h3 className="text-blue-600 mb-4">Example</h3>
            <div className="grid grid-cols-4 gap-4">
              {exampleVideos.map((video, index) => (
                <div
                  key={index}
                  className="aspect-video rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    background: '#1a1a1a',
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <Youtube size={32} className="text-gray-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
