import React, { useState } from 'react';
import { Settings2, Radio, Zap, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { audioQualityService, AudioQuality } from '@/services/AudioQualityService';
import { crossfadeService } from '@/services/CrossfadeService';
import { AudioOutputPicker } from '@/components/AudioOutputPicker';
import { cn } from '@/lib/utils';

export function AudioSettingsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [qualityConfig, setQualityConfig] = useState(audioQualityService.getConfig());
  const [crossfadeConfig, setCrossfadeConfig] = useState(crossfadeService.getConfig());

  const handleQualityChange = (quality: AudioQuality) => {
    audioQualityService.setQuality(quality);
    setQualityConfig(audioQualityService.getConfig());
  };

  const handleDataSaverToggle = (enabled: boolean) => {
    audioQualityService.setDataSaver(enabled);
    setQualityConfig(audioQualityService.getConfig());
  };

  const handleCrossfadeToggle = (enabled: boolean) => {
    crossfadeService.setEnabled(enabled);
    setCrossfadeConfig(crossfadeService.getConfig());
  };

  const handleCrossfadeDuration = (value: number[]) => {
    crossfadeService.setDuration(value[0]);
    setCrossfadeConfig(crossfadeService.getConfig());
  };

  const qualityOptions = audioQualityService.getAllQualityOptions();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings2 className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="bottom" className="rounded-t-3xl bg-background/95 backdrop-blur-xl border-t border-border/50 max-h-[85vh] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <Settings2 className="h-5 w-5" />
            Playback Settings
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 pb-8">
          {/* Audio Output Device (wired / Bluetooth / speaker) */}
          <AudioOutputPicker />

          {/* Audio Quality */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Streaming Quality</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {qualityOptions.map(({ value, info }) => (
                <button
                  key={value}
                  className={cn(
                    "p-4 rounded-xl text-left transition-all border",
                    qualityConfig.streamingQuality === value
                      ? "bg-primary/10 border-primary"
                      : "bg-muted/50 border-transparent hover:bg-muted"
                  )}
                  onClick={() => handleQualityChange(value)}
                >
                  <p className="font-medium">{info.label}</p>
                  <p className="text-xs text-muted-foreground">{info.bitrate}</p>
                </button>
              ))}
            </div>

            {qualityConfig.streamingQuality !== 'auto' && (
              <p className="text-sm text-muted-foreground px-1">
                {audioQualityService.getQualityInfo(qualityConfig.streamingQuality).description}
              </p>
            )}
          </div>

          {/* Data Saver */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium">Data Saver</p>
                <p className="text-sm text-muted-foreground">
                  Uses less data (~96 kbps)
                </p>
              </div>
            </div>
            <Switch
              checked={qualityConfig.dataSaver}
              onCheckedChange={handleDataSaverToggle}
            />
          </div>

          {/* WiFi Only High Quality */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              <Wifi className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">WiFi-only High Quality</p>
                <p className="text-sm text-muted-foreground">
                  Use high quality only on WiFi
                </p>
              </div>
            </div>
            <Switch
              checked={qualityConfig.wifiOnlyHighQuality}
              onCheckedChange={(enabled) => {
                audioQualityService.setWifiOnlyHighQuality(enabled);
                setQualityConfig(audioQualityService.getConfig());
              }}
            />
          </div>

          {/* Crossfade */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center">
                  <span className="text-lg">↔️</span>
                </div>
                <h3 className="font-semibold">Crossfade</h3>
              </div>
              <Switch
                checked={crossfadeConfig.enabled}
                onCheckedChange={handleCrossfadeToggle}
              />
            </div>
            
            {crossfadeConfig.enabled && (
              <div className="space-y-3 pl-7">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="font-medium">{crossfadeConfig.duration}s</span>
                </div>
                <Slider
                  value={[crossfadeConfig.duration]}
                  min={0.5}
                  max={12}
                  step={0.5}
                  onValueChange={handleCrossfadeDuration}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Songs will smoothly blend into each other
                </p>
              </div>
            )}
          </div>

          {/* Data Usage Estimate */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-sm">
              <span className="font-medium">Estimated data usage:</span>{' '}
              {audioQualityService.getDataUsageEstimate(60)} per hour of streaming
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
