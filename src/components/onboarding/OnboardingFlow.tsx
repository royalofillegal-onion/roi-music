import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music, User, Heart, Sparkles, ArrowRight, SkipForward } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
    try {
      setIsSubmitting(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please log in to continue");
        return;
      }

      await supabase
        .from('user_onboarding')
        .upsert({
          user_id: session.user.id,
          completed: true,
          username: username || 'Music Lover',
          preferences: { genres: selectedGenres }
        });

      toast.success("Welcome to ROI MUSIC!");
      onComplete();
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please log in to continue");
        return;
      }

      if (currentStep === 1 && !username.trim()) {
        toast.error("Please enter a username");
        return;
      }

      await supabase
        .from('user_onboarding')
        .upsert({
          user_id: session.user.id,
          completed: true,
          username: username || 'Music Lover',
          preferences: { genres: selectedGenres }
        });

      // Also update the users table with the username
      await supabase
        .from('users')
        .upsert({
          user_id: session.user.id,
          name: username || 'Music Lover'
        });

      toast.success("Welcome to ROI MUSIC!");
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center space-x-4">
              <div className="flex items-center space-x-2 bg-music-accent/20 px-4 py-2 rounded-full">
                <Music className="h-5 w-5 text-music-accent" />
                <span className="text-sm font-medium">Unlimited Music</span>
              </div>
              <div className="flex items-center space-x-2 bg-music-accent/20 px-4 py-2 rounded-full">
                <Heart className="h-5 w-5 text-music-accent" />
                <span className="text-sm font-medium">Personal Playlists</span>
              </div>
            </div>
            <p className="text-gray-400">
              Discover, create, and enjoy your music journey with personalized recommendations
              and seamless playlist management across all your devices.
            </p>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="bg-gray-800 border-gray-700 mt-1"
                maxLength={30}
              />
              <p className="text-xs text-gray-400 mt-1">
                This will be your display name in the app
              </p>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              Select genres you enjoy (you can change this later)
            </p>
            <div className="grid grid-cols-3 gap-2">
              {genres.map((genre) => (
                <Badge
                  key={genre}
                  variant={selectedGenres.includes(genre) ? "default" : "outline"}
                  className={`cursor-pointer text-center py-2 px-3 transition-colors ${
                    selectedGenres.includes(genre)
                      ? 'bg-music-accent text-black hover:bg-music-accent/90'
                      : 'hover:bg-gray-700'
                  }`}
                  onClick={() => handleGenreToggle(genre)}
                >
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {steps[currentStep].icon}
          </div>
          <CardTitle className="text-xl">{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
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

          {renderStepContent()}

          {/* Action Buttons */}
          <div className="flex justify-between space-x-3">
            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="flex-1"
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Skip for now
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex-1 bg-music-accent hover:bg-music-accent/90 text-black"
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
