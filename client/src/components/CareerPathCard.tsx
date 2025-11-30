import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface CareerPathCardProps {
  pathId: string;
  icon: LucideIcon;
  title: string;
  description: string;
  skills: string[];
  ranks: string[];
  recommended?: boolean;
  onSelect: (pathId: string) => void;
  isSelecting?: boolean;
}

export default function CareerPathCard({
  pathId,
  icon: Icon,
  title,
  description,
  skills,
  ranks,
  recommended = false,
  onSelect,
  isSelecting = false
}: CareerPathCardProps) {
  return (
    <Card className={`hover-elevate transition-all duration-300 ${recommended ? 'border-primary border-2' : ''}`}>
      {recommended && (
        <div className="bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          AI Recommended For You
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-xl mt-4">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{description}</p>
        
        <div className="space-y-2">
          <div className="text-sm font-medium">Key Skills:</div>
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 5).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium">Progression Path:</div>
          <div className="text-sm text-muted-foreground">
            {ranks.join(" → ")}
          </div>
        </div>
        
        <Button 
          className="w-full" 
          variant={recommended ? "default" : "outline"} 
          onClick={() => onSelect(pathId)}
          disabled={isSelecting}
          data-testid={`button-select-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {isSelecting ? "Selecting..." : "Select Path"}
          {!isSelecting && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </CardContent>
    </Card>
  );
}
