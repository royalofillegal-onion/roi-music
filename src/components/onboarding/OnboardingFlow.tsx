import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music, User, Heart, Sparkles, ArrowRight, SkipForward } from 'lucide-react';
import { toast } from 'sonner';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [username, setUsername] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const genres = [
    'Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Classical', 'Jazz',
    'Country', 'R&B', 'Folk', 'Reggae', 'Blues', 'Indie'
  ];

  const steps = [
    {
      title: "Welcome to ROI MUSIC!",
      description: "Let's personalize your music experience",
      icon: <Sparkles className="h-8 w-8 text-music-accent" />
    },
    {
      title: "What should we call you?",
      description: "Choose a username that represents you",
      icon: <User className="h-8 w-8 text-music-accent" />
    },
    {
      title: "What's your vibe?",
      description: "Select your favorite music genres",
      icon: <Music className="h-8 w-8 text-music-accent" />
    }
  ];

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleSkip = async () => {
    toast.success("Welcome to ROI MUSIC!");
    onComplete();
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!username.trim() && currentStep === 1) {
      toast.error("Please enter a username");
      return;
    }

    toast.success("Welcome to ROI MUSIC!");
    onComplete();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <Music className="h-24 w-24 text-music-accent animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-white">Discover Your Sound</h3>
              <p className="text-gray-400">
                Stream unlimited music, create playlists, and connect with your favorite artists
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="flex flex-col items-center">
                <Heart className="h-8 w-8 text-music-accent mb-2" />
                <span className="text-sm text-gray-400">Unlimited Likes</span>
              </div>
              <div className="flex flex-col items-center">
                <Music className="h-8 w-8 text-music-accent mb-2" />
                <span className="text-sm text-gray-400">Custom Playlists</span>
              </div>
              <div className="flex flex-col items-center">
                <Sparkles className="h-8 w-8 text-music-accent mb-2" />
                <span className="text-sm text-gray-400">Personalized</span>
              </div>
            </div>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-white">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="mt-2 bg-gray-800 border-gray-700 text-white"
                maxLength={20}
              />
              <p className="text-xs text-gray-500 mt-1">
                You can always change this later in settings
              </p>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              Select at least 3 genres to get personalized recommendations
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {genres.map((genre) => (
                <Badge
                  key={genre}
                  variant={selectedGenres.includes(genre) ? "default" : "outline"}
                  className={`
                    cursor-pointer py-2 px-4 text-center justify-center transition-all
                    ${selectedGenres.includes(genre) 
                      ? 'bg-music-accent text-black hover:bg-music-accent/90' 
                      : 'border-gray-600 text-gray-400 hover:border-music-accent hover:text-music-accent'
                    }
                  `}
                  onClick={() => handleGenreToggle(genre)}
                >
                  {genre}
                </Badge>
              ))}
            </div>
            {selectedGenres.length > 0 && (
              <p className="text-xs text-gray-500">
                {selectedGenres.length} genre{selectedGenres.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {steps[currentStep].icon}
          </div>
          <CardTitle className="text-2xl text-white">{steps[currentStep].title}</CardTitle>
          <CardDescription className="text-gray-400">
            {steps[currentStep].description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex justify-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-music-accent' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>

          {/* Step Content */}
          {renderStepContent()}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="flex-1 text-gray-300 border-gray-600 hover:bg-gray-800"
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Skip
            </Button>
            <Button
              onClick={handleNext}
              disabled={isSubmitting || (currentStep === 1 && !username.trim())}
              className="flex-1 bg-music-accent hover:bg-music-accent/90 text-black font-medium"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingFlow;
