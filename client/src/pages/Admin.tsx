import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import AdminSidebar from "@/components/AdminSidebar";
import SyllabusUpload from "@/components/SyllabusUpload";
import AuditLogTable from "@/components/AuditLogTable";
import { QuizResultsTable } from "@/components/QuizResultsTable";
import ModuleManagement from "@/components/ModuleManagement";
import ThemeToggle from "@/components/ThemeToggle";
import EditUserDialog from "@/components/EditUserDialog";
import AddUserDialog from "@/components/AddUserDialog";
import LogoutConfirmationDialog from "@/components/LogoutConfirmationDialog";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Award,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  UserCog,
  Activity,
  BookOpen,
  Target,
  Clock,
  Filter,
  Download,
  RefreshCw,
  Shield,
  Database,
  Zap,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  LogOut,
  User,
  Trophy
} from "lucide-react";
import type { User as UserType, AuditLog, QuizAttempt } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function Admin() {
  const { user: currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setEditingUser(user);
    }
  };

  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const confirmDeleteUser = async () => {
    if (!deletingUserId || isDeletingUser) return;

    setIsDeletingUser(true);
    try {
      const response = await fetch(`/api/admin/users/${deletingUserId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      toast({
        title: "User Deleted",
        description: "User has been successfully removed from the system.",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setDeletingUserId(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Failed to delete user. Please try again.",
      });
    } finally {
      setIsDeletingUser(false);
      setDeletingUserId(null);
    }
  };

  const handleToggleAdmin = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          isAdmin: !user.isAdmin,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update admin status");
      }

      toast({
        title: "Admin Status Updated",
        description: `User is now ${!user.isAdmin ? "an admin" : "a regular user"}.`,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update admin status. Please try again.",
      });
    }
  };

  const { data: usersData, isLoading: usersLoading } = useQuery<{ users: UserType[] }>({
    queryKey: ["/api/admin/users"],
    enabled: activeTab === "users" || activeTab === "overview",
  });

  const { data: logsData, isLoading: logsLoading } = useQuery<{ logs: AuditLog[] }>({
    queryKey: ["/api/admin/audit-logs"],
    enabled: activeTab === "audit" || activeTab === "overview",
  });

  const { data: quizResultsData, isLoading: resultsLoading } = useQuery<{ 
    attempts: (QuizAttempt & { username: string; quizTitle: string })[];
    totalAttempts: number;
  }>({
    queryKey: ["/api/admin/quiz-results"],
    enabled: activeTab === "results" || activeTab === "overview",
  });

  const allUsers = usersData?.users || [];
  const logs = logsData?.logs || [];
  const quizResults = quizResultsData?.attempts || [];

  const users = useMemo(() => {
    return allUsers.filter(u => u.id !== currentUser?.id);
  }, [allUsers, currentUser?.id]);

  const totalUsers = allUsers.length;
  const activeUsers = allUsers.filter(u => u.lastActiveAt && 
    new Date(u.lastActiveAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
  ).length;
  const adminUsers = allUsers.filter(u => u.isAdmin).length;

  const averageScore = quizResults.length > 0 
    ? Math.round(quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length) 
    : 0;

  const userGrowthData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      users: allUsers.filter(u => u.createdAt && new Date(u.createdAt).toISOString().split('T')[0] <= date).length,
      active: allUsers.filter(u => u.lastActiveAt && new Date(u.lastActiveAt).toISOString().split('T')[0] === date).length
    }));
  }, [allUsers]);

  const quizPerformanceData = useMemo(() => {
    if (quizResults.length === 0) return [];
    
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayResults = quizResults.filter(r => 
        r.completedAt && new Date(r.completedAt).toISOString().split('T')[0] === date
      );
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        attempts: dayResults.length,
        avgScore: dayResults.length > 0 ? Math.round(dayResults.reduce((sum, r) => sum + r.score, 0) / dayResults.length) : 0
      };
    });
  }, [quizResults]);

  const levelDistribution = useMemo(() => {
    const distribution: { [key: string]: number } = {};
    allUsers.forEach(u => {
      const levelRange = Math.floor(u.level / 5) * 5;
      const key = `${levelRange}-${levelRange + 4}`;
      distribution[key] = (distribution[key] || 0) + 1;
    });
    return Object.entries(distribution).map(([range, count]) => ({ range, count }));
  }, [allUsers]);

  const scoreDistribution = useMemo(() => {
    const ranges = ['0-20', '21-40', '41-60', '61-80', '81-100'];
    return ranges.map(range => {
      const [min, max] = range.split('-').map(Number);
      const count = quizResults.filter(r => r.score >= min && r.score <= max).length;
      return { range, count };
    });
  }, [quizResults]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchQuery === '' ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = userFilter === "all" ||
        (userFilter === "admin" && user.isAdmin) ||
        (userFilter === "active" && user.lastActiveAt && new Date(user.lastActiveAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      return matchesSearch && matchesFilter;
    });
  }, [users, searchQuery, userFilter]);

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (current < previous) return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getTrendPercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const previousMonthUsers = allUsers.filter(u => 
    u.createdAt && new Date(u.createdAt).getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000
  ).length;

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "Failed to logout. Please try again.",
      });
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-2xl">
                {activeTab === "overview" && "Dashboard Overview"}
                {activeTab === "users" && "User Management"}
                {activeTab === "modules" && "Module Management"}
                {activeTab === "results" && "Quiz Results & Analytics"}
                {activeTab === "syllabus" && "Syllabus Management"}
                {activeTab === "audit" && "Audit Logs"}
                {activeTab === "settings" && "System Settings"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {activeTab === "overview" && "Monitor system performance and user activity"}
                {activeTab === "users" && `Managing ${totalUsers} registered users`}
                {activeTab === "modules" && "Create and manage learning modules and lessons"}
                {activeTab === "results" && `${quizResults.length} total quiz attempts`}
                {activeTab === "syllabus" && "Upload and manage course syllabi"}
                {activeTab === "audit" && `${logs.length} system events logged`}
                {activeTab === "settings" && "Configure system parameters and security"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                data-testid="button-refresh"
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
                  queryClient.invalidateQueries({ queryKey: ["/api/admin/audit-logs"] });
                  queryClient.invalidateQueries({ queryKey: ["/api/admin/quiz-results"] });
                  queryClient.invalidateQueries({ queryKey: ["/api/admin/modules"] });
                  toast({ title: "Refreshed", description: "Data has been refreshed" });
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <ThemeToggle />
              
              <DropdownMenu open={showProfileMenu} onOpenChange={setShowProfileMenu}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative w-9 h-9 rounded-full p-0"
                    data-testid="button-admin-profile"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-md cursor-pointer hover-elevate">
                      {currentUser?.username?.substring(0, 2).toUpperCase() || 'AD'}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <div className="flex items-center gap-3 p-3 border-b">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold">
                      {currentUser?.username?.substring(0, 2).toUpperCase() || 'AD'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{currentUser?.displayName || currentUser?.username}</div>
                      <div className="text-sm text-muted-foreground truncate">{currentUser?.email}</div>
                    </div>
                  </div>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Admin Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2">
                    <User className="w-4 h-4" />
                    <span>Level {currentUser?.level || 1}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <Trophy className="w-4 h-4" />
                    <span>{currentUser?.totalXp?.toLocaleString() || 0} XP</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Administrator</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowLogoutDialog(true);
                    }}
                    data-testid="button-logout-admin"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-background">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {usersLoading ? (
                  [1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-4 w-24 mb-4" />
                        <Skeleton className="h-8 w-32 mb-2" />
                        <Skeleton className="h-4 w-20" />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <>
                    <Card className="hover-elevate border-l-4 border-l-primary">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-medium text-muted-foreground">Total Users</div>
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                        </div>
                        <div className="text-3xl font-display font-bold mb-2">{totalUsers}</div>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(totalUsers, previousMonthUsers)}
                          <span className="text-sm text-muted-foreground">
                            {getTrendPercentage(totalUsers, previousMonthUsers)} from last month
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="hover-elevate border-l-4 border-l-chart-2">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-medium text-muted-foreground">Active Learners</div>
                          <div className="p-2 bg-chart-2/10 rounded-lg">
                            <Activity className="w-5 h-5 text-chart-2" />
                          </div>
                        </div>
                        <div className="text-3xl font-display font-bold mb-2">{activeUsers}</div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-muted-foreground">
                            {totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}% engagement rate
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="hover-elevate border-l-4 border-l-chart-3">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-medium text-muted-foreground">Quiz Attempts</div>
                          <div className="p-2 bg-chart-3/10 rounded-lg">
                            <Target className="w-5 h-5 text-chart-3" />
                          </div>
                        </div>
                        <div className="text-3xl font-display font-bold mb-2">{quizResults.length}</div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-muted-foreground">
                            {averageScore}% average score
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="hover-elevate border-l-4 border-l-chart-4">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-medium text-muted-foreground">System Events</div>
                          <div className="p-2 bg-chart-4/10 rounded-lg">
                            <Shield className="w-5 h-5 text-chart-4" />
                          </div>
                        </div>
                        <div className="text-3xl font-display font-bold mb-2">{logs.length}</div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Last: {logs.length > 0 ? new Date(logs[0].createdAt).toLocaleTimeString() : 'N/A'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      User Growth Trend
                    </CardTitle>
                    <CardDescription>Total and active users over the last 7 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={userGrowthData}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorUsers)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Quiz Performance
                    </CardTitle>
                    <CardDescription>Daily quiz attempts and average scores</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={quizPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis yAxisId="left" className="text-xs" />
                        <YAxis yAxisId="right" orientation="right" className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="attempts" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Attempts" />
                        <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Avg Score %" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Level Distribution
                    </CardTitle>
                    <CardDescription>User distribution across level ranges</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={levelDistribution}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="range" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Score Distribution
                    </CardTitle>
                    <CardDescription>Quiz score ranges breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={scoreDistribution}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="range" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>Latest system events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {logsLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        ))}
                      </div>
                    ) : logs.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No activity logs found
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[160px] overflow-y-auto">
                        {logs.slice(0, 5).map((log) => (
                          <div key={log.id} className="flex items-start gap-2 pb-3 border-b border-border last:border-0 last:pb-0">
                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{log.action}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(log.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Top Performers
                  </CardTitle>
                  <CardDescription>Highest XP earners in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {allUsers
                        .sort((a, b) => b.totalXp - a.totalXp)
                        .slice(0, 8)
                        .map((user, index) => (
                          <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg hover-elevate border">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                              ${index === 0 ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' : 
                                index === 1 ? 'bg-gray-400/20 text-gray-600 dark:text-gray-400' :
                                index === 2 ? 'bg-orange-600/20 text-orange-600 dark:text-orange-400' :
                                'bg-primary/10 text-primary'}`}
                            >
                              #{index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm truncate">{user.username}</div>
                              <div className="text-xs text-muted-foreground">
                                Level {user.level} • {user.totalXp.toLocaleString()} XP
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[250px] max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by username or email..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search-users"
                  />
                </div>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-[180px]" data-testid="select-user-filter">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="active">Active (7d)</SelectItem>
                    <SelectItem value="admin">Admins Only</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  data-testid="button-add-user"
                  onClick={() => setShowAddUser(true)}
                  className="gap-2"
                >
                  <Users className="w-4 h-4" />
                  Add User
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  {usersLoading ? (
                    <div className="p-8 space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No users found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/50 border-b">
                          <tr className="text-left">
                            <th className="p-4 font-semibold text-sm">User</th>
                            <th className="p-4 font-semibold text-sm">Email</th>
                            <th className="p-4 font-semibold text-sm">Level</th>
                            <th className="p-4 font-semibold text-sm">Total XP</th>
                            <th className="p-4 font-semibold text-sm">Status</th>
                            <th className="p-4 font-semibold text-sm">Role</th>
                            <th className="p-4 font-semibold text-sm w-12"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user) => (
                            <tr key={user.id} className="border-b last:border-0 hover-elevate transition-colors" data-testid={`row-user-${user.id}`}>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-sm">
                                    {user.username.substring(0, 2).toUpperCase()}
                                  </div>
                                  <span className="font-medium">{user.username}</span>
                                </div>
                              </td>
                              <td className="p-4 text-muted-foreground text-sm">{user.email}</td>
                              <td className="p-4">
                                <Badge variant="outline" className="font-semibold">
                                  Level {user.level}
                                </Badge>
                              </td>
                              <td className="p-4 text-muted-foreground font-medium">{user.totalXp.toLocaleString()}</td>
                              <td className="p-4">
                                {user.lastActiveAt && new Date(user.lastActiveAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 ? (
                                  <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-muted-foreground">
                                    Inactive
                                  </Badge>
                                )}
                              </td>
                              <td className="p-4">
                                {user.isAdmin ? (
                                  <Badge variant="outline" className="bg-primary/10 text-primary">
                                    <Shield className="w-3 h-3 mr-1" />
                                    Admin
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">User</Badge>
                                )}
                              </td>
                              <td className="p-4">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleToggleAdmin(user.id)}>
                                      <UserCog className="w-4 h-4 mr-2" />
                                      {user.isAdmin ? "Remove Admin" : "Make Admin"}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => setDeletingUserId(user.id)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete User
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {!usersLoading && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Showing {filteredUsers.length} of {totalUsers} users</span>
                  <span>{adminUsers} admin{adminUsers !== 1 ? 's' : ''} • {activeUsers} active</span>
                </div>
              )}
            </div>
          )}

          {activeTab === "modules" && (
            <ModuleManagement />
          )}

          {activeTab === "results" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="hover-elevate">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-muted-foreground">Total Attempts</div>
                      <div className="p-2 bg-chart-1/10 rounded-lg">
                        <FileText className="w-5 h-5 text-chart-1" />
                      </div>
                    </div>
                    <div className="text-3xl font-display font-bold mb-1">{quizResults.length}</div>
                    <div className="text-sm text-muted-foreground">All time</div>
                  </CardContent>
                </Card>
                <Card className="hover-elevate">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-muted-foreground">Average Score</div>
                      <div className="p-2 bg-chart-2/10 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-chart-2" />
                      </div>
                    </div>
                    <div className="text-3xl font-display font-bold mb-1">{averageScore}%</div>
                    <div className="text-sm text-muted-foreground">Across all quizzes</div>
                  </CardContent>
                </Card>
                <Card className="hover-elevate">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-muted-foreground">Active Learners</div>
                      <div className="p-2 bg-chart-3/10 rounded-lg">
                        <Award className="w-5 h-5 text-chart-3" />
                      </div>
                    </div>
                    <div className="text-3xl font-display font-bold mb-1">
                      {new Set(quizResults.map(r => r.userId)).size}
                    </div>
                    <div className="text-sm text-muted-foreground">Unique participants</div>
                  </CardContent>
                </Card>
                <Card className="hover-elevate">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-muted-foreground">Unique Quizzes</div>
                      <div className="p-2 bg-chart-4/10 rounded-lg">
                        <BookOpen className="w-5 h-5 text-chart-4" />
                      </div>
                    </div>
                    <div className="text-3xl font-display font-bold mb-1">
                      {new Set(quizResults.map(r => r.quizId)).size}
                    </div>
                    <div className="text-sm text-muted-foreground">Available quizzes</div>
                  </CardContent>
                </Card>
              </div>

              {resultsLoading ? (
                <Card>
                  <CardContent className="p-8 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : (
                <QuizResultsTable attempts={quizResults} />
              )}
            </div>
          )}

          {activeTab === "syllabus" && (
            <div className="max-w-4xl">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Syllabus Upload
                  </CardTitle>
                  <CardDescription>
                    Upload course syllabi for AI-powered question generation and module creation
                  </CardDescription>
                </CardHeader>
              </Card>
              <SyllabusUpload />
            </div>
          )}

          {activeTab === "audit" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">System Audit Trail</h3>
                  <p className="text-sm text-muted-foreground">Complete log of all system activities</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Logs
                </Button>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  {logsLoading ? (
                    <div className="p-8 space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-5 w-64" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <AuditLogTable logs={logs} />
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6 max-w-5xl">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    AI & Integration Services
                  </CardTitle>
                  <CardDescription>Configure external services and AI capabilities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg hover-elevate">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold">Naive Bayes Model</div>
                          <div className="text-sm text-muted-foreground">Career path recommendations</div>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ML algorithm for personalized career guidance based on quiz performance
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg hover-elevate">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold">OpenAI Integration</div>
                          <div className="text-sm text-muted-foreground">Question generation</div>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        GPT-powered quiz generation from syllabus documents
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg hover-elevate">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold">Judge0 API</div>
                          <div className="text-sm text-muted-foreground">Code execution</div>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Multi-language code compilation and testing environment
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg hover-elevate">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold">Firebase Firestore</div>
                          <div className="text-sm text-muted-foreground">Primary database</div>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        NoSQL cloud database - {totalUsers} users, {quizResults.length} quiz attempts
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Assessment Security
                  </CardTitle>
                  <CardDescription>Anti-cheating and assessment integrity features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg hover-elevate">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold">Tab Switch Detection</div>
                          <div className="text-sm text-muted-foreground">Auto-fail protection</div>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Enabled
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Automatically fails quizzes when students switch tabs during assessment
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg hover-elevate">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold">Fullscreen Mode</div>
                          <div className="text-sm text-muted-foreground">Required for assessments</div>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Enabled
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Enforces fullscreen mode during critical assessments
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg hover-elevate">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold">Question Randomization</div>
                          <div className="text-sm text-muted-foreground">Shuffle quiz content</div>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Enabled
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Randomizes question order and answer options to prevent copying
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg hover-elevate">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold">Duplicate Submission Block</div>
                          <div className="text-sm text-muted-foreground">Prevent re-submission</div>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Enabled
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Prevents multiple submissions of the same quiz attempt
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    System Information
                  </CardTitle>
                  <CardDescription>Platform statistics and resource usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Database</div>
                      <div className="text-xl font-bold">Firestore</div>
                      <div className="text-xs text-muted-foreground mt-1">Cloud NoSQL</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Total Users</div>
                      <div className="text-xl font-bold">{totalUsers.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground mt-1">{adminUsers} admins</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Quiz Attempts</div>
                      <div className="text-xl font-bold">{quizResults.length.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground mt-1">All time</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">System Events</div>
                      <div className="text-xl font-bold">{logs.length.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground mt-1">Audit logs</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      <EditUserDialog
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onUserUpdated={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
          setEditingUser(null);
        }}
      />

      <AddUserDialog
        open={showAddUser}
        onClose={() => setShowAddUser(false)}
        onUserAdded={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
          setShowAddUser(false);
        }}
      />

      <LogoutConfirmationDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogout}
      />

      <ConfirmationDialog
        open={!!deletingUserId}
        onOpenChange={(open) => {
          if (!open && !isDeletingUser) {
            setDeletingUserId(null);
          }
        }}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone and will permanently remove all user data, progress, and achievements."
        confirmText="Delete User"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeletingUser}
      />
    </div>
  );
}
