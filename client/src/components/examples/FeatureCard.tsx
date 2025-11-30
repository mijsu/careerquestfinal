import FeatureCard from '../FeatureCard';
import { Sparkles } from 'lucide-react';

export default function FeatureCardExample() {
  return (
    <FeatureCard 
      icon={Sparkles}
      title="AI-Powered Recommendations"
      description="Get personalized career path suggestions based on your learning patterns and interests."
    />
  );
}
