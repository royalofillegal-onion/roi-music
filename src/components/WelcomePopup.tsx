
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Music, Heart, Headphones, Play, SkipForward, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface WelcomePopupProps {
  onClose: () => void;
}

const WelcomePopup = ({ open, onClose }: WelcomePopupProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to ROI MUSIC!",
      description: "Your ultimate music streaming experience",
      icon: <Music className="h-12 w-12 text-music-accent" />,
      features: [
        { icon: <Heart className="h-5 w-5" />, text: "Unlimited music streaming" },
        { icon: <Headphones className="h-5 w-5" />, text: "High-quality audio" },
        { icon: <Play className="h-5 w-5" />, text: "Create personal playlists" }
      ]
    },
    {
      title: "Ready to Start?",
      description: "Discover thousands of songs and create your perfect playlist",
      icon: <Play className="h-12 w-12 text-music-accent" />,
      features: [
        { icon: <Music className="h-5 w-5" />, text: "Browse trending music" },
        { icon: <Heart className="h-5 w-5" />, text: "Like your favorites" },
        { icon: <Headphones className="h-5 w-5" />, text: "Enjoy seamless playback" }
      ]
    }
  ];

  const handleSkip = () => {
    toast.success("Welcome to ROI MUSIC! 🎵");
    onClose();
  };

  const handleContinue = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.success("Let's start your music journey! 🎶");
      onClose();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            {steps[currentStep].icon}
          </div>
          <DialogTitle className="text-2xl font-bold text-white">
            {steps[currentStep].title}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {steps[currentStep].description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex justify-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-music-accent' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          {/* Features */}
          <div className="space-y-3">
            {steps[currentStep].features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3 text-gray-300">
                <div className="text-music-accent">
                  {feature.icon}
                </div>
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1 text-gray-300 border-gray-600 hover:bg-gray-800"
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Skip
            </Button>
            
            <Button
              onClick={handleContinue}
              className="flex-1 bg-music-accent hover:bg-music-accent/90 text-black font-medium"
            >
              {currentStep === steps.length - 1 ? 'Start Listening' : 'Continue'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomePopup;
