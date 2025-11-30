
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Star, Crown } from "lucide-react";

interface Rank {
  name: string;
  minXP: number;
  icon: string;
}

const ranks: Rank[] = [
  { name: "Junior", minXP: 0, icon: "🌱" },
  { name: "Mid-Level", minXP: 10000, icon: "🌿" },
  { name: "Senior", minXP: 25000, icon: "🌳" },
  { name: "Lead", minXP: 50000, icon: "🏆" }
];

interface ProgressionRanksProps {
  currentXP: number;
  careerPath?: string;
}

export default function ProgressionRanks({ currentXP, careerPath }: ProgressionRanksProps) {
  const currentRankIndex = ranks.findIndex((rank, index) => {
    const nextRank = ranks[index + 1];
    return currentXP >= rank.minXP && (!nextRank || currentXP < nextRank.minXP);
  });

  const currentRank = ranks[currentRankIndex];
  const nextRank = ranks[currentRankIndex + 1];
  
  const progressToNext = nextRank 
    ? ((currentXP - currentRank.minXP) / (nextRank.minXP - currentRank.minXP)) * 100
    : 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Progression Rank
        </CardTitle>
        <CardDescription>
          {careerPath ? `Your rank in ${careerPath}` : "Select a career path to see your rank"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Rank */}
          <div className="text-center">
            <div className="text-5xl mb-2">{currentRank.icon}</div>
            <h3 className="text-2xl font-bold">{currentRank.name}</h3>
            <p className="text-sm text-muted-foreground">
              {currentXP.toLocaleString()} XP
            </p>
          </div>

          {/* Progress to Next Rank */}
          {nextRank && (
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress to {nextRank.name}</span>
                <span className="font-medium">{Math.round(progressToNext)}%</span>
              </div>
              <Progress value={progressToNext} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1 text-center">
                {(nextRank.minXP - currentXP).toLocaleString()} XP to go
              </p>
            </div>
          )}

          {/* All Ranks */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm mb-3">Rank Progression</h4>
            {ranks.map((rank, index) => {
              const achieved = currentXP >= rank.minXP;
              const isCurrent = index === currentRankIndex;

              return (
                <div
                  key={rank.name}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isCurrent ? "border-primary bg-primary/5" : achieved ? "border-green-500/50 bg-green-500/5" : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl ${achieved ? "" : "opacity-30"}`}>
                      {rank.icon}
                    </div>
                    <div>
                      <p className={`font-medium ${!achieved && "opacity-50"}`}>
                        {rank.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {rank.minXP.toLocaleString()} XP
                      </p>
                    </div>
                  </div>
                  {isCurrent && (
                    <Badge variant="default">Current</Badge>
                  )}
                  {achieved && !isCurrent && (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-400">
                      Achieved
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
