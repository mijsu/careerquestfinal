import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, XCircle } from "lucide-react";

interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number; // percentage 0-100
  correctAnswers: number;
  totalQuestions: number;
  xpEarned: number;
  completedAt: Date;
  wasTabSwitched: boolean;
  username?: string;
  quizTitle?: string;
}

interface QuizResultsTableProps {
  attempts: QuizAttempt[];
}

export function QuizResultsTable({ attempts }: QuizResultsTableProps) {
  const getScoreColor = (scorePercentage: number) => {
    if (scorePercentage >= 80) return "text-green-600 dark:text-green-400";
    if (scorePercentage >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getProctoringBadge = (wasTabSwitched: boolean) => {
    if (!wasTabSwitched) {
      return (
        <Badge variant="outline" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Clean
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        Flagged
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Quiz Results</CardTitle>
        <CardDescription>
          Monitor student quiz performance and proctoring data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {attempts.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No quiz attempts recorded yet
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Quiz</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>XP Earned</TableHead>
                  <TableHead>Proctoring</TableHead>
                  <TableHead>Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.map((attempt) => {
                  return (
                    <TableRow key={attempt.id} data-testid={`row-quiz-result-${attempt.id}`}>
                      <TableCell data-testid={`text-username-${attempt.id}`}>
                        {attempt.username || 'Unknown'}
                      </TableCell>
                      <TableCell 
                        className="max-w-[200px] truncate"
                        data-testid={`text-quiz-title-${attempt.id}`}
                      >
                        {attempt.quizTitle || 'Unknown Quiz'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span 
                            className={`font-semibold ${getScoreColor(attempt.score)}`}
                            data-testid={`text-score-${attempt.id}`}
                          >
                            {attempt.score.toFixed(1)}%
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({attempt.correctAnswers}/{attempt.totalQuestions})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-xp-${attempt.id}`}>
                        <Badge variant="secondary">+{attempt.xpEarned} XP</Badge>
                      </TableCell>
                      <TableCell data-testid={`badge-proctoring-${attempt.id}`}>
                        {getProctoringBadge(attempt.wasTabSwitched)}
                      </TableCell>
                      <TableCell 
                        className="text-sm text-muted-foreground"
                        data-testid={`text-completed-${attempt.id}`}
                      >
                        {formatDistanceToNow(new Date(attempt.completedAt), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
