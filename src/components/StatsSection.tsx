
import { useEffect, useState } from "react";
import { Car, Users, Star, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const StatsSection = () => {
  const [stats, setStats] = useState({
    totalDrivers: 0,
    totalReviews: 0,
    totalUsers: 0,
    averageRating: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total drivers
        const { count: driversCount } = await supabase
          .from("drivers")
          .select("*", { count: "exact", head: true });

        // Get total reviews
        const { count: reviewsCount } = await supabase
          .from("reviews")
          .select("*", { count: "exact", head: true });

        // Get total users
        const { count: usersCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // Get average rating
        const { data: avgData } = await supabase
          .from("drivers")
          .select("average_rating");

        const avgRating = avgData?.length 
          ? avgData.reduce((sum, driver) => sum + (driver.average_rating || 0), 0) / avgData.length
          : 0;

        setStats({
          totalDrivers: driversCount || 0,
          totalReviews: reviewsCount || 0,
          totalUsers: usersCount || 0,
          averageRating: avgRating,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-4">Platform Statistics</h3>
          <p className="text-gray-400">Real numbers from our growing community</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="bg-gray-900 p-6 rounded-lg border border-yellow-400/20 text-center">
            <Car className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">{stats.totalDrivers}</div>
            <div className="text-gray-400 text-sm">Drivers Tracked</div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-yellow-400/20 text-center">
            <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">{stats.totalReviews}</div>
            <div className="text-gray-400 text-sm">Reviews Posted</div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-yellow-400/20 text-center">
            <Users className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">{stats.totalUsers}</div>
            <div className="text-gray-400 text-sm">Community Members</div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-yellow-400/20 text-center">
            <Award className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">{stats.averageRating.toFixed(1)}</div>
            <div className="text-gray-400 text-sm">Avg. Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
