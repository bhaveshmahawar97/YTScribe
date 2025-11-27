import { useEffect, useMemo, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Filter, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const prevCollapsedRef = useRef<boolean>(false);

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

  // Auto-hide global header when a video is active (distraction-free)
  useEffect(() => {
    const cls = 'player-active';
    if (selectedVideo) {
      document.body.classList.add(cls);
    } else {
      document.body.classList.remove(cls);
    }
    return () => document.body.classList.remove(cls);
  }, [selectedVideo]);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSecondsLeft((s) => {
          if (s > 0) return s - 1;
          const nextIsBreak = !isBreak;
          setIsBreak(nextIsBreak);
          return (nextIsBreak ? breakMinutes : workMinutes) * 60;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isBreak, workMinutes, breakMinutes]);

  useEffect(() => {
    if (isFocusMode) {
      // entering focus mode: remember current sidebar state and force collapse
      prevCollapsedRef.current = isSidebarCollapsed;
      setIsSidebarCollapsed(true);
      document.body.classList.add('focus-mode');
      // do not reset timer; preserve current remaining seconds
    } else {
      document.body.classList.remove('focus-mode');
      setIsTimerRunning(false);
      // restore previous sidebar state
      setIsSidebarCollapsed(prevCollapsedRef.current);
    }
    return () => document.body.classList.remove('focus-mode');
  }, [isFocusMode, isBreak, workMinutes, breakMinutes]);

  // Fullscreen tracking and keyboard shortcut (desktop)
  useEffect(() => {
    const onFsChange = () => {
      const el = fullscreenRef.current;
      if (el) {
        if (document.fullscreenElement === el) {
          el.classList.add('is-fullscreen');
        } else {
          el.classList.remove('is-fullscreen');
        }
      }
      if (!document.fullscreenElement && isFocusMode) {
        // If user exited fullscreen via Esc, leave focus mode layout
        setIsFocusMode(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'f' || e.key === 'F') && selectedVideo) {
        e.preventDefault();
        handleToggleFocus(true);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      window.removeEventListener('keydown', onKey);
    };
  }, [isFocusMode, selectedVideo]);

  const requestFullscreenSafe = async () => {
    try {
      if (fullscreenRef.current && !document.fullscreenElement && window.innerWidth > 900) {
        await fullscreenRef.current.requestFullscreen();
        fullscreenRef.current.classList.add('is-fullscreen');
      }
    } catch (err) {
      // Graceful fallback: log for devs; overlay focus mode still applies
      console.warn('Fullscreen request was blocked or failed:', err);
    }
  };

  const exitFullscreenSafe = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      if (fullscreenRef.current) fullscreenRef.current.classList.remove('is-fullscreen');
    } catch (err) {
      // ignore
    }
  };

  const handleToggleFocus = async (fromKeyboard = false) => {
    if (!isFocusMode) {
      setIsFocusMode(true);
      // Only attempt fullscreen on user gesture (click or keydown)
      await requestFullscreenSafe();
    } else {
      setIsFocusMode(false);
      await exitFullscreenSafe();
    }
  };

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
    <div className={`min-h-screen playlist-viewer-root ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Header (hidden when a video is selected for distraction-free viewing) */}
      {!selectedVideo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-primary/10 bg-card/50 backdrop-blur-sm sticky top-16 z-40"
        >
          <div className="w-full px-4 py-6">
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
      )}

      {/* Main Content */}
      <div className="w-full px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar: Video List */}
          <div className="w-96 flex-shrink-0 playlist-sidebar">
            <div className={`${'sticky'} ${selectedVideo ? 'top-4' : 'top-40'}`}>
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
              <div ref={fullscreenRef} className={`${isFocusMode ? 'fixed inset-0 z-50 bg-black/95 p-6 overflow-auto' : ''} space-y-6 relative`}>
                <div className="absolute left-0 top-0 z-10 sidebar-toggle-btn">
                  <Button
                    variant="outline"
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="bg-background/95 backdrop-blur-sm border-primary/20"
                    title={isSidebarCollapsed ? 'Show playlist' : 'Hide playlist'}
                  >
                    {isSidebarCollapsed ? (
                      <ChevronRight className="w-4 h-4" />
                    ) : (
                      <ChevronLeft className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="absolute top-0 right-0 z-10">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedVideo(null as any)}
                    className="bg-background/95 backdrop-blur-sm border-primary/20"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Overview
                  </Button>
                </div>
                <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                  {selectedVideo?.url ? (
                    <iframe
                      src={selectedVideo.url}
                      title={selectedVideo.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <CustomVideoPlayer video={selectedVideo} />
                  )}
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xl">{backendPlaylist?.title}</h2>
                    {backendPlaylist?.description && (
                      <p className="text-sm text-muted-foreground">
                        {backendPlaylist.description.split(' ').slice(0, 50).join(' ')}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Total: {mappedVideos.length}</span>
                      <span>•</span>
                      <span>Completed: {completedCount}</span>
                      <span>•</span>
                      <span>Progress: {progressPercentage}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleToggleFocus(false)}
                      aria-pressed={isFocusMode}
                      aria-expanded={isFocusMode}
                      title={isFocusMode ? 'Exit Focus Mode' : 'Focus Mode'}
                    >
                      {isFocusMode ? 'Exit Focus Mode' : 'Focus Mode'}
                    </Button>
                    <Button onClick={handleMarkCompleted} disabled={loading}>
                      Mark as completed
                    </Button>
                  </div>
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

                {isFocusMode && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-card/90 border border-primary/20 rounded-xl p-4 w-64 text-sm">
                    <div className="mb-2 font-medium">{isBreak ? 'Break' : 'Focus'} Timer</div>
                    <div className="text-3xl mb-3">
                      {Math.floor(secondsLeft / 60).toString().padStart(2, '0')}
                      :
                      {(secondsLeft % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="flex gap-2 mb-3">
                      <Button size="sm" onClick={() => setIsTimerRunning((r) => !r)}>
                        {isTimerRunning ? 'Pause' : 'Start'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setIsTimerRunning(false); setSecondsLeft((isBreak ? breakMinutes : workMinutes) * 60); }}>
                        Reset
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Work (m)</span>
                        <input type="number" className="w-20 bg-background border border-primary/20 rounded px-2 py-1" value={workMinutes}
                          onChange={(e) => setWorkMinutes(Math.max(1, parseInt(e.target.value || '1', 10)))} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Break (m)</span>
                        <input type="number" className="w-20 bg-background border border-primary/20 rounded px-2 py-1" value={breakMinutes}
                          onChange={(e) => setBreakMinutes(Math.max(1, parseInt(e.target.value || '1', 10)))} />
                      </div>
                    </div>
                    {/* Exit affordance inside fullscreen */}
                    <div className="mt-3">
                      <Button size="sm" variant="ghost" onClick={() => handleToggleFocus(false)}>Exit</Button>
                    </div>
                  </div>
                )}

                {isFocusMode && (
                  <div className="fixed top-6 right-6 bottom-6 w-[360px] bg-card/95 border border-primary/20 rounded-xl overflow-auto p-4 z-[60]">
                    <h3 className="text-sm mb-2 text-muted-foreground">Notes</h3>
                    <NotesPanel videoId={selectedVideo.id} />
                  </div>
                )}
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
