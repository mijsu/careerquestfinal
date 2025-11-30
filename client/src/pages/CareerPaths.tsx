import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CareerPathCard from "@/components/CareerPathCard";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Brain, Sparkles, Loader2 } from "lucide-react";
import { Code2, Database, Cloud, Smartphone, Shield, LineChart } from "lucide-react";
import type { CareerPath } from "@shared/schema";

const iconMap: Record<string, any> = {
  Code2,
  Database,
  Cloud,
  Smartphone,
  Shield,
  LineChart,
};

export default function CareerPaths() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch career paths from backend
  const { data, isLoading } = useQuery<{ paths: CareerPath[] }>({
    queryKey: ["/api/career-paths"],
  });

  const careerPaths = data?.paths || [];

  // Select career path mutation
  const selectPathMutation = useMutation({
    mutationFn: async (pathId: string) => {
      return apiRequest("POST", `/api/career-paths/select`, { pathId });
    },
    onSuccess: () => {
      toast({
        title: "Career Path Selected!",
        description: "Your learning journey has been customized to this path.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      navigate("/dashboard");
    },
    onError: () => {
      toast({
        title: "Selection Failed",
        description: "Failed to select career path. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSelectPath = (pathId: string) => {
    selectPathMutation.mutate(pathId);
  };

  const handleAIGuide = () => {
    navigate("/dashboard");
    toast({
      title: "AI Guidance Enabled",
      description: "Complete quizzes and challenges to reach Level 20 for your personalized recommendation!",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 z-50 bg-background">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">CareerQuest</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} data-testid="button-dashboard">
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-4">
            Choose Your <span className="text-primary">Career Path</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Select a path that aligns with your interests, or let our AI recommend one at Level 20
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="border-2 border-primary hover-elevate cursor-pointer" data-testid="card-choose-path">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Code2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display font-bold text-2xl">I'll Choose My Path</h3>
              <p className="text-muted-foreground">
                Browse all career paths and select the one that excites you most. Get modules and lessons aligned to your choice.
              </p>
              <div className="text-sm text-primary font-medium">
                Scroll down to browse paths ↓
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer" data-testid="card-ai-guide">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display font-bold text-2xl">Let AI Guide Me</h3>
              <p className="text-muted-foreground">
                Complete general lessons and let our AI analyze your performance. Get a personalized recommendation at Level 20.
              </p>
              <Button size="lg" variant="outline" className="w-full" onClick={handleAIGuide} data-testid="button-ai-guide">
                Start Learning
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-display font-bold text-2xl">Available Career Paths</h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {careerPaths.map((path) => {
                const Icon = iconMap[path.icon] || Code2;
                return (
                  <CareerPathCard
                    key={path.id}
                    pathId={path.id}
                    icon={Icon}
                    title={path.name}
                    description={path.description}
                    skills={path.requiredSkills}
                    ranks={path.progressionRanks}
                    onSelect={handleSelectPath}
                    isSelecting={selectPathMutation.isPending}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
