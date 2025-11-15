import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, BookOpen, Play, Trash2, Edit, Download, Upload, Youtube } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { AddPlaylistModal } from './AddPlaylistModal';
import { EnhancedPlaylistViewer } from './EnhancedPlaylistViewer';
import { CourseCreatorPanel } from './CourseCreatorPanel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

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
  createdAt: Date;
}

export function LearningJourney() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatorPanelOpen, setIsCreatorPanelOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([
    {
      id: 1,
      title: 'Web Development Fundamentals',
      description: 'Learn the basics of HTML, CSS, and JavaScript',
      totalProgress: 50,
      videos: [
        {
          id: '1',
          title: 'HTML Basics Tutorial - Complete Guide for Beginners',
          url: 'https://youtube.com/watch?v=example1',
          thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
          duration: '15:30',
          channel: 'Code Academy',
          status: 'completed',
          progress: 100,
        },
        {
          id: '2',
          title: 'CSS Flexbox Complete Guide',
          url: 'https://youtube.com/watch?v=example2',
          thumbnail: 'https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?w=400',
          duration: '22:45',
          channel: 'Design Masters',
          status: 'watching',
          progress: 45,
        },
        {
          id: '3',
          title: 'JavaScript ES6 Features',
          url: 'https://youtube.com/watch?v=example3',
          thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400',
          duration: '18:20',
          channel: 'JS Pro',
          status: 'towatch',
          progress: 0,
        },
        {
          id: '4',
          title: 'Building Your First Website',
          url: 'https://youtube.com/watch?v=example4',
          thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400',
          duration: '25:10',
          channel: 'Web Dev Pro',
          status: 'towatch',
          progress: 0,
        },
      ],
      createdAt: new Date(),
    },
    {
      id: 2,
      title: 'Demo Testing Playlist',
      description: 'Test the video player and playlist functionality with real YouTube video',
      totalProgress: 0,
      videos: [
        {
          id: 'demo1',
          title: 'Demo Video - Test Player',
          url: 'https://youtu.be/Tn6-PIqc4UM',
          thumbnail: 'https://img.youtube.com/vi/Tn6-PIqc4UM/maxresdefault.jpg',
          duration: '10:00',
          channel: 'Test Channel',
          status: 'towatch',
          progress: 0,
        },
      ],
      createdAt: new Date(),
    },
  ]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  const handleAddPlaylist = (newPlaylist: Omit<Playlist, 'id' | 'createdAt'>) => {
    const playlist: Playlist = {
      ...newPlaylist,
      id: playlists.length + 1,
      createdAt: new Date(),
    };
    setPlaylists([...playlists, playlist]);
  };

  const handleDeletePlaylist = (id: number) => {
    setPlaylists(playlists.filter((p) => p.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Learning Journey
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Organize your YouTube learning with custom playlists
            </p>
          </div>

          {/* Add Playlist Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white px-6 h-12"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Content
                </Button>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setIsCreatorPanelOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                <div>
                  <p>Upload Course</p>
                  <p className="text-xs text-muted-foreground">Create & sell custom courses</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsModalOpen(true)}>
                <Youtube className="mr-2 h-4 w-4" />
                <div>
                  <p>Add YouTube Playlist</p>
                  <p className="text-xs text-muted-foreground">Import from YouTube</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Playlists Grid */}
      {selectedPlaylist ? (
        <EnhancedPlaylistViewer
          playlist={selectedPlaylist}
          onBack={() => setSelectedPlaylist(null)}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist, index) => (
            <motion.div
              key={playlist.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Card className="h-full border-primary/20 hover:border-primary/50 transition-all bg-gradient-to-br from-card to-primary/5 overflow-hidden group cursor-pointer">
                {/* Playlist Header Image */}
                <div
                  className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden"
                  onClick={() => setSelectedPlaylist(playlist)}
                >
                  {playlist.videos.length > 0 && playlist.videos[0].thumbnail ? (
                    <img
                      src={playlist.videos[0].thumbnail}
                      alt={playlist.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-white/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white">
                      {playlist.videos.length} videos
                    </Badge>
                  </div>
                </div>

                {/* Playlist Content */}
                <div className="p-6" onClick={() => setSelectedPlaylist(playlist)}>
                  <h3 className="text-xl mb-2 group-hover:text-primary transition-colors">
                    {playlist.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {playlist.description || 'No description provided'}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      <span>{playlist.videos.length} videos</span>
                    </div>
                    <span>
                      {playlist.totalProgress}% complete
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-primary/10">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlaylist(playlist);
                      }}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Edit functionality
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlaylist(playlist.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {/* Empty State */}
          {playlists.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-20"
            >
              <BookOpen className="w-20 h-20 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-2xl mb-2 text-muted-foreground">No playlists yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first playlist to start organizing your learning journey
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Playlist
              </Button>
            </motion.div>
          )}
        </div>
      )}

      {/* Add Playlist Modal */}
      <AddPlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddPlaylist}
      />

      {/* Course Creator Panel */}
      <CourseCreatorPanel
        isOpen={isCreatorPanelOpen}
        onClose={() => setIsCreatorPanelOpen(false)}
      />
    </div>
  );
}