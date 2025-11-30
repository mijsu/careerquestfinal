import ProgressRing from '../ProgressRing';

export default function ProgressRingExample() {
  return (
    <ProgressRing progress={65}>
      <div className="text-center">
        <div className="text-2xl font-bold">15</div>
        <div className="text-xs text-muted-foreground">Level</div>
      </div>
    </ProgressRing>
  );
}
