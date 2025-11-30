import DailyChallengeCard from '../DailyChallengeCard';

export default function DailyChallengeCardExample() {
  return (
    <DailyChallengeCard 
      title="Reverse a Linked List"
      difficulty="medium"
      xpReward={150}
      timeEstimate="15 min"
      streak={7}
    />
  );
}
