import CareerPathCard from '../CareerPathCard';
import { Code2, Database } from 'lucide-react';

export default function CareerPathCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      <CareerPathCard 
        icon={Code2}
        title="Full Stack Developer"
        description="Build complete web applications from front to back"
        skills={["React", "Node.js", "PostgreSQL", "TypeScript"]}
        salaryRange="$70k - $140k"
        timeEstimate="12-18 months"
        recommended={true}
      />
      <CareerPathCard 
        icon={Database}
        title="Data Engineer"
        description="Design and maintain data infrastructure"
        skills={["Python", "SQL", "Apache Spark", "AWS"]}
        salaryRange="$80k - $150k"
        timeEstimate="18-24 months"
      />
    </div>
  );
}
