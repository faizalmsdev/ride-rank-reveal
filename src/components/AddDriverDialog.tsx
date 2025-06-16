
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface AddDriverDialogProps {
  initialVehicleNumber?: string;
  initialPlatform?: string;
}

const AddDriverDialog = ({ initialVehicleNumber = "", initialPlatform = "" }: AddDriverDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicleNumber: initialVehicleNumber,
    platform: initialPlatform,
    driverName: "",
    phoneNumber: "",
    totalRides: "",
    isMultiplePlatform: false,
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add driver information.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!formData.vehicleNumber || !formData.platform) {
      toast({
        title: "Missing information",
        description: "Vehicle number and platform are required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("drivers")
        .insert({
          vehicle_number: formData.vehicleNumber.toUpperCase(),
          platform: formData.platform,
          driver_name: formData.driverName || null,
          phone_number: formData.phoneNumber || null,
          total_rides: formData.totalRides ? parseInt(formData.totalRides) : 0,
          is_multiple_platform: formData.isMultiplePlatform,
          contributed_by: session.user.id,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Driver already exists",
            description: "This vehicle number already exists for the selected platform.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Driver added successfully!",
        description: "Thank you for contributing to the community.",
      });

      setOpen(false);
      setFormData({
        vehicleNumber: "",
        platform: "",
        driverName: "",
        phoneNumber: "",
        totalRides: "",
        isMultiplePlatform: false,
      });

      // Refresh the page to show the new driver
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error adding driver",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-yellow-400 text-black hover:bg-yellow-500">
          <Plus className="w-4 h-4 mr-2" />
          Add Driver Info
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-gray-900 border-yellow-400/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-yellow-400">Add Driver Information</DialogTitle>
          <DialogDescription className="text-gray-400">
            Help the community by adding driver details and reviews.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
            <Input
              id="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
              placeholder="KA01AB1234"
              required
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform">Platform *</Label>
            <Select 
              value={formData.platform} 
              onValueChange={(value) => setFormData({ ...formData, platform: value })}
              required
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="ola">Ola</SelectItem>
                <SelectItem value="uber">Uber</SelectItem>
                <SelectItem value="rapido">Rapido</SelectItem>
                <SelectItem value="namma_yatri">Namma Yatri</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="driverName">Driver Name</Label>
            <Input
              id="driverName"
              value={formData.driverName}
              onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
              placeholder="Driver's name (optional)"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="Phone number (optional)"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalRides">Total Rides</Label>
            <Input
              id="totalRides"
              type="number"
              value={formData.totalRides}
              onChange={(e) => setFormData({ ...formData, totalRides: e.target.value })}
              placeholder="Number of rides (optional)"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="multiplePlatform"
              checked={formData.isMultiplePlatform}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, isMultiplePlatform: checked as boolean })
              }
            />
            <Label htmlFor="multiplePlatform" className="text-sm">
              Driver works on multiple platforms
            </Label>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
          >
            {loading ? "Adding..." : "Add Driver"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDriverDialog;
