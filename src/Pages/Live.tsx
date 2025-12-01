import React from "react";
import { Card } from "@/components/ui/card";
import { Radio, AlertCircle } from "lucide-react";

const Live = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:ml-64">
      <Card className="max-w-2xl w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center">
            <Radio className="w-10 h-10 text-accent" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-foreground">
          Live Streaming Feature
        </h1>
        
        <div className="flex items-center justify-center gap-2 mb-4 text-muted-foreground">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">Database tables required</p>
        </div>
        
        <p className="text-muted-foreground mb-6">
          This feature requires the following database tables to be created:
        </p>
        
        <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2 mb-6">
          <code className="text-sm block">• lives</code>
          <code className="text-sm block">• live_comments</code>
          <code className="text-sm block">• live_likes</code>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Contact your administrator to set up the live streaming feature.
        </p>
      </Card>
    </div>
  );
};

export default Live;
