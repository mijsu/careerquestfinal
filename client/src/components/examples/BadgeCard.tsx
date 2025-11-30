import BadgeCard from '../BadgeCard';
import { Award } from 'lucide-react';

export default function BadgeCardExample() {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <BadgeCard 
        icon={Award}
        title="First Steps"
        description="Complete your first lesson"
        rarity="common"
        unlocked={true}
      />
      <BadgeCard 
        icon={Award}
        title="Code Master"
        description="Solve 100 challenges"
        rarity="legendary"
        unlocked={false}
      />
    </div>
  );
}
