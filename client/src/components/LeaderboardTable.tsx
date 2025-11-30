import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  level: number;
  xp: number;
  badges: number;
  isCurrentUser?: boolean;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export default function LeaderboardTable({ entries }: LeaderboardTableProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-[hsl(var(--badge-legendary))]" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-[hsl(var(--badge-rare))]" />;
    if (rank === 3) return <Award className="w-5 h-5 text-[hsl(var(--badge-epic))]" />;
    return null;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="sticky top-0 bg-card border-b border-card-border">
          <tr className="text-left">
            <th className="p-4 font-semibold text-sm">Rank</th>
            <th className="p-4 font-semibold text-sm">Player</th>
            <th className="p-4 font-semibold text-sm">Level</th>
            <th className="p-4 font-semibold text-sm">XP</th>
            <th className="p-4 font-semibold text-sm">Badges</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr 
              key={entry.rank}
              className={`border-b border-card-border hover-elevate ${entry.isCurrentUser ? 'bg-primary/5' : ''}`}
              data-testid={`row-user-${entry.rank}`}
            >
              <td className="p-4">
                <div className="flex items-center gap-2">
                  {getRankIcon(entry.rank)}
                  <span className="font-semibold">{entry.rank}</span>
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {entry.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {entry.name}
                    {entry.isCurrentUser && <span className="ml-2 text-xs text-primary">(You)</span>}
                  </span>
                </div>
              </td>
              <td className="p-4 font-semibold text-primary">{entry.level}</td>
              <td className="p-4">{entry.xp.toLocaleString()}</td>
              <td className="p-4">{entry.badges}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
