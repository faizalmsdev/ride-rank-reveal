
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit2, Save, X, Car } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [driversAdded, setDriversAdded] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });

    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        toast({
          title: "Error",
          description: "Profile not found",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setProfile(profileData);
      setNewUsername(profileData.username || "");

      // Fetch drivers added by this user
      const { data: driversData, error: driversError } = await supabase
        .from("drivers")
        .select(`
          id,
          vehicle_number,
          platform,
          driver_name,
          average_rating,
          total_rides,
          created_at,
          reviews (id)
        `)
        .eq("contributed_by", userId);

      if (!driversError) {
        setDriversAdded(driversData || []);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
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

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username: newUsername.trim() })
        .eq("id", currentUser?.id);

      if (error) throw error;

      setProfile({ ...profile, username: newUsername.trim() });
      setIsEditing(false);
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
    }
  };

  const formatPlatformName = (platform: string) => {
    const names = {
      ola: "Ola",
      uber: "Uber",
      rapido: "Rapido",
      namma_yatri: "Namma Yatri",
    };
    return names[platform as keyof typeof names] || platform;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Profile not found</h2>
          <Button onClick={() => navigate("/")} className="bg-yellow-400 text-black">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black py-4 shadow-lg">
        <div className="container mx-auto px-4 flex items-center">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="text-black hover:bg-black/10 mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">User Profile</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Info Card */}
          <Card className="bg-gray-900 border-yellow-400/20 mb-8">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center justify-between">
                Profile Information
                {isOwnProfile && (
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="outline"
                    size="sm"
                    className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                  >
                    {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-300">Username</Label>
                {isEditing && isOwnProfile ? (
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Enter username"
                    />
                    <Button
                      onClick={handleUpdateUsername}
                      size="sm"
                      className="bg-yellow-400 text-black hover:bg-yellow-500"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-white font-medium mt-1">
                    {profile.username || "No username set"}
                  </div>
                )}
              </div>
              <div>
                <Label className="text-gray-300">Email</Label>
                <div className="text-white mt-1">{profile.email}</div>
              </div>
              <div>
                <Label className="text-gray-300">Contribution Score</Label>
                <div className="text-yellow-400 font-bold mt-1">
                  {profile.contribution_score || driversAdded.length} points
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Member Since</Label>
                <div className="text-white mt-1">
                  {new Date(profile.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Drivers Added */}
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <Car className="w-5 h-5" />
                Drivers Added ({driversAdded.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {driversAdded.length > 0 ? (
                <div className="grid gap-4">
                  {driversAdded.map((driver) => (
                    <div
                      key={driver.id}
                      className="bg-gray-800 p-4 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <div className="text-white font-medium">
                          {driver.vehicle_number}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {formatPlatformName(driver.platform)} • 
                          {driver.driver_name && ` ${driver.driver_name} • `}
                          {driver.reviews?.length || 0} reviews
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                          {driver.average_rating ? `${driver.average_rating.toFixed(1)} ⭐` : "No rating"}
                        </Badge>
                        <div className="text-gray-400 text-xs mt-1">
                          Added {new Date(driver.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  {isOwnProfile 
                    ? "You haven't added any drivers yet. Start contributing to the community!"
                    : "This user hasn't added any drivers yet."
                  }
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
