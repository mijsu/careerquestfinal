
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { BookOpen, CheckCircle2, Lock, PlayCircle, Trophy, ArrowLeft, FileText, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  xpReward: number;
  order: number;
  requiredLevel?: number;
  estimatedTime: string;
  pdfUrl?: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  careerPath: string;
  order: number;
  lessons: Lesson[];
  totalXP: number;
  requiredLevel?: number;
}

interface UserProgress {
  completedLessons: string[];
  completedModules: string[];
}

export default function Modules() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [userProgress, setUserProgress] = useState<UserProgress>({
    completedLessons: [],
    completedModules: []
  });
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [completingLesson, setCompletingLesson] = useState(false);

  // Fetch modules using useQuery for cache invalidation support
  // staleTime: 0 ensures fresh data is always fetched (no caching beyond invalidation)
  const { data: modulesData, isLoading: loading, error: modulesError, refetch: refetchModules } = useQuery<{ modules: Module[] }>({
    queryKey: ["/api/modules"],
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const modules = modulesData?.modules || [];

  useEffect(() => {
    if (modulesError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load modules"
      });
    }
  }, [modulesError, toast]);

  useEffect(() => {
    fetchUserProgress();
  }, []);

  const fetchUserProgress = async () => {
    try {
      const response = await fetch("/api/users/me/progress", {
        credentials: "include",
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.ok) throw new Error("Failed to fetch progress");

      const data = await response.json();
      setUserProgress(data.progress || { completedLessons: [], completedModules: [] });
    } catch (error: any) {
      console.error("Failed to load user progress:", error);
    }
  };

  const calculateModuleProgress = (module: Module) => {
    const completed = module.lessons.filter(lesson => 
      userProgress.completedLessons.includes(lesson.id)
    ).length;
    return (completed / module.lessons.length) * 100;
  };

  const isModuleLocked = (module: Module) => {
    if (!module.requiredLevel) return false;
    return (user?.level || 0) < module.requiredLevel;
  };

  const isLessonLocked = (lesson: Lesson) => {
    if (!lesson.requiredLevel) return false;
    return (user?.level || 0) < lesson.requiredLevel;
  };

  const handleOpenLesson = (lesson: Lesson, module: Module) => {
    setSelectedLesson(lesson);
    setSelectedModule(module);
    setIsLessonModalOpen(true);
  };

  const handleCloseLesson = () => {
    setIsLessonModalOpen(false);
    // Delay clearing state to avoid flicker during close animation
    setTimeout(() => {
      setSelectedLesson(null);
      setSelectedModule(null);
    }, 200);
  };

  const handleModalOpenChange = (open: boolean) => {
    if (open) {
      setIsLessonModalOpen(true);
    } else {
      handleCloseLesson();
    }
  };

  const completeLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      return apiRequest("POST", `/api/lessons/${lessonId}/complete`, {});
    },
    onSuccess: async () => {
      toast({
        title: "Lesson Complete!",
        description: `You earned ${selectedLesson?.xpReward || 0} XP!`,
      });

      // Refresh progress and modules cache immediately
      await fetchUserProgress();
      await queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
      await queryClient.refetchQueries({ queryKey: ["/api/modules"] });
      await refetchModules();
      handleCloseLesson();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to mark lesson as complete"
      });
    },
  });

  const handleCompleteLesson = async () => {
    if (!selectedLesson) return;
    completeLessonMutation.mutate(selectedLesson.id);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading modules...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
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
        <h1 className="text-4xl font-bold mb-2">Learning Modules</h1>
        <p className="text-muted-foreground">
          Progress through structured lessons to master your career path
        </p>
      </div>

      {modules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Modules Available</h3>
            <p className="text-muted-foreground mb-4">
              Modules for your career path will appear here once they're created.
            </p>
            <Button onClick={() => setLocation("/career-paths")}>
              View Career Paths
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {modules.map((module) => {
            const progress = calculateModuleProgress(module);
            const locked = isModuleLocked(module);
            const completed = userProgress.completedModules.includes(module.id);

            return (
              <Card key={module.id} className={locked ? "opacity-60" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-2xl">{module.title}</CardTitle>
                        {completed && (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                        {locked && (
                          <Badge variant="secondary">
                            <Lock className="w-3 h-3 mr-1" />
                            Level {module.requiredLevel} Required
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{module.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Trophy className="w-4 h-4" />
                        {module.totalXP} XP
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {module.lessons.map((lesson) => {
                      const lessonCompleted = userProgress.completedLessons.includes(lesson.id);
                      const lessonLocked = locked || isLessonLocked(lesson);

                      return (
                        <div
                          key={lesson.id}
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            lessonLocked ? "bg-muted/50" : "bg-card hover:bg-accent/50"
                          } transition-colors`}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              lessonCompleted ? "bg-green-500 text-white" : lessonLocked ? "bg-muted" : "bg-primary/10"
                            }`}>
                              {lessonCompleted ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : lessonLocked ? (
                                <Lock className="w-5 h-5" />
                              ) : (
                                <PlayCircle className="w-5 h-5" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{lesson.title}</h4>
                              <p className="text-sm text-muted-foreground">{lesson.description}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                <span>{lesson.estimatedTime}</span>
                                <span>•</span>
                                <span>{lesson.xpReward} XP</span>
                                {lesson.requiredLevel && (
                                  <>
                                    <span>•</span>
                                    <span>Level {lesson.requiredLevel}+</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant={lessonCompleted ? "outline" : "default"}
                            size="sm"
                            disabled={lessonLocked}
                            onClick={() => handleOpenLesson(lesson, module)}
                            data-testid={`button-start-lesson-${lesson.id}`}
                          >
                            {lessonCompleted ? "Review" : "Start"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Lesson Modal */}
      <Dialog open={isLessonModalOpen} onOpenChange={handleModalOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  {selectedModule?.title}
                </div>
                <DialogTitle className="text-2xl">{selectedLesson?.title}</DialogTitle>
                <DialogDescription>
                  {selectedLesson?.description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-1">
            {selectedLesson?.pdfUrl ? (
              <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">PDF Lesson Ready</h3>
                  <p className="text-muted-foreground max-w-md">
                    This lesson is in PDF format. Click below to open it in a new tab and view it with your browser's built-in PDF viewer.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => selectedLesson.pdfUrl && window.open(selectedLesson.pdfUrl, '_blank')}
                    size="lg"
                    data-testid="button-open-pdf-new-tab"
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Open PDF in New Tab
                  </Button>
                  <Button
                    onClick={() => {
                      if (!selectedLesson.pdfUrl) return;
                      const link = document.createElement('a');
                      link.href = selectedLesson.pdfUrl;
                      link.download = `${selectedLesson.title}.pdf`;
                      link.click();
                    }}
                    variant="outline"
                    size="lg"
                    data-testid="button-download-pdf"
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: selectedLesson?.content || '' }}
              />
            )}
          </div>

          <div className="border-t pt-4 mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Earn <span className="font-semibold text-primary">{selectedLesson?.xpReward} XP</span> upon completion
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCloseLesson}
                data-testid="button-cancel-lesson"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCompleteLesson}
                disabled={completeLessonMutation.isPending || userProgress.completedLessons.includes(selectedLesson?.id || '')}
                data-testid="button-complete-lesson"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {completeLessonMutation.isPending ? "Completing..." : userProgress.completedLessons.includes(selectedLesson?.id || '') ? "Completed" : "Mark as Complete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
