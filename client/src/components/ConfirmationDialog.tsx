import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  icon?: ReactNode;
  variant?: "destructive" | "default";
  isLoading?: boolean;
}

export default function ConfirmationDialog({ 
  open, 
  onOpenChange, 
  onConfirm,
  title,
  description,
  confirmText = "Continue",
  cancelText = "Cancel",
  icon,
  variant = "destructive",
  isLoading = false
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-testid="dialog-confirmation">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              variant === "destructive" 
                ? "bg-destructive/10" 
                : "bg-primary/10"
            }`}>
              {icon || <AlertTriangle className={`w-6 h-6 ${
                variant === "destructive" 
                  ? "text-destructive" 
                  : "text-primary"
              }`} />}
            </div>
            <AlertDialogTitle className="text-xl">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            disabled={isLoading}
            data-testid="button-cancel-confirmation"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={isLoading}
            className={variant === "destructive" 
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" 
              : ""
            }
            data-testid="button-confirm-action"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
