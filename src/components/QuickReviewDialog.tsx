
import { useState } from "react";
import { Star, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type PlatformType = Database["public"]["Enums"]["platform_type"];

interface QuickReviewDialogProps {
  vehicleNumber: string;
  platform?: string;
}

const QuickReviewDialog = ({ vehicleNumber, platform }: QuickReviewDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [rideDate, setRideDate] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState(platform || "");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add a review.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPlatform) {
      toast({
        title: "Platform required",
        description: "Please select a platform.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // First, check if driver exists for this vehicle and platform
      let { data: existingDriver, error: searchError } = await supabase
        .from("drivers")
        .select("id")
        .eq("vehicle_number", vehicleNumber.toUpperCase())
        .eq("platform", selectedPlatform as PlatformType)
        .single();

      let driverId;

      if (searchError && searchError.code === "PGRST116") {
        // Driver doesn't exist, create a basic entry
        const { data: newDriver, error: createError } = await supabase
          .from("drivers")
          .insert({
            vehicle_number: vehicleNumber.toUpperCase(),
            platform: selectedPlatform as PlatformType,
            contributed_by: session.user.id,
          })
          .select()
          .single();

        if (createError) throw createError;
        driverId = newDriver.id;
      } else if (searchError) {
        throw searchError;
      } else {
        driverId = existingDriver.id;
      }

      // Add the review
      const { error: reviewError } = await supabase
        .from("reviews")
        .insert({
          driver_id: driverId,
          reviewer_id: session.user.id,
          rating,
          review_text: reviewText || null,
          ride_date: rideDate || null,
        });

      if (reviewError) {
        if (reviewError.code === "23505") {
          toast({
            title: "Review already exists",
            description: "You have already reviewed this driver.",
            variant: "destructive",
          });
        } else {
          throw reviewError;
        }
        return;
      }

      toast({
        title: "Review added successfully!",
        description: "Thank you for helping the community.",
      });

      setOpen(false);
      setRating(0);
      setReviewText("");
      setRideDate("");

      // Refresh the page to show the new review
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error adding review",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStarRating = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <button
        key={index}
        type="button"
        onClick={() => setRating(index + 1)}
        className="focus:outline-none"
      >
        <Star
          className={`w-8 h-8 transition-colors ${
            index < rating
              ? "text-yellow-400 fill-current"
              : "text-gray-600 hover:text-yellow-400"
          }`}
        />
      </button>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black">
          <Plus className="w-4 h-4 mr-2" />
          Quick Review
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-gray-900 border-yellow-400/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-yellow-400">Share Your Experience</DialogTitle>
          <DialogDescription className="text-gray-400">
            Rate and review this driver based on your ride experience. We'll create a basic driver profile if needed.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Vehicle Number</Label>
            <Input
              value={vehicleNumber}
              disabled
              className="bg-gray-800 border-gray-700 text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform">Platform *</Label>
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform} required>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="ola">Ola</SelectItem>
                <SelectItem value="uber">Uber</SelectItem>
                <SelectItem value="rapido">Rapido</SelectItem>
                <SelectItem value="namma_yatri">Namma Yatri</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex gap-1">
              {renderStarRating()}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-400">
                {rating} star{rating !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reviewText">Review (Optional)</Label>
            <Textarea
              id="reviewText"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this driver..."
              className="bg-gray-800 border-gray-700 text-white resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rideDate">Ride Date (Optional)</Label>
            <input
              id="rideDate"
              type="date"
              value={rideDate}
              onChange={(e) => setRideDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading || rating === 0 || !selectedPlatform}
            className="w-full bg-yellow-400 text-black hover:bg-yellow-500 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickReviewDialog;
