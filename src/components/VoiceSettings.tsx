
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Volume2, VolumeX, Play } from 'lucide-react';
import { VoiceGreetingService } from '@/services/VoiceGreetingService';

const VoiceSettings = () => {
  const [voicesEnabled, setVoicesEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setVoicesEnabled(VoiceGreetingService.isVoicesEnabled());
  }, []);

  const handleToggleVoices = (enabled: boolean) => {
    setVoicesEnabled(enabled);
    VoiceGreetingService.setVoicesEnabled(enabled);
  };

  const handleTestVoice = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    try {
      const message = VoiceGreetingService.getTimeBasedGreeting();
      await VoiceGreetingService.speakMessage(message);
    } catch (error) {
      console.error('Error testing voice:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {voicesEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          Voice Greetings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Daily Welcome Messages</p>
            <p className="text-xs text-gray-400">Sweet voice greetings once per day</p>
          </div>
          <Switch
            checked={voicesEnabled}
            onCheckedChange={handleToggleVoices}
          />
        </div>
        
        <Button
          onClick={handleTestVoice}
          disabled={isPlaying || !voicesEnabled}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <Play className="h-4 w-4 mr-2" />
          {isPlaying ? 'Playing...' : 'Test Voice Greeting'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default VoiceSettings;
