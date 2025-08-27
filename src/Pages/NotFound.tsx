import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, Music, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        {/* ROI MUSIC Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-20 h-20 bg-music-accent rounded-xl flex items-center justify-center shadow-2xl">
            <span className="text-black font-bold text-2xl">ROI</span>
          </div>
          <div className="ml-4">
            <h2 className="text-3xl font-bold text-white">ROI MUSIC</h2>
            <p className="text-music-accent text-sm">Royal of Illegal</p>
          </div>
        </div>

        {/* 404 Content */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
          <div className="mb-6">
            <h1 className="text-8xl font-bold text-music-accent mb-2">404</h1>
            <h3 className="text-2xl font-semibold text-white mb-3">Page Not Found</h3>
            <p className="text-gray-400 mb-6">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link to="/">
              <Button className="w-full bg-music-accent hover:bg-music-accent/90 text-black font-medium">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            
            <Link to="/search">
              <Button variant="outline" className="w-full border-music-accent/50 text-music-accent hover:bg-music-accent/10">
                <Search className="h-4 w-4 mr-2" />
                Search Music
              </Button>
            </Link>
            
            <Button 
              variant="ghost" 
              className="w-full text-gray-400 hover:text-white"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
            <Music className="h-4 w-4" />
            <span>Discover endless music with ROI MUSIC</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
