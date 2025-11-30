import { useEffect, useState, useRef, useMemo } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import QuizCard from "@/components/QuizCard";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, AlertCircle, Loader2, ArrowLeft, Timer } from "lucide-react";
import { useTabDetection } from "@/hooks/useTabDetection";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import type { Quiz as QuizType, Question } from "@shared/schema";

interface QuizProps {
  quizId?: string;
}

export default function Quiz({ quizId }: QuizProps) {
  const id = quizId;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const hasAutoSubmitted = useRef(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const [showForfeitModal, setShowForfeitModal] = useState(false);
  const [isForfeiting, setIsForfeiting] = useState(false);

  // Detect if this is a daily challenge from URL query parameter
  const isDailyChallenge = new URLSearchParams(window.location.search).get('daily') === 'true';

  // Check if this is a practice quiz from session storage
  const [practiceQuizData, setPracticeQuizData] = useState<{ quiz: QuizType; questions: Question[] } | null>(null);
  const isPracticeQuiz = id?.startsWith('practice-');

  useEffect(() => {
    if (isPracticeQuiz && id) {
      const storedData = sessionStorage.getItem(`practice-quiz-${id}`);
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          setPracticeQuizData(data);
        } catch (error) {
          console.error("Failed to parse practice quiz data:", error);
        }
      }
    }
  }, [id, isPracticeQuiz]);

  // Use the tab detection hook - ALWAYS enabled for anti-cheat security
  const { tabSwitched: hasDetectedSwitch, switchCount, showWarning, simulateTabSwitch } = useTabDetection({
    enabled: true, // Always active, not just in fullscreen
    onTabSwitch: async () => {
      console.log("Tab switch callback triggered!");
      // Auto-submit if daily challenge
      if (isDailyChallenge && !hasAutoSubmitted.current) {
        hasAutoSubmitted.current = true;
        try {
          console.log('[Quiz] Auto-submitting terminated daily challenge');
          await apiRequest('POST', `/api/daily-challenges/complete`, {
            challengeId: id,
            challengeType: 'quiz',
          });
          await queryClient.invalidateQueries({ queryKey: ["/api/daily-challenges/today"] });
          await queryClient.refetchQueries({ queryKey: ["/api/daily-challenges/today"] });
          console.log('[Quiz] Successfully auto-submitted daily challenge');
        } catch (err) {
          console.error('[Quiz] Failed to auto-submit:', err);
        }
      }
    },
  });

  // Fetch quiz data (skip for practice quizzes)
  const { data: quizData, isLoading: quizLoading, error: quizError } = useQuery<{ quiz: QuizType; questions: Question[] }>({
    queryKey: ["/api/quizzes", id],
    enabled: !!id && !isPracticeQuiz,
  });

  // Use practice quiz data if available, otherwise use fetched data
  const actualQuizData = isPracticeQuiz ? practiceQuizData : quizData;
  const actualLoading = isPracticeQuiz ? !practiceQuizData : quizLoading;

  // Initialize timer when quiz data loads
  useEffect(() => {
    if (actualQuizData?.quiz?.timeLimit && timeRemaining === null) {
      setTimeRemaining(actualQuizData.quiz.timeLimit);
    }
  }, [actualQuizData]);

  // Submit quiz mutation
  const submitMutation = useMutation({
    mutationFn: async (answers: Record<string, number>) => {
      // Practice quizzes use different submission endpoint
      // Server validates answers against cached quiz data to prevent XP farming
      if (isPracticeQuiz) {
        const res = await apiRequest("POST", `/api/quizzes/practice/${id}/submit`, {
          answers,
        });
        return await res.json();
      }

      // Regular quiz submission
      const res = await apiRequest("POST", `/api/quizzes/${id}/submit`, {
        answers,
        wasTabSwitched: hasDetectedSwitch,
        isDailyChallenge,
      });
      return await res.json();
    },
    onSuccess: async (data: any) => {
      // Invalidate all user-related queries to refresh XP and level
      await queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/users/me/badges"] });
      await queryClient.refetchQueries({ queryKey: ["/api/users/me/badges"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });

      // Invalidate daily challenges cache if this was a daily challenge
      if (isDailyChallenge) {
        await queryClient.invalidateQueries({ queryKey: ["/api/daily-challenges/today"] });
        await queryClient.refetchQueries({ queryKey: ["/api/daily-challenges/today"] });
      }

      // Check if user reached Level 20
      if (data.reachedLevel20) {
        toast({
          title: "🎉 Congratulations! Level 20!",
          description: "Complete the Interest Assessment to receive your AI career recommendation!",
        });
        setTimeout(() => navigate("/dashboard"), 2500);
        return;
      }

      // Handle practice quiz retakes (no XP awarded)
      if (data.isRetake) {
        toast({
          title: "Practice Quiz Completed!",
          description: `You scored ${data.score}/${data.totalQuestions} (${data.percentage.toFixed(0)}%). This was a retake, so no XP was awarded. Generate a new quiz to earn more XP!`,
        });
        setTimeout(() => navigate("/dashboard"), 2500);
        return;
      }

      toast({
        title: "Quiz Completed!",
        description: `You scored ${data.score}/${data.totalQuestions}. Earned ${data.xpEarned} XP!${data.leveledUp ? ` Level Up to ${data.newLevel}!` : ''}`,
      });
      setTimeout(() => navigate("/dashboard"), 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit quiz",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen();
  };

  const handleAnswerChange = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleSubmit = (forced = false) => {
    // Prevent duplicate submissions
    if (hasAutoSubmitted.current) return;

    // Allow forced submission on timeout or tab switch
    if (!forced && Object.keys(answers).length < (actualQuizData?.questions.length || 0)) {
      toast({
        title: "Incomplete Quiz",
        description: "Please answer all questions before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Mark as submitted before mutation to prevent race conditions
    hasAutoSubmitted.current = true;
    submitMutation.mutate(answers);
  };

  // Auto-submit if tab switched
  useEffect(() => {
    if (hasDetectedSwitch && !hasAutoSubmitted.current) {
      toast({
        title: "Assessment Terminated",
        description: "Tab switch detected. Auto-submitting your answers.",
        variant: "destructive",
      });
      handleSubmit(true);
    }
  }, [hasDetectedSwitch]);

  // Timer countdown
  useEffect(() => {
    if (hasAutoSubmitted.current || timeRemaining === null || timeRemaining <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          handleSubmit(true); // Force submit on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [hasAutoSubmitted.current, timeRemaining]); // Rerun if time remaining changes

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTabSwitch = () => {
    toast({
      title: "Assessment Terminated",
      description: "Tab switch detected. Auto-submitting your answers.",
      variant: "destructive",
    });
    handleSubmit(true); // Force submit on tab switch
  };

  const handleBackClick = () => {
    if (isDailyChallenge) {
      setShowForfeitModal(true);
    } else {
      navigate("/dashboard");
    }
  };

  const handleForfeit = async () => {
    setIsForfeiting(true);
    try {
      await apiRequest('POST', `/api/daily-challenges/complete`, {
        challengeId: id,
        challengeType: 'quiz',
      });

      await queryClient.invalidateQueries({ queryKey: ["/api/daily-challenges/today"] });
      await queryClient.refetchQueries({ queryKey: ["/api/daily-challenges/today"] });

      toast({
        title: "Challenge Forfeited",
        description: "This quiz challenge has been marked as used. Your coding challenge is still available today.",
      });

      navigate("/dashboard");
    } catch (err) {
      console.error('Failed to forfeit challenge:', err);
      toast({
        title: "Error",
        description: "Failed to forfeit challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsForfeiting(false);
      setShowForfeitModal(false);
    }
  };

  // Fisher-Yates shuffle algorithm for randomizing questions
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Convert correct answer from text to index and shuffle questions (memoized to prevent re-shuffling on re-render)
  const mappedQuestions = useMemo(() => {
    if (!actualQuizData?.questions) return [];
    return shuffleArray(actualQuizData.questions.map(q => {
      const correctIndex = q.options.findIndex(opt => opt === q.correctAnswer);
      return {
        id: q.id,
        question: q.questionText,
        options: q.options,
        correctAnswer: correctIndex >= 0 ? correctIndex : 0,
      };
    }));
  }, [actualQuizData?.questions]);

  const handleReturnFromTermination = async () => {
    if (isDailyChallenge && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      try {
        await apiRequest('POST', `/api/daily-challenges/complete`, {
          challengeId: id,
          challengeType: 'quiz',
        });
        await queryClient.invalidateQueries({ queryKey: ["/api/daily-challenges/today"] });
        await queryClient.refetchQueries({ queryKey: ["/api/daily-challenges/today"] });
      } catch (err) {
        console.error('Failed to mark daily challenge as complete:', err);
      }
    }
    navigate("/dashboard");
  };

  if (hasDetectedSwitch) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md border-destructive">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
            <h2 className="font-display font-bold text-2xl">Assessment Terminated</h2>
            <p className="text-muted-foreground">
              You switched tabs during the assessment. For security reasons, your session has been ended and your current progress has been submitted.
            </p>
            <Button 
              className="w-full" 
              data-testid="button-return-dashboard"
              onClick={handleReturnFromTermination}
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (actualLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (quizError || !actualQuizData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md border-destructive">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
            <h2 className="font-display font-bold text-2xl">Quiz Not Found</h2>
            <p className="text-muted-foreground">
              The quiz you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link href="/dashboard">
              <Button className="w-full" data-testid="button-return-dashboard">
                Return to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { quiz } = actualQuizData;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBackClick} data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">CareerQuest Assessment</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!isFullscreen && (
              <Button
                variant="outline"
                size="sm"
                onClick={enterFullscreen}
                data-testid="button-fullscreen"
              >
                Enter Fullscreen
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Debug panel - shows tab detection status */}
        {showWarning && (
          <div className="mb-4 p-4 bg-destructive border-2 border-destructive-foreground rounded-lg animate-pulse">
            <p className="text-destructive-foreground font-bold text-center text-lg">
              🚨 TAB SWITCH DETECTED! AUTO-SUBMITTING NOW! 🚨
            </p>
          </div>
        )}

        <div className="mb-8 text-center">
          <h1 className="font-display font-bold text-3xl mb-2" data-testid="text-quiz-title">
            {quiz.title}
          </h1>
          <p className="text-muted-foreground">{quiz.description}</p>
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg inline-block">
            <p className="text-sm text-destructive font-bold">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              ⚠️ BAWAL MAG-ALT TAB - Do not switch tabs or the assessment will be auto-submitted immediately!
            </p>
            <p className="text-xs text-destructive mt-2">
              This is a one-time assessment. Tab switching will result in automatic termination.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{quiz.title}</span>
              <div className="flex items-center gap-4">
                {quiz.timeLimit && timeRemaining !== null && (
                  <div className={`flex items-center gap-2 ${timeRemaining < 300 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    <Timer className="w-4 h-4" />
                    <span className="text-sm font-mono">{formatTime(timeRemaining)}</span>
                  </div>
                )}
                <span className="text-sm font-normal text-muted-foreground">
                  {mappedQuestions.length} Questions
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QuizCard
              questions={mappedQuestions}
              timeLimit={quiz.timeLimit || undefined}
              onAnswerChange={handleAnswerChange}
              onSubmit={handleSubmit}
              isSubmitting={submitMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>

      <ConfirmationDialog
        open={showForfeitModal}
        onOpenChange={setShowForfeitModal}
        onConfirm={handleForfeit}
        title="Forfeit Daily Challenge?"
        description="If you leave now, this quiz challenge will be marked as used and you won't be able to retry it today. However, your coding challenge will still be available."
        confirmText="Forfeit Challenge"
        cancelText="Continue Quiz"
        variant="destructive"
        isLoading={isForfeiting}
      />
    </div>
  );
}