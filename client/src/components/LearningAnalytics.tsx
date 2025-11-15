import { motion } from 'motion/react';
import { TrendingUp, Clock, Target, Flame, BarChart3, Award, Trophy, BookOpen, PlayCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

export function LearningAnalytics() {
  // Mock aggregate data from all playlists
  const totalVideos = 48;
  const completedVideos = 32;
  const watchingVideos = 8;
  const pendingVideos = 8;
  const completionRate = Math.round((completedVideos / totalVideos) * 100);

  // Mock data for charts
  const weeklyData = [
    { day: 'Mon', minutes: 45 },
    { day: 'Tue', minutes: 60 },
    { day: 'Wed', minutes: 30 },
    { day: 'Thu', minutes: 75 },
    { day: 'Fri', minutes: 50 },
    { day: 'Sat', minutes: 90 },
    { day: 'Sun', minutes: 40 },
  ];

  const maxMinutes = Math.max(...weeklyData.map(d => d.minutes));
  const totalWeeklyMinutes = weeklyData.reduce((sum, d) => sum + d.minutes, 0);
  const streak = 12;

  // Mock playlist progress data
  const playlists = [
    { name: 'React Mastery', progress: 85, videos: 12, color: 'from-blue-500 to-cyan-500' },
    { name: 'Node.js Backend', progress: 60, videos: 18, color: 'from-green-500 to-emerald-500' },
    { name: 'UI/UX Design', progress: 45, videos: 10, color: 'from-purple-500 to-pink-500' },
    { name: 'Python Basics', progress: 30, videos: 8, color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Learning Analytics
              </span>
            </h1>
            <p className="text-muted-foreground">Track your progress and stay motivated</p>
          </div>
        </div>

        {/* Streak Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 px-4 py-2">
            <Flame className="w-4 h-4 text-orange-500" />
            {streak} day streak 🔥
          </Badge>
          <Badge variant="outline" className="gap-1 px-4 py-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Level 8 Learner
          </Badge>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <Card className="p-6 border-primary/20 bg-gradient-to-br from-card to-primary/5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              {completionRate}%
            </Badge>
          </div>
          <div className="text-3xl mb-1">{completedVideos}</div>
          <div className="text-sm text-muted-foreground">Videos Completed</div>
        </Card>

        <Card className="p-6 border-primary/20 bg-gradient-to-br from-card to-accent/5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <PlayCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-3xl mb-1">{watchingVideos}</div>
          <div className="text-sm text-muted-foreground">In Progress</div>
        </Card>

        <Card className="p-6 border-primary/20 bg-gradient-to-br from-card to-primary/5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-3xl mb-1">{pendingVideos}</div>
          <div className="text-sm text-muted-foreground">To Watch</div>
        </Card>

        <Card className="p-6 border-primary/20 bg-gradient-to-br from-card to-accent/5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-3xl mb-1">{Math.round(totalWeeklyMinutes / 60)}h</div>
          <div className="text-sm text-muted-foreground">This Week</div>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Weekly Learning Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="p-6 border-primary/20 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl">Time Spent Learning</h3>
              <Badge variant="outline">{totalWeeklyMinutes} mins this week</Badge>
            </div>

            <div className="space-y-6">
              {/* Bar Chart */}
              <div className="flex items-end justify-between gap-2 h-48">
                {weeklyData.map((data, index) => {
                  const height = (data.minutes / maxMinutes) * 100;
                  return (
                    <motion.div
                      key={data.day}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <div className="relative w-full">
                        <div
                          className="w-full bg-gradient-to-t from-primary to-accent rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer"
                          style={{ height: `${height * 1.5}px` }}
                        />
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                          {data.minutes}m
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{data.day}</span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-primary/10">
                <div className="text-center">
                  <div className="text-xl mb-1">{Math.round(totalWeeklyMinutes / weeklyData.length)}m</div>
                  <div className="text-xs text-muted-foreground">Daily Average</div>
                </div>
                <div className="text-center">
                  <div className="text-xl mb-1">{Math.max(...weeklyData.map(d => d.minutes))}m</div>
                  <div className="text-xs text-muted-foreground">Longest Session</div>
                </div>
                <div className="text-center">
                  <div className="text-xl mb-1">{weeklyData.filter(d => d.minutes > 0).length}</div>
                  <div className="text-xs text-muted-foreground">Active Days</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Streak & Goals Column */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Streak Card */}
          <Card className="p-6 border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl">{streak} Days</div>
                <div className="text-sm text-muted-foreground">Current Streak</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Keep learning every day to maintain your streak! 🔥
            </p>
          </Card>

          {/* Daily Goal */}
          <Card className="p-6 border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl">60 min</div>
                <div className="text-sm text-muted-foreground">Daily Goal</div>
              </div>
            </div>
            <Progress value={75} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">
              45 of 60 minutes completed today
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Playlist Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <Card className="p-6 border-primary/20">
          <h3 className="text-xl mb-6">Playlist Progress</h3>
          <div className="space-y-4">
            {playlists.map((playlist, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${playlist.color} flex items-center justify-center`}>
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm">{playlist.name}</div>
                      <div className="text-xs text-muted-foreground">{playlist.videos} videos</div>
                    </div>
                  </div>
                  <Badge variant="outline">{playlist.progress}%</Badge>
                </div>
                <Progress value={playlist.progress} className="h-2" />
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Overall Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <Card className="p-6 border-primary/20">
          <h3 className="text-xl mb-4">Overall Progress</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Completion</span>
                <span className="text-primary">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-3" />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-primary/10">
              <div className="text-center">
                <div className="text-2xl mb-1 text-green-500">{completedVideos}</div>
                <div className="text-xs text-muted-foreground">✓ Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1 text-blue-500">{watchingVideos}</div>
                <div className="text-xs text-muted-foreground">▶ Watching</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1 text-muted-foreground">{pendingVideos}</div>
                <div className="text-xs text-muted-foreground">○ Pending</div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6 border-primary/20">
          <h3 className="text-xl mb-6">Recent Achievements</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🎯', name: 'First Video', desc: 'Complete your first video', unlocked: true },
              { icon: '🔥', name: '7 Day Streak', desc: 'Learn for 7 days straight', unlocked: true },
              { icon: '⭐', name: 'Quick Learner', desc: 'Complete 5 videos', unlocked: true },
              { icon: '📚', name: 'Bookworm', desc: 'Take 10 notes', unlocked: true },
              { icon: '🏆', name: 'Master', desc: 'Complete 50 videos', unlocked: false },
              { icon: '💎', name: 'Premium', desc: 'Upgrade to premium', unlocked: false },
              { icon: '🚀', name: 'Speed Runner', desc: 'Complete playlist in a week', unlocked: false },
              { icon: '👑', name: 'Legend', desc: 'Complete 100 videos', unlocked: false },
            ].map((achievement, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: achievement.unlocked ? 1.05 : 1 }}
                className={`p-4 rounded-lg border text-center transition-all ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-accent/10 to-primary/10 border-accent/20'
                    : 'bg-muted/30 border-muted opacity-50'
                }`}
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <div className="text-sm mb-1">{achievement.name}</div>
                <div className="text-xs text-muted-foreground">{achievement.desc}</div>
                {achievement.unlocked && (
                  <Badge variant="outline" className="mt-2 text-xs bg-green-500/10 text-green-500 border-green-500/20">
                    Unlocked
                  </Badge>
                )}
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
