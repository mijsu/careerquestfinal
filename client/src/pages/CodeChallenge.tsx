import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import CodeEditor from "@/components/CodeEditor";
import ThemeToggle from "@/components/ThemeToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, CheckCircle2, Star, XCircle, Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef, useEffect } from "react";
import { useTabDetection } from "@/hooks/useTabDetection";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import type { CodeChallenge as CodeChallengeType } from "@shared/schema";

interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string | null;
  passed: boolean;
  error: string | null;
}

interface CodeChallengeProps {
  challengeId?: string;
}

export default function CodeChallenge({ challengeId }: CodeChallengeProps) {
  const id = challengeId;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  const hasAutoSubmittedRef = useRef(false);
  const [isTerminated, setIsTerminated] = useState(false);
  const [showForfeitModal, setShowForfeitModal] = useState(false);
  const [isForfeiting, setIsForfeiting] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const isDailyChallenge = searchParams.get('daily') === 'true';

  // Tab detection for anti-cheat (ALWAYS enabled)
  const { tabSwitched, switchCount, showWarning, reset: resetTabDetection, simulateTabSwitch } = useTabDetection({
    enabled: true, // Always on, not just fullscreen
    onTabSwitch: async () => {
      console.log(`[CodeChallenge] Tab switch detected! Current switchCount will increment.`);
      if (!hasAutoSubmittedRef.current) {
        hasAutoSubmittedRef.current = true;
        setHasAutoSubmitted(true);
        setIsTerminated(true);
        console.log(`[CodeChallenge] Setting isTerminated=true, showing termination screen`);

        // Auto-submit if daily challenge
        if (isDailyChallenge) {
          try {
            console.log('[CodeChallenge] Auto-submitting terminated daily challenge');
            await apiRequest('POST', `/api/daily-challenges/complete`, {
              challengeId: id,
              challengeType: 'code',
            });
            await queryClient.invalidateQueries({ queryKey: ["/api/daily-challenges/today"] });
            await queryClient.refetchQueries({ queryKey: ["/api/daily-challenges/today"] });
            console.log('[CodeChallenge] Successfully auto-submitted daily challenge');
          } catch (err) {
            console.error('[CodeChallenge] Failed to auto-submit:', err);
          }
        }

        toast({
          title: "⚠️ Challenge Terminated",
          description: "Tab switching detected. Assessment terminated.",
          variant: "destructive",
        });
      }
    },
  });

  // Debug: Log switch count changes
  useEffect(() => {
    console.log(`[CodeChallenge] switchCount updated: ${switchCount}, tabSwitched: ${tabSwitched}`);
  }, [switchCount, tabSwitched]);

  // Fetch challenge data
  const { data: challengeData, isLoading, error } = useQuery<{ challenge: CodeChallengeType }>({
    queryKey: ["/api/challenges", id],
    enabled: !!id,
  });

  // Submit solution mutation
  const submitMutation = useMutation({
    mutationFn: async ({ code, language }: { code: string; language: string }) => {
      const res = await apiRequest("POST", `/api/challenges/${id}/submit`, { code, language });
      return await res.json();
    },
    onSuccess: async (data: any) => {
      setTestResults(data.testResults.results);
      await queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/users/me/badges"] });
      await queryClient.refetchQueries({ queryKey: ["/api/users/me/badges"] });

      // Check if user reached Level 20
      if (data.reachedLevel20) {
        toast({
          title: "🎉 Congratulations! Level 20!",
          description: "Complete the Interest Assessment to receive your AI career recommendation!",
        });
        setTimeout(() => navigate("/interest-assessment"), 2500);
        return;
      }

      // Show feedback based on results
      if (data.passed) {
        toast({
          title: "Challenge Completed!",
          description: `All tests passed! Earned ${data.xpEarned} XP.${data.leveledUp ? ` Level Up to ${data.newLevel}!` : ''}`,
        });

        // Mark daily challenge as complete if this is a daily challenge
        if (isDailyChallenge && !hasAutoSubmittedRef.current) {
          hasAutoSubmittedRef.current = true;
          try {
            await apiRequest('POST', `/api/daily-challenges/complete`, {
              challengeId: id,
              challengeType: 'code',
            });
            await queryClient.invalidateQueries({ queryKey: ["/api/daily-challenges/today"] });
            await queryClient.refetchQueries({ queryKey: ["/api/daily-challenges/today"] });

            // Navigate back to dashboard after completing daily challenge
            setTimeout(() => navigate("/dashboard"), 2000);
          } catch (err) {
            console.error('Failed to mark daily challenge as complete:', err);
            toast({
              title: "Warning",
              description: "Challenge completed but failed to update daily progress.",
              variant: "destructive",
            });
          }
        } else if (!isDailyChallenge) { // Navigate back to dashboard if it's not a daily challenge
          setTimeout(() => navigate("/dashboard"), 2000);
        }
      } else {
        toast({
          title: "Some Tests Failed",
          description: `${data.testResults.passed}/${data.testResults.total} tests passed. ${isDailyChallenge ? 'Keep trying!' : ''}`,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit solution",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (code: string) => {
    setTestResults(null); // Clear old results before new submission
    submitMutation.mutate({ code, language: selectedLanguage });
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
        challengeType: 'code',
      });

      await queryClient.invalidateQueries({ queryKey: ["/api/daily-challenges/today"] });
      await queryClient.refetchQueries({ queryKey: ["/api/daily-challenges/today"] });

      toast({
        title: "Challenge Forfeited",
        description: "This coding challenge has been marked as used. Your quiz challenge is still available today.",
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !challengeData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md border-destructive">
          <CardContent className="p-8 text-center space-y-4">
            <XCircle className="w-16 h-16 text-destructive mx-auto" />
            <h2 className="font-display font-bold text-2xl">Challenge Not Found</h2>
            <p className="text-muted-foreground">
              The challenge you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link href="/dashboard">
              <Button className="w-full">Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { challenge } = challengeData;
  const difficultyColors = {
    easy: "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]",
    medium: "bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]",
    hard: "bg-destructive text-destructive-foreground",
  };

  // Handle return to dashboard when challenge is terminated
  const handleReturnFromTermination = async () => {
    if (isDailyChallenge && !hasAutoSubmittedRef.current) {
      hasAutoSubmittedRef.current = true;
      try {
        await apiRequest('POST', `/api/daily-challenges/complete`, {
          challengeId: id,
          challengeType: 'code',
        });
        queryClient.invalidateQueries({ queryKey: ["/api/daily-challenges/today"] });
      } catch (err) {
        console.error('Failed to mark daily challenge as complete:', err);
      }
    }
    navigate("/dashboard");
  };

  // Show termination screen if tab switching was detected
  if (isTerminated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md border-destructive">
          <CardContent className="p-8 text-center space-y-4">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto" />
            <h2 className="font-display font-bold text-2xl">Challenge Terminated</h2>
            <p className="text-muted-foreground">
              Tab switching detected. This assessment has been terminated to maintain integrity.
            </p>
            <p className="text-sm text-destructive font-semibold mt-2">
              This was a one-time challenge. You cannot retry it.
            </p>
            <div className="pt-4 space-y-2">
              <Button 
                className="w-full" 
                data-testid="button-return-dashboard"
                onClick={handleReturnFromTermination}
              >
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Tab detection status banner */}
      {tabSwitched && (
        <div className="bg-destructive text-destructive-foreground px-4 py-2 text-center font-semibold animate-pulse" data-testid="banner-tab-detected">
          ⚠️ TAB SWITCHING DETECTED - CHALLENGE TERMINATED
        </div>
      )}
      {showWarning && !tabSwitched && (
        <div className="bg-warning text-warning-foreground px-4 py-2 text-center font-semibold" data-testid="banner-tab-warning">
          ⚠️ Warning: Stay on this page during the challenge
        </div>
      )}
      <header className="border-b border-border sticky top-0 z-50 bg-background">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBackClick} data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">CareerQuest</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            {/* Tab Detection Warning Panel */}
            <Card className={`${tabSwitched ? 'border-destructive bg-destructive/20' : 'border-destructive/50 bg-destructive/5'} transition-all`}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <p className="text-sm font-bold text-destructive">
                      {tabSwitched ? 'CHALLENGE TERMINATED' : 'TAB DETECTION ACTIVE'}
                    </p>
                  </div>
                  <p className="text-xs text-destructive">
                    {tabSwitched
                      ? `Tab switch detected! This challenge has been terminated.`
                      : 'Do not switch tabs or the challenge will be terminated immediately!'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle data-testid="text-challenge-title">{challenge.title}</CardTitle>
                  <Badge className={difficultyColors[challenge.difficulty as keyof typeof difficultyColors]}>
                    {challenge.difficulty.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                  <Star className="w-4 h-4 fill-primary" />
                  <span>+{challenge.xpReward} XP</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Problem Description</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {challenge.description}
                  </p>
                </div>

                {challenge.testCases && challenge.testCases.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Example Test Case</h3>
                    <div className="bg-muted p-3 rounded-lg font-mono text-sm space-y-1">
                      <div><span className="text-muted-foreground">Input:</span> {challenge.testCases[0].input}</div>
                      <div><span className="text-muted-foreground">Output:</span> {challenge.testCases[0].expectedOutput}</div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-3">Test Cases</h3>
                  <p className="text-sm text-muted-foreground">
                    Your solution will be tested against {challenge.testCases.length} test cases
                  </p>
                </div>
              </CardContent>
            </Card>

            {testResults && (
              <Card>
                <CardHeader>
                  <CardTitle>Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {testResults.map((result, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border ${result.passed ? 'bg-[hsl(var(--success))]/10 border-[hsl(var(--success))]' : 'bg-destructive/10 border-destructive'}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {result.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success))]" />
                          ) : (
                            <XCircle className="w-4 h-4 text-destructive" />
                          )}
                          <span className="font-semibold text-sm">Test {idx + 1}</span>
                        </div>
                        {!result.passed && (
                          <div className="text-xs space-y-1 font-mono">
                            <div className="text-muted-foreground">Input: {result.input}</div>
                            <div className="text-muted-foreground">Expected: {result.expectedOutput}</div>
                            <div className="text-destructive">Got: {result.actualOutput || result.error}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2">
            <CodeEditor
              initialCode={challenge.starterCode || `// Write your solution here\nfunction solution() {\n  // Your code\n}`}
              language={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              onSubmit={handleSubmit}
              isSubmitting={submitMutation.isPending}
            />
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={showForfeitModal}
        onOpenChange={setShowForfeitModal}
        onConfirm={handleForfeit}
        title="Forfeit Daily Challenge?"
        description="If you leave now, this coding challenge will be marked as used and you won't be able to retry it today. However, your quiz challenge will still be available."
        confirmText="Forfeit Challenge"
        cancelText="Keep Coding"
        variant="destructive"
        isLoading={isForfeiting}
      />
    </div>
  );
}