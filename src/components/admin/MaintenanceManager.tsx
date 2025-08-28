
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Wrench, Save, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { maintenanceConfig, isMaintenanceActive } from '@/config/maintenance';

const MaintenanceManager = () => {
  const [config, setConfig] = useState(maintenanceConfig);
  const [isActive] = useState(isMaintenanceActive());

  const handleSave = () => {
    // In a real app, this would save to a database or config file
    // For now, we'll just show a toast
    toast.success('Maintenance configuration saved successfully');
    console.log('Maintenance config updated:', config);
  };

  const formatDateTimeLocal = (isoString: string) => {
    const date = new Date(isoString);
    return date.toISOString().slice(0, 16);
  };

  const handleDateTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    const isoString = new Date(value).toISOString();
    setConfig(prev => ({
      ...prev,
      [field]: isoString
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Wrench className="h-6 w-6 text-music-accent" />
          Maintenance Manager
        </h2>
        <Badge variant={isActive ? "destructive" : "outline"} className="text-sm">
          {isActive ? "Maintenance Active" : "System Online"}
        </Badge>
      </div>

      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-music-accent" />
            Maintenance Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div>
              <Label htmlFor="maintenance-enabled" className="text-white font-medium">
                Enable Maintenance Mode
              </Label>
              <p className="text-sm text-gray-400 mt-1">
                Toggle to activate or deactivate maintenance mode
              </p>
            </div>
            <Switch
              id="maintenance-enabled"
              checked={config.isEnabled}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, isEnabled: checked }))}
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">Maintenance Title</Label>
            <Input
              id="title"
              value={config.title}
              onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Enter maintenance title"
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-white">Maintenance Message</Label>
            <Textarea
              id="message"
              value={config.message}
              onChange={(e) => setConfig(prev => ({ ...prev, message: e.target.value }))}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Enter maintenance message for users"
              rows={4}
            />
          </div>

          {/* Start Time */}
          <div className="space-y-2">
            <Label htmlFor="startTime" className="text-white">Start Time</Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={formatDateTimeLocal(config.startTime)}
              onChange={(e) => handleDateTimeChange('startTime', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* End Time */}
          <div className="space-y-2">
            <Label htmlFor="endTime" className="text-white">End Time</Label>
            <Input
              id="endTime"
              type="datetime-local"
              value={formatDateTimeLocal(config.endTime)}
              onChange={(e) => handleDateTimeChange('endTime', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Current Status */}
          {config.isEnabled && (
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-orange-400 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Current Status</span>
              </div>
              <p className="text-sm text-orange-100">
                {isActive 
                  ? "Maintenance mode is currently ACTIVE. Users will see the maintenance page."
                  : "Maintenance mode is scheduled but not currently active."
                }
              </p>
            </div>
          )}

          {/* Save Button */}
          <Button 
            onClick={handleSave}
            className="w-full bg-music-accent hover:bg-music-accent/90 text-black"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceManager;
