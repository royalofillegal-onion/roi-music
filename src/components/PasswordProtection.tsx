
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface PasswordProtectionProps {
  children: React.ReactNode;
  requiredPassword: string;
  title?: string;
  description?: string;
}

const PasswordProtection = ({ 
  children, 
  requiredPassword, 
  title = "Access Required",
  description = "Please enter the password to access this page"
}: PasswordProtectionProps) => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if already authenticated (stored in sessionStorage)
  useEffect(() => {
    const stored = sessionStorage.getItem('artists_page_authenticated');
    if (stored === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate a small delay for better UX
    setTimeout(() => {
      if (password === requiredPassword) {
        setIsAuthenticated(true);
        sessionStorage.setItem('artists_page_authenticated', 'true');
        toast.success("Access granted!");
      } else {
        toast.error("Incorrect password. Please try again.");
        setPassword("");
      }
      setLoading(false);
    }, 500);
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-900">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-music-accent/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-music-accent" />
          </div>
          <CardTitle className="text-xl font-bold text-white">{title}</CardTitle>
          <p className="text-gray-400 text-sm">{description}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white pr-10"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button
              type="submit"
              className="w-full bg-music-accent hover:bg-music-accent/90 text-black"
              disabled={loading || !password.trim()}
            >
              {loading ? "Verifying..." : "Access Page"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordProtection;
