
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit2, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProfileCustomizerProps {
  user: any;
  onUsernameUpdate?: (newUsername: string) => void;
}

const ProfileCustomizer = ({ user, onUsernameUpdate }: ProfileCustomizerProps) => {
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setUsername(data.username || "");
        setNewUsername(data.username || "");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      toast({
        title: "Error",
        description: "Username cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username: newUsername.trim() })
        .eq("id", user.id);

      if (error) throw error;

      setUsername(newUsername.trim());
      setOpen(false);
      onUsernameUpdate?.(newUsername.trim());
      toast({
        title: "Success",
        description: "Username updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating username:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update username",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="text-black hover:bg-black/10 flex items-center gap-2"
        >
          <span>{username || user?.email?.split('@')[0] || "User"}</span>
          <Edit2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-yellow-400/20">
        <DialogHeader>
          <DialogTitle className="text-yellow-400">Customize Profile</DialogTitle>
          <DialogDescription className="text-gray-400">
            Update your display name that others will see
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <Input
              id="username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter your username"
              className="bg-gray-800 border-gray-700 text-white focus:border-yellow-400"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateUsername}
              disabled={loading || !newUsername.trim()}
              className="bg-yellow-400 text-black hover:bg-yellow-500"
            >
              {loading ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileCustomizer;
