
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import SearchSection from "@/components/SearchSection";
import LeaderboardSection from "@/components/LeaderboardSection";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Toaster />
      
      {/* Header */}
      <header className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-black p-2 rounded-lg">
              <span className="text-yellow-400 text-2xl font-bold">🚗</span>
            </div>
            <h1 className="text-3xl font-bold">RideRank Reveal</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-black font-medium">Welcome, {user.email}</span>
                <Button 
                  onClick={handleSignOut}
                  variant="outline"
                  className="border-black text-black hover:bg-black hover:text-yellow-400"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => navigate("/auth")}
                className="bg-black text-yellow-400 hover:bg-gray-900"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <main>
        <HeroSection />
        <SearchSection />
        <StatsSection />
        <LeaderboardSection />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 RideRank Reveal. Empowering smart ride choices.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
