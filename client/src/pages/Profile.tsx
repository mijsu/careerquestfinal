import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogOut, User, Mail, Trophy, Target, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import type { Badge as BadgeType } from "@shared/schema";
import ProgressionRanks from "@/components/ProgressionRanks";
import { useLocation } from "wouter";
import LogoutConfirmationDialog from "@/components/LogoutConfirmationDialog";

export default function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
  });

  const { data: badgesData } = useQuery<{ badges: BadgeType[] }>({
    queryKey: ["/api/users/me/badges"],
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const handleSaveProfile = async () => {
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          displayName: formData.displayName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      await refreshUser();
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
      });
    }
  };

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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display font-bold text-3xl">My Profile</h1>
          <Button 
            variant="outline" 
            onClick={() => setShowLogoutDialog(true)} 
            className="gap-2" 
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-xl">{user.displayName}</h2>
                  <p className="text-muted-foreground">@{user.username}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={formData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <Label>Username</Label>
                  <Input
                    value={user.username}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Username cannot be changed</p>
                </div>

                <div className="flex gap-2 pt-4">
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                  ) : (
                    <>
                      <Button onClick={handleSaveProfile}>Save Changes</Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            displayName: user.displayName,
                            email: user.email,
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="font-bold text-2xl">{user.level}</div>
                  <div className="text-sm text-muted-foreground">Level</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="font-bold text-2xl">{user.totalXp}</div>
                  <div className="text-sm text-muted-foreground">Total XP</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="font-bold text-2xl">{user.currentStreak}</div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="font-bold text-2xl">{badgesData?.badges.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Badges</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Level Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Level {user.level}</span>
                  <span className="text-sm text-muted-foreground">{user.xp} / 1000 XP</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(user.xp / 1000) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {1000 - user.xp} XP needed to reach Level {user.level + 1}
                </p>
              </div>
            </CardContent>
          </Card>

          {badgesData?.badges && badgesData.badges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>My Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {badgesData.badges.map((badge) => (
                    <div key={badge.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="text-4xl">{badge.icon}</div>
                      <div>
                        <h3 className="font-semibold">{badge.name}</h3>
                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progression Ranks */}
          <Card>
            <CardHeader>
              <CardTitle>Career Progression</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressionRanks currentXP={user?.totalXp || 0} careerPath={user?.currentCareerPathId || undefined} />
            </CardContent>
          </Card>
        </div>

        <LogoutConfirmationDialog
          open={showLogoutDialog}
          onOpenChange={setShowLogoutDialog}
          onConfirm={handleLogout}
        />
      </div>
    </div>
  );
}