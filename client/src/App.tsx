import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ParticleBackground } from "@/components/ParticleBackground";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Quiz from "@/pages/Quiz";
import CodeChallenge from "@/pages/CodeChallenge";
import CareerPaths from "@/pages/CareerPaths";
import Admin from "@/pages/Admin";
import Profile from "@/pages/Profile";
import Leaderboard from "@/pages/Leaderboard";
import InterestAssessment from "./pages/InterestAssessment";
import Modules from "./pages/Modules";
import Lesson from "./pages/Lesson";
import SearchResults from "./pages/SearchResults";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/quiz/:id">
        {(params) => (
          <ProtectedRoute>
            <Quiz quizId={params.id} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/challenge/:id">
        {(params) => (
          <ProtectedRoute>
            <CodeChallenge challengeId={params.id} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/careers">
        <ProtectedRoute>
          <CareerPaths />
        </ProtectedRoute>
      </Route>
      <Route path="/interest-assessment" component={InterestAssessment} />
      <Route path="/modules">
        <ProtectedRoute>
          <Modules />
        </ProtectedRoute>
      </Route>
      <Route path="/lesson/:lessonId">
        {(params) => (
          <ProtectedRoute>
            <Lesson />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin">
        <ProtectedRoute requireAdmin>
          <Admin />
        </ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      <Route path="/search">
        <ProtectedRoute>
          <SearchResults />
        </ProtectedRoute>
      </Route>
      <Route path="/leaderboard">
        <ProtectedRoute>
          <Leaderboard />
        </ProtectedRoute>
      </Route>
      <Route path="/reset-password" component={ResetPassword} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <ParticleBackground />
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;