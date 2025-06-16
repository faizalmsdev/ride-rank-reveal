
import { Star, Users, Shield, TrendingUp } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-gray-900 via-black to-gray-900 py-20">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">Know Your </span>
            <span className="text-yellow-400">Driver</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Make informed ride decisions with community-driven driver reviews and ratings. 
            Check performance across Ola, Uber, Rapido, and Namma Yatri.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            <div className="bg-gray-800/50 p-6 rounded-lg border border-yellow-400/20">
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Real Reviews</h3>
              <p className="text-gray-400 text-sm">Authentic feedback from real passengers</p>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-lg border border-yellow-400/20">
              <Users className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Community</h3>
              <p className="text-gray-400 text-sm">Built by riders, for riders</p>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-lg border border-yellow-400/20">
              <Shield className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Safe Rides</h3>
              <p className="text-gray-400 text-sm">Make safer choices with verified data</p>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-lg border border-yellow-400/20">
              <TrendingUp className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Performance</h3>
              <p className="text-gray-400 text-sm">Track driver performance across platforms</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
