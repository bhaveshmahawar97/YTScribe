import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Filter, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { VideoList } from './VideoList';
import { CustomVideoPlayer } from './CustomVideoPlayer';
import { VideoDetails } from './VideoDetails';
import { TranscriptPanel } from './TranscriptPanel';
import { NotesPanel } from './NotesPanel';
import { LearningAnalytics } from './LearningAnalytics';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { getPlaylist, addVideo, updateVideoStatus } from '../api/playlist';
import { toast } from 'sonner';
import { Input } from './ui/input';

interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  channel: string;
  status: 'completed' | 'watching' | 'towatch';
  progress: number;
}

interface BackendVideo {
  _id: string;
  title: string;
  youtubeUrl: string;
  videoId?: string;
  duration?: number;
  order?: number;
  status: 'not_started' | 'watching' | 'completed';
  thumbnailUrl?: string;
}

interface BackendPlaylist {
  _id: string;
  title: string;
  description?: string;
  progress: number;
  videos: BackendVideo[];
}

interface EnhancedPlaylistViewerProps {
  playlistId: string;
  onBack: () => void;
}

export function EnhancedPlaylistViewer({ playlistId, onBack }: EnhancedPlaylistViewerProps) {
  const [backendPlaylist, setBackendPlaylist] = useState(null as any);
  const [selectedVideo, setSelectedVideo] = useState(null as any);
  const [sortBy, setSortBy] = useState('order');
  const [filterBy, setFilterBy] = useState('all');
  const [activeTab, setActiveTab] = useState('details' as any);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const loadPlaylist = async () => {
    try {
      const data = await getPlaylist(playlistId);
      setBackendPlaylist(data.playlist);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load playlist');
    }
  };

  useEffect(() => {
    loadPlaylist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlistId]);

  const mappedVideos: Video[] = useMemo(() => {
    if (!backendPlaylist) return [];
    const toLabel = (s: BackendVideo['status']): Video['status'] => {
      if (s === 'completed') return 'completed';
      if (s === 'watching') return 'watching';
      return 'towatch';
    };
    const toDuration = (n?: number) => {
      if (!n || n <= 0) return '0:00';
      const m = Math.floor(n / 60);
      const s = n % 60;
      return `${m}:${String(s).padStart(2, '0')}`;
    };
    return [...backendPlaylist.videos]
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((v) => ({
        id: v._id,
        title: v.title,
        url: v.youtubeVideoId ? `https://www.youtube.com/embed/${v.youtubeVideoId}` : (v.youtubeUrl || ''),
        thumbnail: v.thumbnailUrl || (v.videoId ? `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg` : ''),
        duration: toDuration(v.duration),
        channel: '',
        status: toLabel(v.status),
        progress: v.status === 'completed' ? 100 : 0,
      }));
  }, [backendPlaylist]);

  // Calculate playlist statistics
  const completedCount = mappedVideos.filter(v => v.status === 'completed').length;
  const watchingCount = mappedVideos.filter(v => v.status === 'watching').length;
  const toWatchCount = mappedVideos.filter(v => v.status === 'towatch').length;
  const progressPercentage = backendPlaylist?.progress ?? (mappedVideos.length ? Math.round((completedCount / mappedVideos.length) * 100) : 0);

  const handleAddVideo = async () => {
    if (!backendPlaylist) return;
    if (!newTitle.trim() || !newUrl.trim()) {
      toast.error('Provide title and video link');
      return;
    }
    try {
      setLoading(true);
      const data = await addVideo(backendPlaylist._id, { title: newTitle.trim(), youtubeUrl: newUrl.trim() });
      setBackendPlaylist(data.playlist);
      setIsAddModalOpen(false);
      setNewTitle('');
      setNewUrl('');
      toast.success('Video added');
    } catch (e: any) {
      toast.error(e.message || 'Failed to add video');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!backendPlaylist || !selectedVideo) return;
    try {
      setLoading(true);
      const data = await updateVideoStatus(backendPlaylist._id, selectedVideo.id, 'completed');
      setBackendPlaylist(data.playlist);
      toast.success('Marked as completed');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-primary/10 bg-card/50 backdrop-blur-sm sticky top-16 z-40"
      >
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Playlists
          </Button>

          <div className="flex items-start justify-between gap-6">
            {/* Left: Playlist Info */}
            <div className="flex-1">
              <h1 className="text-4xl mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {backendPlaylist?.title || 'Playlist'}
              </h1>
              <p className="text-muted-foreground mb-4">{backendPlaylist?.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{mappedVideos.length} videos</span>
                <span>•</span>
                <span>{completedCount} completed</span>
                <span>•</span>
                <span>{watchingCount} in progress</span>
              </div>
            </div>

            {/* Right: Progress Circle */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-accent/20"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressPercentage / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--primary)" />
                        <stop offset="100%" stopColor="var(--accent)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {progressPercentage}%
                    </span>
                    <span className="text-xs text-muted-foreground">Complete</span>
                  </div>
                </div>
              </div>

              <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Video
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar: Video List */}
          <div className="w-96 flex-shrink-0">
            <div className="sticky top-40">
              {/* Filters */}
              <div className="flex gap-2 mb-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order">Default Order</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                    <SelectItem value="completed">Completed First</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Videos</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="watching">Watching</SelectItem>
                    <SelectItem value="towatch">To Watch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <VideoList
                videos={mappedVideos}
                selectedVideo={selectedVideo}
                onSelectVideo={setSelectedVideo}
                sortBy={sortBy}
                filterBy={filterBy}
              />
            </div>
          </div>

          {/* Right: Video Player & Tabs */}
          <div className="flex-1 min-w-0">
            {selectedVideo ? (
              <div className="space-y-6">
                {/* Video Player */}
                <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                  {selectedVideo?.url ? (
                    <iframe
                      src={selectedVideo.url}
                      title={selectedVideo.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />)
                  : (
                    <CustomVideoPlayer video={selectedVideo} />
                  )}
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl">{selectedVideo.title}</h2>
                  {backendPlaylist?.channelTitle && (
                    <p className="text-sm text-muted-foreground">{backendPlaylist.channelTitle}</p>
                  )}
                </div>
                <div>
                  <Button onClick={handleMarkCompleted} disabled={loading}>
                    Mark as completed
                  </Button>
                </div>

                {/* Tabs */}
                <div className="border-b border-primary/10">
                  <div className="flex gap-1">
                    {[
                      { id: 'details', label: 'Details' },
                      { id: 'transcript', label: 'Transcript' },
                      { id: 'notes', label: 'Notes' },
                      { id: 'analytics', label: 'Analytics' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-3 transition-colors relative ${
                          activeTab === tab.id
                            ? 'text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {tab.label}
                        {activeTab === tab.id && (
                          <motion.div
                            layoutId="activeTabUnderline"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div>
                  {activeTab === 'details' && <VideoDetails video={selectedVideo} />}
                  {activeTab === 'transcript' && <TranscriptPanel videoId={selectedVideo.id} />}
                  {activeTab === 'notes' && <NotesPanel videoId={selectedVideo.id} />}
                  {activeTab === 'analytics' && backendPlaylist && <LearningAnalytics playlist={{
                    id: 0,
                    title: backendPlaylist.title,
                    description: backendPlaylist.description || '',
                    videos: mappedVideos,
                    totalProgress: backendPlaylist.progress,
                  }} />}
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-[600px] text-center"
              >
                <BarChart3 className="w-20 h-20 text-muted-foreground/50 mb-4" />
                <h3 className="text-2xl mb-2 text-muted-foreground">
                  Select a video to start learning
                </h3>
                <p className="text-muted-foreground">
                  Choose a video from the list to begin your learning journey
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Add Video Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsAddModalOpen(false)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-primary/20 rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg mb-4">Add Video</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm">Video Title</label>
                <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Awesome video" />
              </div>
              <div>
                <label className="text-sm">Video Link</label>
                <Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button onClick={handleAddVideo} disabled={loading}>
                  {loading ? 'Adding...' : 'Add'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
