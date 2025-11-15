import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Copy, Download, AlignLeft, ListOrdered } from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface TranscriptLine {
  id: number;
  time: number;
  text: string;
  speaker?: string;
}

interface TranscriptPanelProps {
  videoId: string;
}

const mockTranscript: TranscriptLine[] = [
  { id: 1, time: 0, text: "Welcome to this comprehensive tutorial on web development." },
  { id: 2, time: 5, text: "Today we're going to explore some fundamental concepts that will help you build amazing applications." },
  { id: 3, time: 12, text: "First, let's talk about the basics of HTML and how it structures our web pages." },
  { id: 4, time: 20, text: "HTML stands for HyperText Markup Language and it's the foundation of every website." },
  { id: 5, time: 28, text: "Next, we'll dive into CSS, which allows us to style and make our pages look beautiful." },
  { id: 6, time: 35, text: "CSS provides powerful tools for layout, colors, fonts, and responsive design." },
  { id: 7, time: 43, text: "Finally, JavaScript brings interactivity to our pages, making them dynamic and engaging." },
  { id: 8, time: 52, text: "With these three technologies, you can build almost anything on the web." },
  { id: 9, time: 60, text: "Let's start with a simple example to see how they work together." },
  { id: 10, time: 68, text: "Remember, practice is key to mastering these skills." },
];

export function TranscriptPanel({ videoId }: TranscriptPanelProps) {
  const [transcript, setTranscript] = useState<TranscriptLine[]>(mockTranscript);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeLineId, setActiveLineId] = useState<number | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Simulate video time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime((prev) => (prev + 1) % 80);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update active line based on current time
  useEffect(() => {
    const activeLine = transcript.find(
      (line, index) =>
        line.time <= currentTime &&
        (index === transcript.length - 1 || transcript[index + 1].time > currentTime)
    );
    if (activeLine) {
      setActiveLineId(activeLine.id);
    }
  }, [currentTime, transcript]);

  // Auto-scroll to active line
  useEffect(() => {
    if (autoScroll && activeLineId && transcriptRef.current) {
      const activeElement = document.getElementById(`transcript-line-${activeLineId}`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLineId, autoScroll]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyTranscript = () => {
    const text = transcript.map(line => `[${formatTime(line.time)}] ${line.text}`).join('\n');
    navigator.clipboard.writeText(text);
    toast.success('Transcript copied to clipboard!');
  };

  const handleDownloadTranscript = () => {
    const text = transcript.map(line => `[${formatTime(line.time)}] ${line.text}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${videoId}.txt`;
    a.click();
    toast.success('Transcript downloaded!');
  };

  const filteredTranscript = transcript.filter(line =>
    line.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fullTranscriptText = transcript.map(line => line.text).join(' ');

  return (
    <Card className="p-6 border-primary/20">
      <Tabs defaultValue="synced" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="synced" className="gap-2">
              <ListOrdered className="w-4 h-4" />
              Auto-Synced
            </TabsTrigger>
            <TabsTrigger value="full" className="gap-2">
              <AlignLeft className="w-4 h-4" />
              Full Transcript
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyTranscript}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadTranscript}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Auto-Synced Transcript */}
        <TabsContent value="synced" className="space-y-4">
          {/* Search & Controls */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search transcript..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={autoScroll} onCheckedChange={setAutoScroll} />
              <span className="text-sm">Auto-scroll</span>
            </div>
          </div>

          {/* Transcript Lines */}
          <div
            ref={transcriptRef}
            className="space-y-2 max-h-[600px] overflow-y-auto pr-2"
          >
            {filteredTranscript.map((line) => (
              <motion.div
                key={line.id}
                id={`transcript-line-${line.id}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  activeLineId === line.id
                    ? 'bg-primary/10 border-2 border-primary/50'
                    : 'bg-accent/5 hover:bg-accent/10 border-2 border-transparent'
                }`}
              >
                <div className="flex gap-3">
                  <Badge variant="outline" className="shrink-0">
                    {formatTime(line.time)}
                  </Badge>
                  <p className="text-sm leading-relaxed">{line.text}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredTranscript.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No matches found for "{searchQuery}"</p>
            </div>
          )}
        </TabsContent>

        {/* Full Transcript */}
        <TabsContent value="full" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search full transcript..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="bg-accent/5 rounded-lg p-6 max-h-[600px] overflow-y-auto">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {fullTranscriptText}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-primary/10">
            <div className="text-center">
              <div className="text-2xl mb-1">{transcript.length}</div>
              <div className="text-xs text-muted-foreground">Segments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">{fullTranscriptText.split(' ').length}</div>
              <div className="text-xs text-muted-foreground">Words</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">{formatTime(transcript[transcript.length - 1].time)}</div>
              <div className="text-xs text-muted-foreground">Duration</div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
