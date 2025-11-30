import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Zap, Brain, Target, Rocket, CheckCircle } from "lucide-react";

interface CareerRecommendationModalProps {
  open: boolean;
  onClose: () => void;
  careerPath: any;
}

export default function CareerRecommendationModal({
  open,
  onClose,
  careerPath,
}: CareerRecommendationModalProps) {
  if (!careerPath) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <DialogTitle className="text-2xl font-bold">Your Career Path Recommendation</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Main Recommendation Card */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-primary/70 uppercase tracking-wider">Recommended Path</p>
                  <h2 className="text-3xl font-bold text-primary">{careerPath.name}</h2>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>
              <p className="text-base text-muted-foreground">{careerPath.description}</p>
            </div>
          </Card>

          {/* How You Were Matched */}
          <div className="space-y-3">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              How You Were Matched
            </h3>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">AI-Powered Analysis</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Our machine learning algorithm analyzed your interest assessment responses and academic performance to find your perfect match.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Interest Alignment</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your responses showed strong preferences for the skills and concepts that define this career path.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Personalized for You</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This recommendation is tailored to your learning style and career aspirations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progression Path */}
          {careerPath.progressionRanks && careerPath.progressionRanks.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-base">Your Career Progression</h3>
              <div className="flex gap-2">
                {careerPath.progressionRanks.map((rank: string, idx: number) => (
                  <div key={idx} className="flex-1">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/30 text-center">
                      <p className="text-xs font-medium text-primary">{rank}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Required Skills */}
          {careerPath.requiredSkills && careerPath.requiredSkills.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-base">Key Skills to Develop</h3>
              <div className="flex flex-wrap gap-2">
                {careerPath.requiredSkills.map((skill: string, idx: number) => (
                  <div
                    key={idx}
                    className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-xs font-medium text-primary"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <Card className="bg-primary/5 border-primary/20 p-4">
            <h3 className="font-semibold text-sm mb-2">What's Next?</h3>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary font-bold">→</span>
                <span>Access curated learning modules for {careerPath.name}</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">→</span>
                <span>Complete daily challenges to build your skills</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">→</span>
                <span>Earn badges and unlock advanced content</span>
              </li>
            </ul>
          </Card>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={onClose} className="flex-1">
            Start Learning
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
