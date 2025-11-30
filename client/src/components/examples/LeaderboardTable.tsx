import LeaderboardTable from '../LeaderboardTable';

//todo: remove mock functionality
const mockEntries = [
  { rank: 1, name: "Alex Chen", level: 42, xp: 125000, badges: 87 },
  { rank: 2, name: "Sarah Johnson", level: 40, xp: 118500, badges: 82 },
  { rank: 3, name: "Mike Rodriguez", level: 38, xp: 112000, badges: 75 },
  { rank: 4, name: "Emily Davis", level: 35, xp: 98500, badges: 68, isCurrentUser: true },
  { rank: 5, name: "John Smith", level: 34, xp: 95000, badges: 65 },
];

export default function LeaderboardTableExample() {
  return <LeaderboardTable entries={mockEntries} />;
}
