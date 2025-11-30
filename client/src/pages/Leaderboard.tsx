import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import LeaderboardTable from "@/components/LeaderboardTable";
import { Trophy, TrendingUp, Users, Crown, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  level: number;
  totalXp: number;
  badgeCount: number;
}

interface CareerPath {
  id: string;
  name: string;
  color: string;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedPath, setSelectedPath] = useState<string | "all">("all");
  const [timeFilter, setTimeFilter] = useState<string>("allTime");

  // Fetch career paths for filter
  const { data: careerPathsData } = useQuery<{ careerPaths: CareerPath[] }>({
    queryKey: ["/api/career-paths"],
  });
  const careerPaths = careerPathsData?.careerPaths || [];

  // Fetch leaderboard data
  const { data: leaderboardData, isLoading } = useQuery<{ leaderboard: LeaderboardEntry[] }>({
    queryKey: ["/api/leaderboard", selectedPath, timeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedPath !== "all") params.append("careerPath", selectedPath);
      if (timeFilter !== "allTime") params.append("timeFilter", timeFilter);
      
      const response = await fetch(`/api/leaderboard?${params.toString()}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      return response.json();
    },
  });

  const leaderboard = leaderboardData?.leaderboard || [];

  // Transform data for LeaderboardTable component
  const tableEntries = leaderboard.map(entry => ({
    rank: entry.rank,
    name: entry.username,
    level: entry.level,
    xp: entry.totalXp,
    badges: entry.badgeCount,
    isCurrentUser: user?.id === entry.userId,
  }));

  // Find current user's rank
  const currentUserEntry = leaderboard.find(entry => entry.userId === user?.id);
  const currentUserRank = currentUserEntry?.rank || null;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/dashboard")}
            className="mb-4 gap-2"
            data-testid="button-back-to-dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <Trophy className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-leaderboard-title">Global Leaderboard</h1>
              <p className="text-muted-foreground">Compete with the best learners worldwide</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Your Rank</p>
                  <p className="text-3xl font-bold mt-1" data-testid="text-current-rank">
                    {currentUserRank ? `#${currentUserRank}` : "-"}
                  </p>
                </div>
                <Crown className="w-10 h-10 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Players</p>
                  <p className="text-3xl font-bold mt-1" data-testid="text-total-players">
                    {leaderboard.length}
                  </p>
                </div>
                <Users className="w-10 h-10 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Top XP</p>
                  <p className="text-3xl font-bold mt-1" data-testid="text-top-xp">
                    {leaderboard[0]?.totalXp?.toLocaleString() || "0"}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>Leaderboard Rankings</CardTitle>
                <CardDescription>Filter by career path or view all rankings</CardDescription>
              </div>
              <div className="flex gap-3">
                <Select value={selectedPath} onValueChange={setSelectedPath}>
                  <SelectTrigger className="w-[200px]" data-testid="select-career-path">
                    <SelectValue placeholder="All Career Paths" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Career Paths</SelectItem>
                    {careerPaths.map(path => (
                      <SelectItem key={path.id} value={path.id}>
                        {path.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-[150px]" data-testid="select-time-filter">
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allTime">All Time</SelectItem>
                    <SelectItem value="thisWeek">This Week</SelectItem>
                    <SelectItem value="thisMonth">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading rankings...</p>
                </div>
              </div>
            ) : tableEntries.length > 0 ? (
              <LeaderboardTable entries={tableEntries} />
            ) : (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">No rankings available yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start completing quizzes and challenges to earn your spot!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievement Milestones */}
        <Card>
          <CardHeader>
            <CardTitle>Achievement Milestones</CardTitle>
            <CardDescription>Reach these milestones to climb the leaderboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-card-border">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="w-5 h-5 text-[hsl(var(--badge-legendary))]" />
                  <span className="font-semibold">Top 10</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Reach Level 50+ and earn 20+ badges
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border border-card-border">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="w-5 h-5 text-[hsl(var(--badge-epic))]" />
                  <span className="font-semibold">Top 50</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Reach Level 30+ and earn 10+ badges
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border border-card-border">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="w-5 h-5 text-[hsl(var(--badge-rare))]" />
                  <span className="font-semibold">Top 100</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Reach Level 15+ and earn 5+ badges
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
