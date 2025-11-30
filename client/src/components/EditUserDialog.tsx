
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { User } from "@shared/schema";

interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdated: () => void;
}

export default function EditUserDialog({ open, onClose, user, onUserUpdated }: EditUserDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    isAdmin: user?.isAdmin || false,
    level: user?.level || 1,
    totalXp: user?.totalXp || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      toast({
        title: "User Updated",
        description: `Successfully updated ${user.username}`,
      });

      onUserUpdated();
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update user. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User: {user.username}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="level">Level</Label>
            <Input
              id="level"
              type="number"
              min="1"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
              required
            />
          </div>

          <div>
            <Label htmlFor="totalXp">Total XP</Label>
            <Input
              id="totalXp"
              type="number"
              min="0"
              value={formData.totalXp}
              onChange={(e) => setFormData({ ...formData, totalXp: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isAdmin">Admin Status</Label>
            <Switch
              id="isAdmin"
              checked={formData.isAdmin}
              onCheckedChange={(checked) => setFormData({ ...formData, isAdmin: checked })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
