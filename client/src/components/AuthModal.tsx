import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, Sparkles, Shield, Eye, EyeOff, Chrome } from "lucide-react";
import { validatePasswordStrength } from "@/lib/passwordValidation";
import ForgotPasswordModal from "./ForgotPasswordModal";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  mode: "login" | "register";
}

export default function AuthModal({ open, onClose, mode: initialMode }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">(initialMode);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (open) {
      setActiveTab(initialMode);
      // Update URL hash for deep linking
      window.history.replaceState(null, '', `#auth=${initialMode}`);
    }
  }, [initialMode, open]);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    displayName: "",
    pathSelectionMode: "ai-guided" as "ai-guided" | "manual",
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  const { login, register } = useAuth();
  const { toast } = useToast();

  const passwordStrength = activeTab === "register" ? validatePasswordStrength(formData.password) : null;

  const handleTabChange = (value: string) => {
    setActiveTab(value as "login" | "register");
    window.history.replaceState(null, '', `#auth=${value}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (activeTab === "login") {
        await login(formData.email, formData.password);
        toast({
          title: "Welcome back!",
          description: "Successfully logged in to CareerQuest",
        });
      } else {
        if (!passwordStrength?.isValid) {
          toast({
            variant: "destructive",
            title: "Weak Password",
            description: "Please create a stronger password meeting all requirements",
          });
          setIsLoading(false);
          return;
        }
        if (formData.password !== confirmPassword) {
          toast({
            variant: "destructive",
            title: "Passwords Don't Match",
            description: "Please make sure both passwords are identical",
          });
          setIsLoading(false);
          return;
        }
        await register({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          confirmPassword: confirmPassword,
          displayName: formData.displayName,
          pathSelectionMode: formData.pathSelectionMode,
        });
        toast({
          title: "Account created!",
          description: "Welcome to CareerQuest - let's start your journey",
        });
      }
      onClose();
      // Reset form
      setFormData({
        email: "",
        username: "",
        password: "",
        displayName: "",
        pathSelectionMode: "ai-guided",
      });
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: activeTab === "login" ? "Login failed" : "Registration failed",
        description: error.message || "Please check your credentials and try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthValue = () => {
    if (!passwordStrength) return 0;
    return (passwordStrength.score / 5) * 100;
  };

  const getPasswordStrengthColor = () => {
    if (!passwordStrength) return "bg-muted";
    if (passwordStrength.score >= 4) return "bg-green-500";
    if (passwordStrength.score >= 3) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[480px] p-0 gap-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl font-display font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            Welcome to CareerQuest
          </DialogTitle>
          <DialogDescription>
            {activeTab === "login" 
              ? "Log in to continue your learning journey" 
              : "Create an account to start leveling up your career"}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mx-6" style={{ width: 'calc(100% - 3rem)' }}>
            <TabsTrigger value="login" data-testid="tab-login">
              Log In
            </TabsTrigger>
            <TabsTrigger value="register" data-testid="tab-register">
              Sign Up
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="px-6 pb-6">
            <TabsContent value="login" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    data-testid="input-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    data-testid="button-toggle-login-password"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full mt-6" 
                disabled={isLoading} 
                data-testid="button-submit-auth"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Log In to CareerQuest
              </Button>

              <div className="text-center text-xs text-muted-foreground pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-primary hover:underline font-medium"
                  data-testid="button-forgot-password"
                >
                  Forgot your password?
                </button>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-muted"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <a
                  href="/api/login"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  data-testid="button-google-login"
                >
                  <Chrome className="w-4 h-4" />
                  <span>Google</span>
                </a>
              </div>

              <div className="text-center text-sm text-muted-foreground pt-4">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => handleTabChange("register")}
                  className="text-primary hover:underline font-medium"
                  data-testid="button-switch-register"
                >
                  Sign up for free
                </button>
              </div>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  data-testid="input-email"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="coolcoder"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    data-testid="input-username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="John Doe"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    required
                    data-testid="input-displayName"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    type={showRegisterPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    data-testid="input-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    data-testid="button-toggle-register-password"
                  >
                    {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.password && passwordStrength && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Password strength</span>
                      <span className={
                        passwordStrength.score >= 4 ? "text-green-600 font-medium" :
                        passwordStrength.score >= 3 ? "text-yellow-600 font-medium" : 
                        "text-red-600 font-medium"
                      }>
                        {passwordStrength.feedback}
                      </span>
                    </div>
                    <Progress 
                      value={getPasswordStrengthValue()} 
                      className="h-2"
                      indicatorClassName={getPasswordStrengthColor()}
                    />
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs pt-1">
                      {[
                        { key: "minLength", label: "8+ characters" },
                        { key: "hasUppercase", label: "Uppercase" },
                        { key: "hasLowercase", label: "Lowercase" },
                        { key: "hasNumber", label: "Number" },
                        { key: "hasSpecial", label: "Special char" },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-1.5">
                          {passwordStrength.checks[key as keyof typeof passwordStrength.checks] ? (
                            <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className={
                            passwordStrength.checks[key as keyof typeof passwordStrength.checks] 
                              ? "text-green-600" 
                              : "text-muted-foreground"
                          }>
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    data-testid="input-confirm-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    data-testid="button-toggle-confirm-password"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && (
                  <div className="flex items-center gap-2 text-sm pt-1">
                    {formData.password === confirmPassword ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-600 font-medium">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-red-600 font-medium">Passwords don't match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <Label className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Learning Path Preference
                </Label>
                <RadioGroup
                  value={formData.pathSelectionMode}
                  onValueChange={(value) =>
                    setFormData({ ...formData, pathSelectionMode: value as "ai-guided" | "manual" })
                  }
                >
                  <div className="flex items-start space-x-3 rounded-lg border p-3 hover-elevate cursor-pointer transition-all">
                    <RadioGroupItem value="ai-guided" id="ai-guided" className="mt-0.5" data-testid="radio-ai-guided" />
                    <div className="flex-1">
                      <Label htmlFor="ai-guided" className="font-medium cursor-pointer flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        AI-Guided Path
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Let AI analyze your performance and recommend the perfect career path
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 rounded-lg border p-3 hover-elevate cursor-pointer transition-all">
                    <RadioGroupItem value="manual" id="manual" className="mt-0.5" data-testid="radio-manual" />
                    <div className="flex-1">
                      <Label htmlFor="manual" className="font-medium cursor-pointer flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        Choose My Own Path
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Select your career path manually based on your goals
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <Button 
                type="submit" 
                className="w-full mt-6" 
                disabled={isLoading} 
                data-testid="button-submit-auth"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Account
              </Button>

              <div className="text-center text-sm text-muted-foreground pt-4">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => handleTabChange("login")}
                  className="text-primary hover:underline font-medium"
                  data-testid="button-switch-login"
                >
                  Log in
                </button>
              </div>
            </TabsContent>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>

    <ForgotPasswordModal 
      open={showForgotPassword} 
      onClose={() => setShowForgotPassword(false)}
      onBackToLogin={() => setShowForgotPassword(false)}
    />
    </>
  );
}
