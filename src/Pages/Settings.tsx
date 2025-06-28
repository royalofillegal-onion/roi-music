
import React from "react";
import { Settings as SettingsIcon, FileText, Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8 md:ml-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-music-accent" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="space-y-6">
          {/* Browse Artists */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                Browse Artists
              </CardTitle>
              <CardDescription>
                Explore artists and discover new music
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/artists')}
                variant="outline"
                className="w-full justify-start border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white"
              >
                <Users className="h-4 w-4 mr-2" />
                View All Artists
              </Button>
            </CardContent>
          </Card>

          {/* Terms & Conditions */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-400" />
                Legal Information
              </CardTitle>
              <CardDescription>
                Terms of service and platform policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/terms')}
                variant="outline"
                className="w-full justify-start border-green-500 text-green-400 hover:bg-green-600 hover:text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                Terms & Conditions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
