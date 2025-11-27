import { useState, useEffect } from 'react';
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
import { getMyPlaylists } from '../api/playlist';
import { toast } from 'sonner';

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
  _id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  progress: number;
  videosCount: number;
  createdAt: string;
}

export function LearningJourney() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatorPanelOpen, setIsCreatorPanelOpen] = useState(false);
  const [playlists, setPlaylists] = useState([] as any);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null as any);

  const loadPlaylists = async () => {
    try {
      const data = await getMyPlaylists({ sort: 'recent', limit: 30, page: 1 });
      setPlaylists(data.playlists || []);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load playlists');
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  const handleAddPlaylist = () => {
    // After modal success, refresh list
    loadPlaylists();
  };

  const handleDeletePlaylist = async (id: string) => {
    // Optional: implement delete API if needed later
    toast.message('Delete not implemented yet');
  };

  const wrapperClass = selectedPlaylistId ? 'w-full' : 'container mx-auto px-4 py-12 max-w-7xl';

  return (
    <div className={wrapperClass}>
      {/* Header: Only show when no playlist is selected */}
      {!selectedPlaylistId && (
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
      )}

      {/* Playlists Grid */}
      {selectedPlaylistId ? (
        <EnhancedPlaylistViewer
          playlistId={selectedPlaylistId}
          onBack={() => setSelectedPlaylistId(null)}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist, index) => (
            <motion.div
              key={playlist._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Card className="h-full border-primary/20 hover:border-primary/50 transition-all bg-gradient-to-br from-card to-primary/5 overflow-hidden group cursor-pointer">
                {/* Playlist Header Image */}
                <div
                  className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden"
                  onClick={() => setSelectedPlaylistId(playlist._id)}
                >
                  {playlist.thumbnailUrl ? (
                    <img
                      src={playlist.thumbnailUrl}
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
                      {playlist.videosCount} videos
                    </Badge>
                  </div>
                </div>

                {/* Playlist Content */}
                <div className="p-6" onClick={() => setSelectedPlaylistId(playlist._id)}>
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
                      <span>{playlist.videosCount} videos</span>
                    </div>
                    <span>
                      {playlist.progress || 0}% complete
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
                        setSelectedPlaylistId(playlist._id);
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
                        handleDeletePlaylist(playlist._id);
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