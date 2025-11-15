import { useState } from 'react';
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

interface Playlist {
  id: number;
  title: string;
  description: string;
  videos: Video[];
  totalProgress: number;
}

interface EnhancedPlaylistViewerProps {
  playlist: Playlist;
  onBack: () => void;
}

export function EnhancedPlaylistViewer({ playlist, onBack }: EnhancedPlaylistViewerProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [sortBy, setSortBy] = useState('order');
  const [filterBy, setFilterBy] = useState('all');
  const [activeTab, setActiveTab] = useState<'details' | 'transcript' | 'notes' | 'analytics'>('details');

  // Calculate playlist statistics
  const completedCount = playlist.videos.filter(v => v.status === 'completed').length;
  const watchingCount = playlist.videos.filter(v => v.status === 'watching').length;
  const toWatchCount = playlist.videos.filter(v => v.status === 'towatch').length;
  const progressPercentage = Math.round((completedCount / playlist.videos.length) * 100);

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
                {playlist.title}
              </h1>
              <p className="text-muted-foreground mb-4">{playlist.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{playlist.videos.length} videos</span>
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

              <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white">
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
                videos={playlist.videos}
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
                <CustomVideoPlayer video={selectedVideo} />

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
                  {activeTab === 'analytics' && <LearningAnalytics playlist={playlist} />}
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
    </div>
  );
}
