
import { useEffect, useState } from "react";
import { Trophy, Star, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const LeaderboardSection = () => {
  const [topContributors, setTopContributors] = useState<any[]>([]);
  const [topDrivers, setTopDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        // Get top contributors (users who added most drivers)
        const { data: contributorsData } = await supabase
          .from("profiles")
          .select(`
            id,
            username,
            email,
            contribution_score,
            drivers!drivers_contributed_by_fkey (id)
          `)
          .order("contribution_score", { ascending: false })
          .limit(5);

        // Calculate contribution scores based on drivers added
        const contributors = contributorsData?.map(user => ({
          ...user,
          driversAdded: user.drivers?.length || 0
        })) || [];

        // Get top rated drivers
        const { data: driversData } = await supabase
          .from("drivers")
          .select(`
            vehicle_number,
            platform,
            driver_name,
            average_rating,
            total_rides,
            reviews (id)
          `)
          .gt("average_rating", 0)
          .order("average_rating", { ascending: false })
          .limit(5);

        setTopContributors(contributors);
        setTopDrivers(driversData || []);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  const formatPlatformName = (platform: string) => {
    const names = {
      ola: "Ola",
      uber: "Uber",
      rapido: "Rapido",
      namma_yatri: "Namma Yatri",
    };
    return names[platform as keyof typeof names] || platform;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-3 h-3 ${
          index < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-600"
        }`}
      />
    ));
  };

  const handleProfileClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse text-white">Loading leaderboard...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-4">Community Leaderboard</h3>
          <p className="text-gray-400">Celebrating our top contributors and highest-rated drivers</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Top Contributors */}
          <Card className="bg-gray-800 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topContributors.length > 0 ? (
                <div className="space-y-3">
                  {topContributors.map((contributor, index) => (
                    <div
                      key={contributor.id}
                      className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? "bg-yellow-400 text-black" :
                          index === 1 ? "bg-gray-400 text-black" :
                          index === 2 ? "bg-orange-400 text-black" :
                          "bg-gray-600 text-white"
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <Button
                            variant="ghost"
                            className="text-white font-medium hover:text-yellow-400 p-0 h-auto"
                            onClick={() => handleProfileClick(contributor.id)}
                          >
                            {contributor.username || contributor.email?.split('@')[0] || "Anonymous"}
                          </Button>
                          <div className="text-gray-400 text-sm">
                            {contributor.driversAdded} drivers added
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                        {contributor.contribution_score || contributor.driversAdded} points
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  No contributors yet. Be the first to add driver information!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Rated Drivers */}
          <Card className="bg-gray-800 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Top Rated Drivers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topDrivers.length > 0 ? (
                <div className="space-y-3">
                  {topDrivers.map((driver, index) => (
                    <div
                      key={driver.vehicle_number}
                      className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? "bg-yellow-400 text-black" :
                          index === 1 ? "bg-gray-400 text-black" :
                          index === 2 ? "bg-orange-400 text-black" :
                          "bg-gray-600 text-white"
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {driver.vehicle_number}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {formatPlatformName(driver.platform)} • {driver.reviews?.length || 0} reviews
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          {renderStars(driver.average_rating)}
                        </div>
                        <div className="text-yellow-400 font-bold">
                          {driver.average_rating.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  No rated drivers yet. Start reviewing drivers to see top performers!
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default LeaderboardSection;
