import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  StickyNote,
  Clock,
  Gauge,
  Monitor,
} from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Switch } from './ui/switch';
import { Card } from './ui/card';

interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  channel: string;
  status: string;
  progress: number;
}

interface CustomVideoPlayerProps {
  video: Video;
}

export function CustomVideoPlayer({ video }: CustomVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState('auto');
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playerSize, setPlayerSize] = useState<'compact' | 'standard' | 'wide'>('standard');
  const [isPomodoroActive, setIsPomodoroActive] = useState(false);
  const [studyTime, setStudyTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [currentTimer, setCurrentTimer] = useState(25 * 60);
  const [isBreak, setIsBreak] = useState(false);

  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Add/remove a class on the body when video is playing to hide floating overlays like chat
  useEffect(() => {
    const cls = 'video-playing';
    if (isPlaying) {
      document.body.classList.add(cls);
    } else {
      document.body.classList.remove(cls);
    }
    return () => document.body.classList.remove(cls);
  }, [isPlaying]);

  // Pomodoro Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPomodoroActive && currentTimer > 0) {
      interval = setInterval(() => {
        setCurrentTimer((prev) => prev - 1);
      }, 1000);
    } else if (currentTimer === 0) {
      setIsBreak(!isBreak);
      setCurrentTimer(isBreak ? studyTime * 60 : breakTime * 60);
    }
    return () => clearInterval(interval);
  }, [isPomodoroActive, currentTimer, isBreak, studyTime, breakTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isFocusMode) {
        setShowControls(false);
      }
    }, 3000);
  };

  const sizeClasses = {
    compact: 'aspect-video max-w-4xl',
    standard: 'aspect-video max-w-6xl',
    wide: 'aspect-video max-w-7xl',
  };

  return (
    <div className={isTheaterMode ? 'fixed inset-0 z-50 bg-black/95 flex items-center justify-center' : ''}>
      <motion.div
        layout
        className={`relative mx-auto ${sizeClasses[playerSize]} ${isTheaterMode ? 'w-full h-full' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowControls(true)}
      >
        <Card className="overflow-hidden border-primary/20 bg-black">
          {/* Video Container */}
          <div ref={playerRef} className="relative bg-black aspect-video">
            {/* Video Placeholder (Replace with actual video iframe) */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/20 to-primary/20">
              <div className="text-center text-white">
                <Play className="w-20 h-20 mx-auto mb-4 opacity-50" />
                <p className="text-sm opacity-75">Video Player</p>
                <p className="text-xs opacity-50 mt-2">{video.title}</p>
              </div>
            </div>

            {/* Ambient Mode Glow */}
            <div className="absolute -inset-8 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl opacity-30 pointer-events-none" />

            {/* Focus Mode Overlay */}
            <AnimatePresence>
              {isFocusMode && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center pointer-events-none"
                >
                  <div className="text-white text-center space-y-4">
                    <h3 className="text-2xl">Focus Mode</h3>
                    <div className="text-6xl font-mono">{formatTime(currentTimer)}</div>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {isBreak ? 'Break Time' : 'Study Time'}
                    </Badge>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Custom Controls Overlay */}
            <AnimatePresence>
              {showControls && !isFocusMode && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 flex flex-col justify-between p-4"
                >
                  {/* Top Controls */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-white text-lg">{video.title}</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={() => setIsFocusMode(!isFocusMode)}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Focus
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                      >
                        <StickyNote className="w-4 h-4 mr-2" />
                        Notes
                      </Button>
                    </div>
                  </div>

                  {/* Bottom Controls */}
                  <div className="space-y-2">
                    {/* Progress Bar */}
                    <div className="group">
                      <Slider
                        value={[currentTime]}
                        max={duration || 100}
                        step={1}
                        className="cursor-pointer"
                        onValueChange={(value) => setCurrentTime(value[0])}
                      />
                      <div className="flex justify-between text-xs text-white/70 mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Play/Pause */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </Button>

                        {/* Volume */}
                        <div className="flex items-center gap-2 group">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-white hover:bg-white/20"
                            onClick={() => setIsMuted(!isMuted)}
                          >
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                          </Button>
                          <div className="w-0 group-hover:w-24 transition-all overflow-hidden">
                            <Slider
                              value={[volume]}
                              max={100}
                              step={1}
                              onValueChange={(value) => setVolume(value[0])}
                              className="w-24"
                            />
                          </div>
                        </div>

                        {/* Time Display */}
                        <span className="text-white text-sm ml-2">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Playback Speed */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                              <Gauge className="w-4 h-4 mr-2" />
                              {playbackSpeed}x
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                              <DropdownMenuItem key={speed} onClick={() => setPlaybackSpeed(speed)}>
                                {speed}x
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Player Size */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                              <Monitor className="w-4 h-4 mr-2" />
                              Size
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setPlayerSize('compact')}>
                              Compact
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPlayerSize('standard')}>
                              Standard
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPlayerSize('wide')}>
                              Wide
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Settings */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                              <Settings className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>Quality: {quality}</DropdownMenuItem>
                            <DropdownMenuItem>Subtitles</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsTheaterMode(!isTheaterMode)}>
                              Theater Mode
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Fullscreen */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                        >
                          {isTheaterMode ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pomodoro Timer Panel */}
          {!isFocusMode && (
            <div className="p-4 bg-card border-t border-primary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm">Pomodoro Timer</span>
                  </div>
                  <Switch checked={isPomodoroActive} onCheckedChange={setIsPomodoroActive} />
                </div>
                {isPomodoroActive && (
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      {isBreak ? 'Break' : 'Study'}: {formatTime(currentTimer)}
                    </span>
                    <Badge variant="outline">{studyTime}m study / {breakTime}m break</Badge>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
