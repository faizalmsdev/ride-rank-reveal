
import { useState } from "react";
import { Search, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import DriverCard from "./DriverCard";
import AddDriverDialog from "./AddDriverDialog";
import type { Database } from "@/integrations/supabase/types";

type PlatformType = Database["public"]["Enums"]["platform_type"];

const SearchSection = () => {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | "">("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!vehicleNumber.trim()) {
      toast({
        title: "Enter vehicle number",
        description: "Please enter a vehicle number to search.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      let query = supabase
        .from("drivers")
        .select(`
          *,
          reviews (*),
          profiles!drivers_contributed_by_fkey (username)
        `)
        .eq("vehicle_number", vehicleNumber.toUpperCase());

      if (selectedPlatform) {
        query = query.eq("platform", selectedPlatform);
      }

      const { data, error } = await query;

      if (error) throw error;

      setSearchResults(data || []);
      
      if (!data || data.length === 0) {
        toast({
          title: "No results found",
          description: "No driver data found for this vehicle number.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Search error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Search Driver Information</h3>
            <p className="text-gray-400">Enter vehicle number to check driver reviews and ratings</p>
          </div>

          <Card className="bg-gray-800 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <Search className="w-5 h-5" />
                Driver Lookup
              </CardTitle>
              <CardDescription className="text-gray-400">
                Search by vehicle number across all platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Enter vehicle number (e.g., KA01AB1234)"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="md:w-48">
                  <Select value={selectedPlatform} onValueChange={(value) => setSelectedPlatform(value as PlatformType | "")}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="All Platforms" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="ola">Ola</SelectItem>
                      <SelectItem value="uber">Uber</SelectItem>
                      <SelectItem value="rapido">Rapido</SelectItem>
                      <SelectItem value="namma_yatri">Namma Yatri</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-yellow-400 text-black hover:bg-yellow-500"
                >
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searched && (
            <div className="mt-8">
              {searchResults.length > 0 ? (
                <div className="space-y-6">
                  <h4 className="text-xl font-semibold text-white">
                    Found {searchResults.length} result(s) for "{vehicleNumber}"
                  </h4>
                  <div className="grid gap-6">
                    {searchResults.map((driver) => (
                      <DriverCard key={driver.id} driver={driver} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Car className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-white mb-2">No Data Available</h4>
                  <p className="text-gray-400 mb-6">
                    No information found for vehicle number "{vehicleNumber}".
                    Help the community by adding this driver's information!
                  </p>
                  <AddDriverDialog 
                    initialVehicleNumber={vehicleNumber}
                    initialPlatform={selectedPlatform === "all" ? "" : selectedPlatform}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SearchSection;
