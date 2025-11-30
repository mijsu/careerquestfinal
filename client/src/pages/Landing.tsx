import { useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";
import ThemeToggle from "@/components/ThemeToggle";
import AuthModal from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import {
  Sparkles,
  Trophy,
  Code2,
  Brain,
  Target,
  Users,
  ArrowRight,
  CheckCircle2,
  Star,
  Quote,
  Zap,
  Shield,
  Rocket,
  Menu,
  X,
} from "lucide-react";
import aiPathImage from "@assets/generated_images/AI_pathfinding_tree_illustration_229f6c37.png";
import careerProgressImage from "@assets/generated_images/Career_progression_timeline_graphic_6b96a5cb.png";

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  const openAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const navItems = [
    { label: "Features", href: "features" },
    { label: "Career Paths", href: "careers" },
    { label: "Testimonials", href: "testimonials" },
  ];

  const testimonials = [
    {
      name: "Ivan Bajuyo",
      role: "Full Stack Developer",
      avatar: "SC",
      content:
        "CareerQuest transformed my career! The AI recommendations led me to backend development, and I landed my dream job in just 6 months.",
      rating: 5,
    },
    {
      name: "Ian Mc Banog",
      role: "Data Scientist",
      avatar: "MJ",
      content:
        "The gamification made learning addictive. I went from knowing nothing about ML to getting certified as a Data Scientist.",
      rating: 5,
    },
    {
      name: "Villegas Custodio",
      role: "Frontend Engineer",
      avatar: "ER",
      content:
        "Daily challenges kept me consistent. The leaderboard competition pushed me to learn faster than I ever thought possible!",
      rating: 5,
    },
  ];

  const pricingTiers = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "Access to 50+ modules",
        "Daily coding challenges",
        "Community leaderboard",
        "Basic progress tracking",
        "Email support",
      ],
      cta: "Get Started Free",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      description: "For serious learners",
      features: [
        "Everything in Free",
        "Access to ALL 150+ modules",
        "AI-powered career recommendations",
        "Advanced analytics dashboard",
        "Priority support",
        "Exclusive career workshops",
        "Certificate of completion",
      ],
      cta: "Start Pro Trial",
      highlighted: true,
    },
    {
      name: "Team",
      price: "$49",
      period: "per user/month",
      description: "For organizations",
      features: [
        "Everything in Pro",
        "Team management dashboard",
        "Custom learning paths",
        "Advanced reporting",
        "Dedicated account manager",
        "SSO integration",
        "Custom branding",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
            : "bg-background/80 backdrop-blur-sm border-b border-border/50"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center transition-all duration-300 ${
                  scrolled ? "w-8 h-8" : "w-10 h-10"
                }`}
              >
                <Trophy
                  className={`text-primary-foreground transition-all duration-300 ${
                    scrolled ? "w-4 h-4" : "w-5 h-5"
                  }`}
                />
              </div>
              <span
                className={`font-display font-bold transition-all duration-300 ${
                  scrolled ? "text-lg" : "text-xl"
                }`}
              >
                CareerQuest
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  data-testid={`button-nav-${item.href}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openAuth("login")}
                data-testid="button-login"
              >
                Log In
              </Button>
              <Button
                size="sm"
                onClick={() => openAuth("register")}
                data-testid="button-signup"
                className="shadow-lg shadow-primary/25"
              >
                Sign Up Free
              </Button>
            </div>

            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-border pt-4 space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="block w-full text-left text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  data-testid={`button-nav-mobile-${item.href}`}
                >
                  {item.label}
                </button>
              ))}
              <div className="flex items-center gap-2 pt-4 border-t border-border">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openAuth("login")}
                  className="flex-1"
                  data-testid="button-mobile-login"
                >
                  Log In
                </Button>
                <Button
                  size="sm"
                  onClick={() => openAuth("register")}
                  className="flex-1"
                  data-testid="button-mobile-signup"
                >
                  Sign Up
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
      />

      <main className="pt-16">
        <HeroSection onGetStarted={() => openAuth("register")} />

        <section id="features" className="py-24 px-6 scroll-mt-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4" variant="secondary">
                <Sparkles className="w-3 h-3 mr-1" />
                Features
              </Badge>
              <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
                Everything You Need to{" "}
                <span className="text-primary">Excel</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                A complete learning ecosystem designed to accelerate your
                computer science career
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
              <FeatureCard
                icon={Sparkles}
                title="AI-Powered Recommendations"
                description="Get personalized career path suggestions based on your learning patterns, interests, and performance using advanced algorithms."
              />
              <FeatureCard
                icon={Trophy}
                title="Gamified Learning"
                description="Earn XP, unlock badges, level up, and compete on global leaderboards. Make learning addictive and fun."
              />
              <FeatureCard
                icon={Code2}
                title="Integrated Code Editor"
                description="Practice coding directly in your browser with our powerful compiler supporting multiple programming languages."
              />
              <FeatureCard
                icon={Brain}
                title="Scenario-Based Quizzes"
                description="Test your knowledge with real-world scenarios. Questions are intelligently shuffled for optimal learning."
              />
              <FeatureCard
                icon={Target}
                title="Daily Challenges"
                description="Build consistency with daily coding challenges. Maintain your streak and watch your skills compound."
              />
              <FeatureCard
                icon={Users}
                title="Global Leaderboards"
                description="See how you rank against peers worldwide. Climb the leaderboard and become a top performer."
              />
            </div>

            <div
              id="careers"
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center scroll-mt-16"
            >
              <div>
                <Badge className="mb-4" variant="secondary">
                  <Zap className="w-3 h-3 mr-1" />
                  AI-Powered Career Guidance
                </Badge>
                <h3 className="font-display font-bold text-3xl md:text-4xl mb-6">
                  Let AI Guide Your{" "}
                  <span className="text-primary">Career Journey</span>
                </h3>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Not sure which path to take? Our AI analyzes your performance,
                  interests, and learning style to recommend the perfect career
                  path at Level 20.
                </p>
                <ul className="space-y-4">
                  {[
                    "Choose your own path or let AI guide you",
                    "Interest-based questionnaire at Level 20",
                    "Specific career tiers: Junior → Mid → Senior → Lead",
                    "Personalized module recommendations for your path",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  size="lg"
                  className="mt-8 group"
                  onClick={() => openAuth("register")}
                >
                  Start Your Journey
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
              <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all">
                <img
                  src={aiPathImage}
                  alt="AI Career Pathfinding"
                  className="w-full h-auto"
                />
              </Card>
            </div>
          </div>
        </section>

        <section
          id="testimonials"
          className="py-24 px-6 bg-muted/30 scroll-mt-16"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4" variant="secondary">
                <Star className="w-3 h-3 mr-1" />
                Testimonials
              </Badge>
              <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
                Loved by{" "}
                <span className="text-primary">Students Worldwide</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See what our community has to say about their learning journey
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <Card
                  key={testimonial.name}
                  className="hover-elevate transition-all"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map(
                        (_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-yellow-500 text-yellow-500"
                          />
                        ),
                      )}
                    </div>
                    <Quote className="w-8 h-8 text-primary/20 mb-3" />
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {testimonial.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>


        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-primary shadow-xl shadow-primary/20 overflow-hidden">
              <CardContent className="p-12 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5" />
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-violet-600 mb-6">
                    <Trophy className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
                    Ready to Level Up Your Career?
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Join 10,000+ students already transforming their tech
                    careers with AI-powered learning
                  </p>
                  <Button
                    size="lg"
                    className="text-lg px-8 min-h-14 group shadow-lg shadow-primary/25"
                    onClick={() => openAuth("register")}
                    data-testid="button-get-started"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <p className="text-sm text-muted-foreground mt-4">
                    No credit card required • Start learning in 60 seconds
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <footer className="py-12 px-6 border-t border-border bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="font-display font-bold text-lg">
                    CareerQuest
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Gamified career path recommendation system helping CS students
                  discover and achieve their dream careers.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <button
                      onClick={() => scrollToSection("features")}
                      className="hover:text-foreground transition-colors"
                    >
                      Features
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("careers")}
                      className="hover:text-foreground transition-colors"
                    >
                      Career Paths
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a
                      href="#"
                      className="hover:text-foreground transition-colors"
                    >
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-foreground transition-colors"
                    >
                      Tutorials
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-foreground transition-colors"
                    >
                      Blog
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a
                      href="#"
                      className="hover:text-foreground transition-colors"
                    >
                      About
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-foreground transition-colors"
                    >
                      Contact
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-foreground transition-colors"
                    >
                      Privacy
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground pt-8 border-t border-border">
              <p>
                © 2025 CareerQuest. All rights reserved. Built with passion for
                learners worldwide.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
