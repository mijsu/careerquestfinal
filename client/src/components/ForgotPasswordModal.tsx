import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

export default function ForgotPasswordModal({ open, onClose, onBackToLogin }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiRequest("POST", "/api/auth/forgot-password", { email });
      setSubmitted(true);
      toast({
        title: "Email sent!",
        description: "Check your email for a password reset link",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send reset email",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setSubmitted(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] p-6">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                handleClose();
                onBackToLogin();
              }}
              className="p-1 hover:bg-muted rounded"
              data-testid="button-back-to-login"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <DialogTitle className="text-2xl font-display font-bold">Reset Password</DialogTitle>
              <DialogDescription>
                Enter your email to receive a password reset link
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {submitted ? (
          <div className="space-y-4 text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto text-green-600" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Check your email</h3>
              <p className="text-muted-foreground text-sm">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                The link will expire in 1 hour
              </p>
            </div>
            <Button onClick={handleClose} variant="outline" className="w-full">
              Back to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-reset-email"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email}
              data-testid="button-send-reset"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send Reset Link
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
