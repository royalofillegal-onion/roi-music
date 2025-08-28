
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/context/AdminContext";
import { Lock } from "lucide-react";

const AdminLogin = () => {
  const [password, setPassword] = useState("");
  const { login } = useAdmin();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(password);
    if (success) {
      navigate("/admin");
    }
  };

  return (
    <div className="container mx-auto max-w-md p-6 pt-16">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <div className="h-16 w-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-music-accent" />
          </div>
          <h1 className="text-2xl font-bold text-center">Admin Access</h1>
          <p className="text-gray-400 text-center mt-2">Enter admin password to continue</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-700 border-gray-600"
              autoFocus
            />
          </div>
          
          <div className="flex justify-between items-center">
            <Button 
              type="button" 
              variant="ghost"
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
            <Button type="submit">
              Login
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
