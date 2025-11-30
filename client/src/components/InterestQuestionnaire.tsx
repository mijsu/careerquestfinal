import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Brain } from "lucide-react";
import CareerRecommendationModal from "@/components/CareerRecommendationModal";

interface Question {
  id: number;
  question: string;
  type: "scale" | "choice";
  options?: string[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "How much do you enjoy working with visual design and user interfaces?",
    type: "scale"
  },
  {
    id: 2,
    question: "Do you prefer working on backend systems or frontend interfaces?",
    type: "choice",
    options: ["Backend Systems", "Frontend Interfaces", "Both Equally", "Not Sure"]
  },
  {
    id: 3,
    question: "How comfortable are you with mathematics and statistical analysis?",
    type: "scale"
  },
  {
    id: 4,
    question: "Which area interests you most?",
    type: "choice",
    options: [
      "Building web applications",
      "Analyzing data and patterns",
      "Managing cloud infrastructure",
      "Mobile app development",
      "Cybersecurity and protection"
    ]
  },
  {
    id: 5,
    question: "How much do you enjoy problem-solving and debugging?",
    type: "scale"
  },
  {
    id: 6,
    question: "How interested are you in working with machine learning and AI?",
    type: "scale"
  },
  {
    id: 7,
    question: "Do you prefer working with established technologies or cutting-edge experimental tools?",
    type: "choice",
    options: ["Established & Stable", "Cutting-edge & Experimental", "Mix of Both", "Not Sure"]
  },
  {
    id: 8,
    question: "How much do you enjoy infrastructure and system administration tasks?",
    type: "scale"
  },
  {
    id: 9,
    question: "Which development environment appeals to you most?",
    type: "choice",
    options: [
      "Web browsers and servers",
      "Data notebooks and analytics platforms",
      "Cloud platforms and terminals",
      "Mobile devices and emulators",
      "Security testing environments"
    ]
  },
  {
    id: 10,
    question: "How interested are you in protecting systems from security threats?",
    type: "scale"
  },
  {
    id: 11,
    question: "Do you prefer building user-facing features or working on behind-the-scenes systems?",
    type: "choice",
    options: ["User-facing Features", "Behind-the-scenes Systems", "Both Equally", "Not Sure"]
  },
  {
    id: 12,
    question: "How comfortable are you with deploying and managing applications in production?",
    type: "scale"
  }
];

export default function InterestQuestionnaire() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | string | null)[]>(new Array(questions.length).fill(null));
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { refreshUser, setPendingRecommendation } = useAuth();

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  // Submit interest assessment mutation
  const submitMutation = useMutation({
    mutationFn: async (data: { responses: Array<{ questionId: number; response: string }> }) => {
      const res = await apiRequest("POST", "/api/interest/submit", data);
      return await res.json();
    },
    onSuccess: async (data: any) => {
      console.log("Assessment submission successful, data:", data);
      toast({
        title: "Assessment Complete!",
        description: "Redirecting you to your dashboard...",
      });
      
      // Invalidate and refresh user data to get the new career path assignment
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      await refreshUser();
      
      // Store the recommendation in context to display on dashboard
      if (data?.recommendedPath) {
        setPendingRecommendation(data.recommendedPath);
      }
      
      // Navigate to dashboard immediately
      navigate("/dashboard");
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Failed to submit your responses. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleScaleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
    console.log(`Question ${currentQuestion + 1} answered:`, value);
  };

  const handleChoiceAnswer = (choice: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = choice;
    setAnswers(newAnswers);
    console.log(`Question ${currentQuestion + 1} answered:`, choice);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    // Convert answers array to responses array format for backend
    const responseArray = questions.map((q, index) => ({
      questionId: q.id,
      response: String(answers[index] || ""),
    })).filter(r => r.response !== "");
    
    submitMutation.mutate({ responses: responseArray });
  };

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle>Interest Assessment</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      
      <CardContent className="space-y-8">
        <div className="text-xl font-semibold leading-relaxed min-h-[60px]">
          {question.question}
        </div>
        
        {question.type === "scale" && (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Not at all</span>
              <span>Very much</span>
            </div>
            <div className="flex gap-2 justify-between">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleScaleAnswer(value)}
                  className={`w-14 h-14 rounded-full border-2 font-semibold transition-all hover-elevate ${
                    answers[currentQuestion] === value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-card-border hover:border-primary'
                  }`}
                  data-testid={`button-scale-${value}`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {question.type === "choice" && question.options && (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleChoiceAnswer(option)}
                className={`w-full min-h-14 p-4 text-left rounded-lg border-2 transition-all hover-elevate ${
                  answers[currentQuestion] === option
                    ? 'border-primary bg-primary/5'
                    : 'border-card-border'
                }`}
                data-testid={`button-choice-${index}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQuestion] === option
                      ? 'border-primary bg-primary'
                      : 'border-muted'
                  }`}>
                    {answers[currentQuestion] === option && (
                      <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        )}
        
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
          
          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={answers[currentQuestion] === null || submitMutation.isPending}
              data-testid="button-submit"
            >
              {submitMutation.isPending ? "Analyzing..." : "Get Recommendation"}
              {!submitMutation.isPending && <Brain className="w-4 h-4 ml-2" />}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={answers[currentQuestion] === null}
              data-testid="button-next"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
