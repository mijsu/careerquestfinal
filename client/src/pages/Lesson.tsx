import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, ChevronLeft, FileText, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Lesson as LessonType, Module } from "@shared/schema";

export default function Lesson() {
  const [, params] = useRoute("/lesson/:lessonId");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const lessonId = params?.lessonId;
  const [showPdfModal, setShowPdfModal] = useState(false);

  const { data: lessonData, isLoading } = useQuery<{ lesson: LessonType; module: Module }>({
    queryKey: [`/api/lessons/${lessonId}`],
    enabled: !!lessonId,
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/lessons/${lessonId}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      toast({
        title: "Lesson Complete!",
        description: `You earned ${lessonData?.lesson.xpReward || 0} XP!`,
      });
      navigate("/modules");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark lesson as complete",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-bold text-2xl mb-2">Lesson Not Found</h2>
          <Button onClick={() => navigate("/modules")} data-testid="button-back-modules">
            Back to Modules
          </Button>
        </div>
      </div>
    );
  }

  const { lesson, module } = lessonData;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/modules")}
          className="mb-6"
          data-testid="button-back"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Modules
        </Button>

        <Card>
          <CardHeader>
            <div className="mb-2">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {module.title}
              </div>
            </div>
            <CardTitle className="text-3xl">{lesson.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {lesson.pdfUrl ? (
              <div className="text-center space-y-4 py-8">
                <FileText className="w-16 h-16 mx-auto text-primary" />
                <p className="text-muted-foreground">
                  {lesson.content}
                </p>
                <Button
                  onClick={() => setShowPdfModal(true)}
                  size="lg"
                  data-testid="button-view-pdf"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Lesson PDF
                </Button>
              </div>
            ) : (
              <div className="prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                Lesson {lesson.order} • {lesson.xpReward} XP
              </div>
              <Button
                onClick={() => completeMutation.mutate()}
                disabled={completeMutation.isPending}
                data-testid="button-complete"
              >
                {completeMutation.isPending ? "Completing..." : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark as Complete
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* PDF Modal */}
        <Dialog open={showPdfModal} onOpenChange={setShowPdfModal}>
          <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{lesson.title}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              {lesson.pdfUrl && (
                <iframe
                  src={lesson.pdfUrl}
                  className="w-full h-full border-0 rounded"
                  title={lesson.title}
                />
              )}
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {lesson.xpReward} XP
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPdfModal(false)}
                  data-testid="button-close-pdf"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    completeMutation.mutate();
                    setShowPdfModal(false);
                  }}
                  disabled={completeMutation.isPending}
                  data-testid="button-complete-pdf"
                >
                  {completeMutation.isPending ? "Completing..." : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark as Complete
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
