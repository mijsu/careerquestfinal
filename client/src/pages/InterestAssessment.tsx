import InterestQuestionnaire from "@/components/InterestQuestionnaire";
import ThemeToggle from "@/components/ThemeToggle";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Sparkles } from "lucide-react";

export default function InterestAssessment() {
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
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display font-bold text-4xl mb-4">
            You've Reached <span className="text-primary">Level 20!</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Complete this interest assessment to receive your personalized AI-powered career path recommendation.
          </p>
          <Card className="max-w-2xl mx-auto mb-8 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold mb-1">How This Works</h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI will analyze your learning performance data combined with your interest responses 
                    using a Naive Bayes algorithm to recommend the perfect career path for you. This includes 
                    specific role progressions from Junior to Senior level positions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <InterestQuestionnaire />
      </div>
    </div>
  );
}
