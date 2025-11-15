import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, FileDown } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';

interface AddPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (playlist: {
    title: string;
    description: string;
    videos: Array<{
      id: string;
      title: string;
      url: string;
      thumbnail: string;
      transcribed: boolean;
    }>;
  }) => void;
}

export function AddPlaylistModal({ isOpen, onClose, onAdd }: AddPlaylistModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [playlistLink, setPlaylistLink] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreatePlaylist = () => {
    if (!title.trim()) {
      toast.error('Please enter a playlist title');
      return;
    }

    if (!videoLink.trim()) {
      toast.error('Please enter at least one video link');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const newPlaylist = {
        title: title.trim(),
        description: description.trim(),
        videos: [
          {
            id: Date.now().toString(),
            title: 'New Video',
            url: videoLink.trim(),
            thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400',
            transcribed: false,
          },
        ],
      };

      onAdd(newPlaylist);
      toast.success('Playlist created successfully!');
      resetForm();
      onClose();
      setLoading(false);
    }, 1000);
  };

  const handleImportPlaylist = () => {
    if (!playlistLink.trim()) {
      toast.error('Please enter a playlist link');
      return;
    }

    setLoading(true);

    // Simulate API call to import playlist
    setTimeout(() => {
      const mockVideos = [
        {
          id: '1',
          title: 'Introduction to React',
          url: 'https://youtube.com/watch?v=example1',
          thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
          transcribed: false,
        },
        {
          id: '2',
          title: 'React Hooks Explained',
          url: 'https://youtube.com/watch?v=example2',
          thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400',
          transcribed: false,
        },
        {
          id: '3',
          title: 'Building Real Projects',
          url: 'https://youtube.com/watch?v=example3',
          thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400',
          transcribed: false,
        },
      ];

      const importedPlaylist = {
        title: 'Imported Playlist',
        description: 'Imported from YouTube',
        videos: mockVideos,
      };

      onAdd(importedPlaylist);
      toast.success('Playlist imported successfully!');
      resetForm();
      onClose();
      setLoading(false);
    }, 1500);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setVideoLink('');
    setPlaylistLink('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50 p-4"
          >
            <div className="bg-card border border-primary/20 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative h-20 bg-gradient-to-r from-primary to-accent px-6 flex items-center justify-between">
                <h2 className="text-2xl text-white">Add Playlist</h2>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleClose}
                  className="hover:bg-white/20 text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
                
                {/* Decorative Elements */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <Tabs defaultValue="create" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="create" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create New Playlist
                    </TabsTrigger>
                    <TabsTrigger value="import" className="gap-2">
                      <FileDown className="w-4 h-4" />
                      Import Playlist
                    </TabsTrigger>
                  </TabsList>

                  {/* Create New Playlist Tab */}
                  <TabsContent value="create" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm">
                        Playlist Title <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="e.g., Web Development Bootcamp"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm">
                        Video Link <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="https://youtube.com/watch?v=..."
                        value={videoLink}
                        onChange={(e) => setVideoLink(e.target.value)}
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Add more videos after creating the playlist
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm">Description (Optional)</label>
                      <Textarea
                        placeholder="Brief description of this playlist..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-[100px] resize-none"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={handleClose}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreatePlaylist}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
                      >
                        {loading ? 'Creating...' : 'Create Playlist'}
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Import Playlist Tab */}
                  <TabsContent value="import" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm">
                        YouTube Playlist Link <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="https://youtube.com/playlist?list=..."
                        value={playlistLink}
                        onChange={(e) => setPlaylistLink(e.target.value)}
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Paste a YouTube playlist URL to import all videos
                      </p>
                    </div>

                    {/* Info Box */}
                    <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                      <h4 className="text-sm mb-2">What happens when you import?</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• All videos from the playlist will be imported</li>
                        <li>• Video titles and thumbnails will be fetched</li>
                        <li>• You can transcribe any video later</li>
                      </ul>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={handleClose}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleImportPlaylist}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
                      >
                        {loading ? 'Importing...' : 'Import Playlist'}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
