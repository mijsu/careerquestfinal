import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProgressRing from "@/components/ProgressRing";
import BadgeCard from "@/components/BadgeCard";
import LeaderboardTable from "@/components/LeaderboardTable";
import DailyChallengeCard from "@/components/DailyChallengeCard";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import SearchInput from "@/components/SearchInput";
import CareerRecommendationModal from "@/components/CareerRecommendationModal";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Trophy, 
  Target, 
  Flame, 
  Star,
  Award,
  Zap,
  BookOpen,
  Code2,
  Shield,
  Rocket,
  LogOut,
  Loader2,
  Lightbulb,
  TrendingUp,
  User as UserIcon,
} from "lucide-react";
import type { User, Badge, DailyChallenge, Quiz } from "@shared/schema";
import { useLocation } from "wouter";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  level: number;
  totalXp: number;
  badgeCount: number;
}

// Define UserBadge type to match the expected response from the API
interface UserBadge {
  badgeId: string;
  badge: Badge;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "badges" | "leaderboard">("overview");
  const { user, logout, refreshUser, pendingRecommendation, setPendingRecommendation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch user badges (declared early so it can be used in useEffects)
  const { data: userBadgesData, isLoading: badgesLoading, refetch: refetchUserBadges } = useQuery<{ badges: UserBadge[] }>({
    queryKey: ["/api/users/me/badges"],
    refetchOnMount: 'always', // Ensure badges are always fresh after login
    staleTime: 0, // Set staleTime to 0 to always fetch fresh data
    refetchInterval: 2000, // Automatically refetch every 2 seconds to catch new badges immediately
  });

  // Refresh user data when Dashboard mounts to ensure XP is up-to-date
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Auto-close recommendation modal after 60 seconds
  useEffect(() => {
    if (pendingRecommendation) {
      const timer = setTimeout(() => {
        setPendingRecommendation(null);
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [pendingRecommendation, setPendingRecommendation]);

  // Also invalidate cache when tab becomes visible (browser refocus)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        queryClient.invalidateQueries({ queryKey: ["/api/users/me/badges"] });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  const userBadges = Array.isArray(userBadgesData?.badges) ? userBadgesData.badges : []; // Ensure it's always an array

  // Fetch all badges
  const { data: allBadgesData } = useQuery<{ badges: Badge[] }>({
    queryKey: ["/api/badges"],
    refetchOnMount: 'always',
    staleTime: 0,
  });
  const allBadges = Array.isArray(allBadgesData?.badges) ? allBadgesData.badges : [];

  // Fetch leaderboard
  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery<{ leaderboard: LeaderboardEntry[] }>({
    queryKey: ["/api/leaderboard"],
  });
  const leaderboard = leaderboardData?.leaderboard || [];

  // Fetch daily challenges (both quiz and code)
  const { data: dailyChallengeData, isLoading: dailyChallengeLoading, error: dailyChallengeError } = useQuery<{
    quizChallenge: {
      id: string;
      title: string;
      difficulty: string;
      xpReward: number;
      challengeType: "quiz";
      completed: boolean;
    } | null;
    codeChallenge: {
      id: string;
      title: string;
      difficulty: string;
      xpReward: number;
      challengeType: "code";
      completed: boolean;
    } | null;
    allCompleted: boolean;
  }>({
    queryKey: ["/api/daily-challenges/today"],
    retry: 2,
    retryDelay: 1000,
    staleTime: 0, // Always fetch fresh - prevents cache collision between users
    refetchOnMount: 'always', // Force refresh on component mount
  });

  // Extract individual challenges
  const quizChallenge = dailyChallengeData?.quizChallenge || null;
  const codeChallenge = dailyChallengeData?.codeChallenge || null;
  const allChallengesCompleted = dailyChallengeData?.allCompleted === true;

  // Fetch AI study suggestions
  const { data: studySuggestionsData, isLoading: suggestionsLoading } = useQuery<{ suggestions: string }>({
    queryKey: ["/api/study-suggestions"],
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes to avoid excessive OpenAI calls
  });

  // Fetch career path details if user has one assigned
  const { data: careerPathResponse } = useQuery<{ path: any }>({
    queryKey: ["/api/career-paths", user?.currentCareerPathId],
    enabled: !!user?.currentCareerPathId,
  });
  const careerPathData = careerPathResponse?.path;

  // Fetch user progress data
  const { data: progressData, isLoading: progressLoading } = useQuery<{
    totalModules: number;
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
    modules: Array<{ id: string; title: string }>;
  }>({
    queryKey: ["/api/users/me/progress"],
  });

  // AI-generated practice quiz state
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  // Function to generate AI practice quiz
  const generatePracticeQuiz = async (topic?: string, difficulty?: string) => {
    setGeneratingQuiz(true);
    try {
      const response = await fetch("/api/quizzes/generate-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ topic, difficulty }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate quiz");
      }

      const data = await response.json();

      // Store the generated quiz in session storage for the Quiz page
      sessionStorage.setItem(`practice-quiz-${data.quiz.id}`, JSON.stringify(data));

      toast({
        title: "Quiz Generated!",
        description: "Your personalized practice quiz is ready. Good luck!",
      });

      // Navigate to the generated quiz
      setTimeout(() => setLocation(`/quiz/${data.quiz.id}`), 500);
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Could not generate practice quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingQuiz(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Calculate level progress
  const xpForCurrentLevel = user.level * 1000;
  const xpForNextLevel = (user.level + 1) * 1000;
  const xpIntoCurrentLevel = user.totalXp - ((user.level - 1) * 1000);
  const levelProgress = (xpIntoCurrentLevel / 1000) * 100;
  const xpNeededForNextLevel = xpForNextLevel - user.totalXp;

  // Map badges to badge cards
  const userBadgeIds = new Set(userBadges.map(b => b.badgeId));
  console.log('[Dashboard] User badge IDs:', Array.from(userBadgeIds));
  console.log('[Dashboard] All badges:', allBadges.map(b => ({ id: b.id, name: b.name })));
  
  const badgeCards = allBadges.slice(0, 8).map(badge => {
    const iconMap: Record<string, any> = {
      Award, Flame, Code2, Trophy, Shield, Rocket, Star, Zap
    };
    const isUnlocked = userBadgeIds.has(badge.id);
    console.log(`[Dashboard] Badge ${badge.id} (${badge.name}): unlocked=${isUnlocked}`);

    return {
      id: badge.id,
      icon: iconMap[badge.icon] || Award,
      title: badge.name,
      description: badge.description,
      rarity: badge.rarity as "common" | "rare" | "epic" | "legendary",
      unlocked: isUnlocked,
    };
  });

  // Use actual streak from user data
  const currentStreak = user.currentStreak || 0;

  return (
    <>
      {pendingRecommendation && (
        <CareerRecommendationModal
          open={true}
          onClose={() => setPendingRecommendation(null)}
          careerPath={pendingRecommendation}
        />
      )}
      <div className="min-h-screen">
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">CareerQuest</span>
          </div>
          <div className="flex items-center gap-4">
            <SearchInput />
            <ThemeToggle />
            <NotificationBell />
            <Button variant="outline" size="icon" onClick={() => setLocation("/profile")} data-testid="button-profile">
              <UserIcon className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={logout} data-testid="button-logout">
              <LogOut className="w-4 h-4" />
            </Button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl mb-2" data-testid="text-welcome">
              Welcome back, {user.username}!
            </h1>
            <p className="text-muted-foreground">
              {currentStreak > 0 
                ? `Keep up the great work. You're on a ${currentStreak}-day streak!`
                : "Start your learning journey today!"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-muted-foreground">Your Level</div>
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-center gap-4">
                <ProgressRing progress={levelProgress} size={80}>
                  <div className="text-center">
                    <div className="text-xl font-bold" data-testid="text-user-level">{user.level}</div>
                  </div>
                </ProgressRing>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">
                    {xpIntoCurrentLevel.toLocaleString()} / {(1000).toLocaleString()} XP
                  </div>
                  <Progress value={levelProgress} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {xpNeededForNextLevel.toLocaleString()} XP to Level {user.level + 1}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-muted-foreground">Streak</div>
                <Flame className="w-5 h-5 text-[hsl(var(--warning))]" />
              </div>
              <div className="text-4xl font-display font-bold mb-2" data-testid="text-streak">
                {currentStreak} Days
              </div>
              <div className="text-sm text-muted-foreground">
                {currentStreak > 0 ? "Keep it going!" : "Start today!"}
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-muted-foreground">Badges Earned</div>
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div className="text-4xl font-display font-bold mb-2" data-testid="text-badges">
                {userBadges.length} / {allBadges.length}
              </div>
              <div className="text-sm text-muted-foreground">
                {allBadges.length > 0 
                  ? `${Math.round((userBadges.length / allBadges.length) * 100)}% collected`
                  : "No badges available yet"}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-col items-start gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Your Progress</CardTitle>
                <div className="flex gap-2 overflow-x-auto">
                  <Button 
                    variant={activeTab === "overview" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("overview")}
                    data-testid="button-tab-overview"
                    className="whitespace-nowrap"
                  >
                    Overview
                  </Button>
                  <Button 
                    variant={activeTab === "badges" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("badges")}
                    data-testid="button-tab-badges"
                    className="whitespace-nowrap"
                  >
                    Badges
                  </Button>
                  <Button 
                    variant={activeTab === "leaderboard" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("leaderboard")}
                    data-testid="button-tab-leaderboard"
                    className="whitespace-nowrap"
                  >
                    Leaderboard
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {progressLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : progressData && progressData.totalLessons > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">Learning Progress</h3>
                            <p className="text-sm text-muted-foreground">
                              {progressData.completedLessons} of {progressData.totalLessons} lessons completed
                            </p>
                          </div>
                          <div className="text-2xl font-bold text-primary" data-testid="text-progress-percentage">
                            {progressData.progressPercentage}%
                          </div>
                        </div>
                        <Progress value={progressData.progressPercentage} className="h-3" />
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="p-4 rounded-lg bg-muted/50">
                            <div className="text-sm font-medium text-muted-foreground mb-1">Modules Available</div>
                            <div className="text-2xl font-bold" data-testid="text-total-modules">{progressData.totalModules}</div>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50">
                            <div className="text-sm font-medium text-muted-foreground mb-1">Lessons Completed</div>
                            <div className="text-2xl font-bold" data-testid="text-completed-lessons">{progressData.completedLessons}</div>
                          </div>
                        </div>
                        <Button 
                          onClick={() => setLocation("/modules")} 
                          className="w-full mt-4"
                          data-testid="button-view-modules"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          View All Modules
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground mb-4">
                          No modules available yet. Check back later!
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === "badges" && (
                  <>
                    {badgesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : badgeCards.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {badgeCards.map((badge) => (
                          <BadgeCard key={badge.id} {...badge} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No badges available yet</p>
                      </div>
                    )}
                  </>
                )}
                {activeTab === "leaderboard" && (
                  <>
                    {leaderboardLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <LeaderboardTable 
                        entries={leaderboard.map(entry => ({
                          rank: entry.rank,
                          name: entry.username,
                          level: entry.level,
                          xp: entry.totalXp,
                          badges: entry.badgeCount,
                          isCurrentUser: entry.userId === user.id,
                        }))} 
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {dailyChallengeLoading ? (
              <Card className="mt-6">
                <CardContent className="p-6 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            ) : dailyChallengeError ? (
              <Card className="mt-6 border-destructive">
                <CardContent className="p-6 text-center">
                  <Code2 className="w-12 h-12 mx-auto mb-4 text-destructive opacity-50" />
                  <p className="text-sm text-muted-foreground">Failed to load daily challenges</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/daily-challenges/today"] })}
                    data-testid="button-retry-challenges"
                  >
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quizChallenge && (
                    <DailyChallengeCard 
                      title={quizChallenge.title}
                      difficulty={quizChallenge.difficulty as "easy" | "medium" | "hard"}
                      xpReward={quizChallenge.xpReward}
                      timeEstimate="15 min"
                      streak={currentStreak}
                      challengeId={quizChallenge.id}
                      challengeType="quiz"
                      completed={quizChallenge.completed}
                    />
                  )}
                  {codeChallenge && (
                    <DailyChallengeCard 
                      title={codeChallenge.title}
                      difficulty={codeChallenge.difficulty as "easy" | "medium" | "hard"}
                      xpReward={codeChallenge.xpReward}
                      timeEstimate="20 min"
                      streak={currentStreak}
                      challengeId={codeChallenge.id}
                      challengeType="code"
                      completed={codeChallenge.completed}
                    />
                  )}
                </div>
                {allChallengesCompleted && (
                  <Card className="mt-4 border-[hsl(var(--success))]">
                    <CardContent className="p-6 text-center">
                      <Trophy className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--success))]" />
                      <p className="font-semibold">All Challenges Completed!</p>
                      <p className="text-sm text-muted-foreground mt-2">Come back tomorrow for new challenges</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-primary" />
                      AI Practice Quizzes
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Generate unlimited AI-powered practice quizzes tailored to your level
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Quick Practice</h4>
                        <p className="text-sm text-muted-foreground">
                          Generate a random quiz based on your career path and level
                        </p>
                      </div>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => generatePracticeQuiz()}
                      disabled={generatingQuiz}
                      data-testid="button-generate-quick-quiz"
                    >
                      {generatingQuiz ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating Quiz...
                        </>
                      ) : (
                        <>
                          <Lightbulb className="w-4 h-4 mr-2" />
                          Generate Quiz
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => generatePracticeQuiz(undefined, "beginner")}
                      disabled={generatingQuiz}
                      className="flex flex-col h-auto py-3"
                      data-testid="button-generate-beginner-quiz"
                    >
                      <span className="text-green-600 dark:text-green-400 font-semibold">Beginner</span>
                      <span className="text-xs text-muted-foreground mt-1">Easy</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => generatePracticeQuiz(undefined, "intermediate")}
                      disabled={generatingQuiz}
                      className="flex flex-col h-auto py-3"
                      data-testid="button-generate-intermediate-quiz"
                    >
                      <span className="text-yellow-600 dark:text-yellow-400 font-semibold">Intermediate</span>
                      <span className="text-xs text-muted-foreground mt-1">Medium</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => generatePracticeQuiz(undefined, "advanced")}
                      disabled={generatingQuiz}
                      className="flex flex-col h-auto py-3"
                      data-testid="button-generate-advanced-quiz"
                    >
                      <span className="text-red-600 dark:text-red-400 font-semibold">Advanced</span>
                      <span className="text-xs text-muted-foreground mt-1">Hard</span>
                    </Button>
                  </div>

                  <div className="pt-2 text-center">
                    <p className="text-xs text-muted-foreground">
                      ✨ Each quiz is uniquely generated • Take unlimited times • Earn {user?.level && user.level >= 10 ? '50' : '50'} XP per quiz
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  AI Study Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {suggestionsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : studySuggestionsData?.suggestions && Array.isArray(studySuggestionsData.suggestions) && studySuggestionsData.suggestions.length > 0 ? (
                  <div className="space-y-3 text-sm">
                    {studySuggestionsData.suggestions.map((suggestion: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{suggestion.topic}</p>
                          <p className="text-xs text-muted-foreground mt-1">{suggestion.reason}</p>
                          <p className="text-xs text-primary mt-1">→ {suggestion.recommendedAction}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Complete more quizzes to get personalized study suggestions</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Next Milestone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.level >= 20 && user.pathSelectionMode === "ai-guided" && !user.hasCompletedInterestAssessment ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center">
                        <Target className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">Complete Interest Assessment</div>
                        <div className="text-sm text-muted-foreground">Get AI-powered career recommendation</div>
                      </div>
                    </div>
                    <Button onClick={() => setLocation("/interest-assessment")} className="w-full" data-testid="button-interest-assessment">
                      Start Assessment
                    </Button>
                  </>
                ) : user.currentCareerPathId ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full border-2 border-primary/50 bg-primary/10 flex items-center justify-center">
                        <Rocket className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">Career Path Selected</div>
                        <div className="text-sm text-muted-foreground">Your personalized learning journey has begun</div>
                      </div>
                    </div>
                    {careerPathData?.name && (
                      <div className="space-y-2">
                        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                          <div className="text-xs font-medium text-primary/70 mb-1">Your Recommended Path</div>
                          <div className="font-semibold text-base text-primary">{careerPathData.name}</div>
                          <div className="text-sm text-muted-foreground mt-1">{careerPathData.description}</div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <Award className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-primary">Path assigned • Ready to learn</span>
                    </div>
                  </>
                ) : !user.currentCareerPathId && user.pathSelectionMode !== "ai-guided" ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center">
                        <Shield className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">Choose Career Path</div>
                        <div className="text-sm text-muted-foreground">Start your specialized learning journey</div>
                      </div>
                    </div>
                    <Button onClick={() => setLocation("/careers")} className="w-full" data-testid="button-choose-career">
                      Explore Paths
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center">
                        <Zap className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">Level {user.level + 1}</div>
                        <div className="text-sm text-muted-foreground">
                          Earn {xpNeededForNextLevel} XP to level up
                        </div>
                      </div>
                    </div>
                    <Progress value={levelProgress} className="h-2" />
                    <div className="text-xs text-muted-foreground text-center">
                      {xpIntoCurrentLevel} / 1000 XP
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}