import React from "react";
import { Radio } from "lucide-react";

const Live = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 pt-20 pb-32 md:pl-24">
      <div className="text-center max-w-md">
        <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-2xl mb-6 animate-pulse">
          <Radio className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
          Work in Progress
        </h1>
        <p className="text-muted-foreground text-base">
          The Live experience is coming soon. Stay tuned for something amazing.
        </p>
      </div>
    </div>
  );
};

export default Live;
