import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Flame, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DailyChallengeCardProps {
  title: string;
  difficulty: "easy" | "medium" | "hard";
  xpReward: number;
  timeEstimate: string;
  streak: number;
  challengeId: string;
  challengeType: "quiz" | "code";
  completed?: boolean;
}

const difficultyColors = {
  easy: "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]",
  medium: "bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]",
  hard: "bg-destructive text-destructive-foreground",
};

export default function DailyChallengeCard({
  title,
  difficulty,
  xpReward,
  timeEstimate,
  streak,
  challengeId,
  challengeType,
  completed = false,
}: DailyChallengeCardProps) {
  const [, setLocation] = useLocation();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleStartChallenge = () => {
    // Prevent starting if already completed
    if (completed) {
      setShowConfirmModal(false);
      return;
    }
    
    if (challengeType === "quiz") {
      setLocation(`/quiz/${challengeId}?daily=true`);
    } else if (challengeType === "code") {
      setLocation(`/challenge/${challengeId}?daily=true`);
    }
    setShowConfirmModal(false);
  };

  return (
    <Card className={completed ? "opacity-75" : "hover-elevate"}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Badge className={difficultyColors[difficulty]}>
              {difficulty.toUpperCase()}
            </Badge>
            {completed && (
              <Badge className="bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{timeEstimate}</span>
          </div>
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Trophy className="w-4 h-4 fill-primary" />
            <span>+{xpReward} XP</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <Flame className="w-5 h-5 text-[hsl(var(--warning))]" />
          <div className="flex-1">
            <div className="text-sm font-semibold">{streak} Day Streak!</div>
            <div className="text-xs text-muted-foreground">Keep it going</div>
          </div>
        </div>

        <Button 
          className="w-full" 
          size="lg" 
          onClick={() => setShowConfirmModal(true)} 
          disabled={completed}
          data-testid="button-start-challenge"
        >
          {completed ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Completed Today
            </>
          ) : (
            <>
              <Trophy className="w-4 h-4 mr-2" />
              Start Challenge
            </>
          )}
        </Button>
      </CardContent>

      <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-6 h-6 text-destructive" />
              <AlertDialogTitle className="text-xl">Daily Challenge Warning</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-3 pt-2">
              <p className="text-base">
                This is a <span className="font-bold text-destructive">one-time challenge</span>. Once you start:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li className="text-destructive font-semibold">You cannot retry if you fail</li>
                <li className="text-destructive font-semibold">Switching tabs will terminate the assessment immediately</li>
                <li className="text-destructive font-semibold">There is no pause or restart option</li>
              </ul>
              <p className="text-sm text-muted-foreground pt-2">
                Make sure you're ready and have enough time before proceeding.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-not-now">Not Now</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleStartChallenge} 
              data-testid="button-proceed" 
              className="bg-primary"
              disabled={completed}
            >
              Proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}