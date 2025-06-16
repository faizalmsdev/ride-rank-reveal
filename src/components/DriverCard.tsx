
import { Star, MapPin, Phone, Calendar, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import AddReviewDialog from "./AddReviewDialog";

interface DriverCardProps {
  driver: any;
}

const DriverCard = ({ driver }: DriverCardProps) => {
  const [showReviews, setShowReviews] = useState(false);

  const platformColors = {
    ola: "bg-green-500",
    uber: "bg-black",
    rapido: "bg-yellow-500",
    namma_yatri: "bg-purple-500",
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-600"
        }`}
      />
    ));
  };

  return (
    <Card className="bg-gray-800 border-yellow-400/20">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-yellow-400 text-xl">
              {driver.vehicle_number}
            </CardTitle>
            <Badge 
              className={`${platformColors[driver.platform as keyof typeof platformColors]} text-white mt-2`}
            >
              {formatPlatformName(driver.platform)}
            </Badge>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 mb-1">
              {renderStars(driver.average_rating)}
            </div>
            <span className="text-yellow-400 font-bold text-lg">
              {driver.average_rating.toFixed(1)}
            </span>
            <span className="text-gray-400 text-sm ml-1">
              ({driver.reviews?.length || 0} reviews)
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Driver Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {driver.driver_name && (
            <div className="flex items-center gap-2 text-gray-300">
              <Award className="w-4 h-4 text-yellow-400" />
              <span>Driver: {driver.driver_name}</span>
            </div>
          )}
          
          {driver.phone_number && (
            <div className="flex items-center gap-2 text-gray-300">
              <Phone className="w-4 h-4 text-yellow-400" />
              <span>{driver.phone_number}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin className="w-4 h-4 text-yellow-400" />
            <span>{driver.total_rides || 0} Total Rides</span>
          </div>
          
          {driver.is_multiple_platform && (
            <div className="flex items-center gap-2 text-green-400">
              <Award className="w-4 h-4" />
              <span>Multi-Platform Driver</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <AddReviewDialog driverId={driver.id} />
          
          {driver.reviews && driver.reviews.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowReviews(!showReviews)}
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
            >
              {showReviews ? "Hide" : "View"} Reviews ({driver.reviews.length})
            </Button>
          )}
        </div>

        {/* Reviews Section */}
        {showReviews && driver.reviews && driver.reviews.length > 0 && (
          <div className="mt-6 space-y-3 border-t border-gray-700 pt-4">
            <h5 className="font-semibold text-white">Recent Reviews</h5>
            {driver.reviews.slice(0, 3).map((review: any) => (
              <div key={review.id} className="bg-gray-700 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    {renderStars(review.rating)}
                  </div>
                  {review.ride_date && (
                    <span className="text-gray-400 text-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(review.ride_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {review.review_text && (
                  <p className="text-gray-300 text-sm">{review.review_text}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Contributor Info */}
        {driver.profiles && (
          <div className="text-xs text-gray-500 border-t border-gray-700 pt-2">
            Added by: {driver.profiles.username || "Anonymous"}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DriverCard;
