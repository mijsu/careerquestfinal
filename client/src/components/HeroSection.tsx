import { Button } from "@/components/ui/button";
import { Trophy, Sparkles, Code2, ArrowRight, Target } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `
            linear-gradient(135deg, 
              hsl(var(--primary) / 0.15) 0%, 
              transparent 50%,
              hsl(var(--primary) / 0.1) 100%
            ),
            linear-gradient(to bottom, 
              hsl(var(--background)) 0%, 
              hsl(var(--background) / 0.95) 100%
            )
          `,
        }}
      />
      
      <div className="absolute inset-0 z-0 opacity-60">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-5 py-2 mb-8 hover-elevate">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Join 10,000+ Students Leveling Up</span>
        </div>
        
        <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-6 bg-gradient-to-br from-foreground via-foreground to-primary bg-clip-text text-transparent leading-tight">
          Transform Your Career with
          <br />
          <span className="bg-gradient-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent">
            Gamified Learning
          </span>
        </h1>
        
        <p className="text-lg md:text-xl lg:text-2xl mb-10 text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Master computer science through AI-powered recommendations, earn badges, compete on leaderboards, and discover your perfect tech career path.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <Button 
            size="lg" 
            onClick={onGetStarted}
            className="text-lg px-8 min-h-14 group shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            data-testid="button-start-journey"
          >
            <Trophy className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
            Start Your Journey Free
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-8 min-h-14 group border-2"
            data-testid="button-explore-paths"
            onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Code2 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Explore Features
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 max-w-4xl mx-auto">
          {[
            { label: "Active Learners", value: "10K+", icon: Trophy },
            { label: "Career Paths", value: "15+", icon: Target },
            { label: "Code Challenges", value: "500+", icon: Code2 },
          ].map((stat) => (
            <div key={stat.label} className="group cursor-default">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-br from-foreground to-primary bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
