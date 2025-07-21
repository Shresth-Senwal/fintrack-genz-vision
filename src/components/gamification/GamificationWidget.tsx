/**
 * @fileoverview Gamification Dashboard Widget
 * 
 * A comprehensive widget that displays user progress, active challenges,
 * streaks, achievements, and XP information in the main dashboard.
 * 
 * @author GitHub Copilot
 * @version 1.0.0
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Trophy, 
  Flame, 
  Star, 
  Target, 
  TrendingUp, 
  Award,
  Calendar,
  Users,
  ChevronRight 
} from 'lucide-react';
import { useGamification } from '../../hooks/use-gamification';
import { ACHIEVEMENTS } from '../../constants/gamification';

/**
 * Props for the GamificationWidget component
 */
interface GamificationWidgetProps {
  /** Whether to show in compact mode */
  compact?: boolean;
  /** Callback when user wants to view full gamification page */
  onViewAll?: () => void;
  /** CSS class name */
  className?: string;
}

/**
 * A comprehensive gamification widget for the dashboard
 * 
 * @param props - Component props
 * @returns JSX element
 */
export function GamificationWidget({ 
  compact = false, 
  onViewAll, 
  className = '' 
}: GamificationWidgetProps) {
  const {
    userProgress,
    activeChallenges,
    availableAchievements,
    getActiveStreaks,
    getRecentAchievements,
    getLevelProgress,
    isLoading,
    error
  } = useGamification();

  const activeStreaks = getActiveStreaks();
  const recentAchievements = getRecentAchievements(7);
  const levelProgress = getLevelProgress();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Progress & Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trophy className="w-5 h-5" />
            Progress & Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Failed to load gamification data: {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Level {userProgress.level.currentLevel}
            </div>
            <Button variant="ghost" size="sm" onClick={onViewAll} aria-label="View all achievements">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </CardTitle>
          <CardDescription>{userProgress.level.title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* XP Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to next level</span>
              <span>{userProgress.level.currentXP} / {userProgress.level.xpToNextLevel + userProgress.level.currentXP} XP</span>
            </div>
            <Progress 
              value={levelProgress} 
              className="h-2"
              aria-label={`Level progress: ${Math.round(levelProgress)}%`}
            />
          </div>

          {/* Active Streaks */}
          {activeStreaks.length > 0 && (
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">
                {activeStreaks[0].currentCount} day streak
              </span>
              <Badge variant="secondary" className="text-xs">
                {activeStreaks[0].type}
              </Badge>
            </div>
          )}

          {/* Recent Achievement */}
          {recentAchievements.length > 0 && (
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">
                Recent: {ACHIEVEMENTS.find(a => a.id === recentAchievements[0].achievementId)?.title}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Progress & Achievements
          </div>
          {onViewAll && (
            <Button variant="outline" size="sm" onClick={onViewAll}>
              View All
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Track your financial journey and unlock achievements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="streaks">Streaks</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-4 mt-4">
            {/* Level Information */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Level {userProgress.level.currentLevel}</h3>
                <p className="text-sm text-muted-foreground">{userProgress.level.title}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{userProgress.totalXP}</p>
                <p className="text-xs text-muted-foreground">Total XP</p>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to Level {userProgress.level.currentLevel + 1}</span>
                <span>{userProgress.level.currentXP} / {userProgress.level.xpToNextLevel + userProgress.level.currentXP} XP</span>
              </div>
              <Progress 
                value={levelProgress} 
                className="h-3"
                aria-label={`Level progress: ${Math.round(levelProgress)}%`}
              />
            </div>

            {/* Level Perks */}
            {userProgress.level.perks.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Current Level Perks</h4>
                <div className="flex flex-wrap gap-1">
                  {userProgress.level.perks.map((perk, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {perk}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Weekly/Monthly XP */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-lg font-semibold">{userProgress.weeklyXP}</p>
                <p className="text-xs text-muted-foreground">This Week</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-lg font-semibold">{userProgress.monthlyXP}</p>
                <p className="text-xs text-muted-foreground">This Month</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-4 mt-4">
            {activeChallenges.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active challenges</p>
                <p className="text-sm text-muted-foreground">Check back soon for new challenges!</p>
              </div>
            ) : (
              activeChallenges.slice(0, 3).map((challenge) => (
                <div key={challenge.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{challenge.icon}</span>
                      <div>
                        <h4 className="font-medium">{challenge.title}</h4>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={challenge.difficulty === 'easy' ? 'secondary' : challenge.difficulty === 'medium' ? 'default' : 'destructive'}
                    >
                      {challenge.difficulty}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{challenge.currentValue} / {challenge.targetValue} {challenge.unit}</span>
                    </div>
                    <Progress 
                      value={(challenge.currentValue / challenge.targetValue) * 100} 
                      className="h-2"
                      aria-label={`Challenge progress: ${Math.round((challenge.currentValue / challenge.targetValue) * 100)}%`}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-muted-foreground">
                      Ends {new Date(challenge.endDate).toLocaleDateString()}
                    </span>
                    <span className="text-sm font-medium">
                      +{challenge.reward.xp} XP
                    </span>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="streaks" className="space-y-4 mt-4">
            {activeStreaks.length === 0 ? (
              <div className="text-center py-8">
                <Flame className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active streaks</p>
                <p className="text-sm text-muted-foreground">Start a habit to build your streak!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeStreaks.map((streak) => (
                  <div key={streak.type} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <div>
                        <h4 className="font-medium capitalize">{streak.type} Streak</h4>
                        <p className="text-sm text-muted-foreground">
                          Last action: {new Date(streak.lastActionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{streak.currentCount}</p>
                      <p className="text-xs text-muted-foreground">days</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Longest Streaks */}
            <div>
              <h4 className="text-sm font-medium mb-2">Personal Records</h4>
              <div className="space-y-2">
                {Object.values(userProgress.streaks)
                  .filter(streak => streak.longestCount > 0)
                  .sort((a, b) => b.longestCount - a.longestCount)
                  .slice(0, 3)
                  .map((streak) => (
                    <div key={`longest-${streak.type}`} className="flex items-center justify-between text-sm">
                      <span className="capitalize">{streak.type}</span>
                      <span className="font-medium">{streak.longestCount} days</span>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4 mt-4">
            {userProgress.achievements.length === 0 ? (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No achievements unlocked yet</p>
                <p className="text-sm text-muted-foreground">Complete your first action to get started!</p>
              </div>
            ) : (
              <>
                {/* Recent Achievements */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Recent Achievements</h4>
                  <div className="space-y-2">
                    {recentAchievements.slice(0, 3).map((userAchievement) => {
                      const achievement = ACHIEVEMENTS.find(a => a.id === userAchievement.achievementId);
                      if (!achievement) return null;
                      
                      return (
                        <div key={userAchievement.achievementId} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                          <span className="text-2xl">{achievement.icon}</span>
                          <div className="flex-1">
                            <h5 className="font-medium">{achievement.title}</h5>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">+{achievement.reward.xp} XP</Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Achievement Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-lg font-semibold">{userProgress.achievements.length}</p>
                    <p className="text-xs text-muted-foreground">Unlocked</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-lg font-semibold">{ACHIEVEMENTS.length - userProgress.achievements.length}</p>
                    <p className="text-xs text-muted-foreground">Remaining</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-lg font-semibold">
                      {Math.round((userProgress.achievements.length / ACHIEVEMENTS.length) * 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Complete</p>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default GamificationWidget;
