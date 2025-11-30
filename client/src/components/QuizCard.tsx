import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, ChevronRight, ChevronLeft, Check } from "lucide-react";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizCardProps {
  questions: QuizQuestion[];
  timeLimit?: number;
  onAnswerChange?: (questionId: string, answerIndex: number) => void;
  onSubmit?: (forced?: boolean) => void;
  isSubmitting?: boolean;
}

export default function QuizCard({ 
  questions, 
  timeLimit, 
  onAnswerChange,
  onSubmit,
  isSubmitting = false 
}: QuizCardProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit || 0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const hasAutoSubmitted = useRef(false);

  useEffect(() => {
    if (!timeLimit) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1 && !hasAutoSubmitted.current) {
          // Auto-submit when time runs out (forced) - only once
          hasAutoSubmitted.current = true;
          onSubmit?.(true);
          clearInterval(timer);
          return 0;
        }
        return Math.max(0, prev - 1);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLimit, onSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (index: number) => {
    const questionId = questions[currentQuestion].id;
    setSelectedAnswer(index);
    setAnswers(prev => ({ ...prev, [questionId]: index }));
    onAnswerChange?.(questionId, index);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      const nextQuestionId = questions[nextQuestion].id;
      setSelectedAnswer(answers[nextQuestionId] ?? null);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      const prevQuestion = currentQuestion - 1;
      setCurrentQuestion(prevQuestion);
      const prevQuestionId = questions[prevQuestion].id;
      setSelectedAnswer(answers[prevQuestionId] ?? null);
    }
  };

  const handleSubmitClick = () => {
    if (Object.keys(answers).length < questions.length) {
      return; // Parent will handle validation
    }
    onSubmit?.();
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const allAnswered = answeredCount === questions.length;

  const isWarning = timeLimit && timeRemaining < 30;
  const isCritical = timeLimit && timeRemaining < 10;

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm font-medium">
            Question {currentQuestion + 1} of {questions.length}
            <span className="text-muted-foreground ml-2">
              ({answeredCount} answered)
            </span>
          </div>
          {timeLimit && (
            <div className={`flex items-center gap-2 ${isCritical ? 'text-destructive' : isWarning ? 'text-[hsl(var(--warning))]' : 'text-muted-foreground'}`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-semibold" data-testid="text-timer">
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-xl font-semibold leading-relaxed" data-testid="text-question">
          {questions[currentQuestion].question}
        </div>
        
        <div className="space-y-3">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className={`w-full min-h-16 p-4 text-left rounded-lg border-2 transition-all hover-elevate ${
                selectedAnswer === index
                  ? 'border-primary bg-primary/5'
                  : 'border-card-border'
              }`}
              data-testid={`button-option-${index}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedAnswer === index
                    ? 'border-primary bg-primary'
                    : 'border-muted'
                }`}>
                  {selectedAnswer === index && (
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  )}
                </div>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>
        
        <div className="flex justify-between gap-4 pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            data-testid="button-previous"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {isLastQuestion ? (
            <Button
              onClick={handleSubmitClick}
              disabled={!allAnswered || isSubmitting}
              data-testid="button-submit-quiz"
            >
              {isSubmitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Submit Quiz
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              data-testid="button-next"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
