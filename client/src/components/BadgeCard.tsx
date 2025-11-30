import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface BadgeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlocked: boolean;
}

const rarityColors = {
  common: "text-[hsl(var(--badge-common))] border-[hsl(var(--badge-common))]",
  rare: "text-[hsl(var(--badge-rare))] border-[hsl(var(--badge-rare))]",
  epic: "text-[hsl(var(--badge-epic))] border-[hsl(var(--badge-epic))]",
  legendary: "text-[hsl(var(--badge-legendary))] border-[hsl(var(--badge-legendary))]",
};

const rarityGlow = {
  common: "",
  rare: "badge-glow-rare",
  epic: "badge-glow-epic",
  legendary: "badge-glow-legendary",
};

export default function BadgeCard({ icon: Icon, title, description, rarity, unlocked }: BadgeCardProps) {
  return (
    <Card className={`relative hover-elevate transition-all duration-300 ${!unlocked ? 'opacity-50' : ''} ${unlocked && rarity !== 'common' ? rarityGlow[rarity] : ''}`}>
      <CardContent className="p-6 text-center">
        <div className={`w-20 h-20 mx-auto rounded-full border-2 flex items-center justify-center mb-4 ${unlocked ? rarityColors[rarity] : 'border-muted text-muted'} ${!unlocked ? 'grayscale' : ''}`}>
          {unlocked ? (
            <Icon className="w-10 h-10" />
          ) : (
            <Lock className="w-10 h-10" />
          )}
        </div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-2">{description}</p>
        <span className={`text-xs font-medium ${unlocked ? rarityColors[rarity] : 'text-muted-foreground'}`}>
          {rarity.toUpperCase()}
        </span>
      </CardContent>
    </Card>
  );
}
