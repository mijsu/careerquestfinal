import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/");
    }

    if (!isLoading && user && requireAdmin && !user.isAdmin) {
      setLocation("/dashboard");
    }
    
    // Redirect admin users to admin dashboard on login
    if (!isLoading && user && user.isAdmin && !requireAdmin && window.location.pathname === "/dashboard") {
      setLocation("/admin");
    }
  }, [user, isLoading, requireAdmin, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (requireAdmin && !user.isAdmin)) {
    return null;
  }

  return <>{children}</>;
}
