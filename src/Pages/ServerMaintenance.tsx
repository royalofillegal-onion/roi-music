
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Wrench, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { maintenanceConfig, isMaintenanceActive, getTimeUntilMaintenanceEnds } from '@/config/maintenance';

const ServerMaintenance = () => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      const active = isMaintenanceActive();
      setIsActive(active);

      if (active) {
        const msRemaining = getTimeUntilMaintenanceEnds();
        if (msRemaining > 0) {
          const hours = Math.floor(msRemaining / (1000 * 60 * 60));
          const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((msRemaining % (1000 * 60)) / 1000);
          
          setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setTimeRemaining('0:00:00');
        }
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  if (!maintenanceConfig.isEnabled && !isActive) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <RefreshCw className="h-8 w-8 text-green-400" />
            </div>
            <CardTitle className="text-white">No Maintenance Scheduled</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-400 mb-4">
              All systems are currently operational.
            </p>
            <Button onClick={() => window.location.href = '/'} className="bg-music-accent hover:bg-music-accent/90 text-black">
              Return to App
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Main Maintenance Card */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
              <Wrench className="h-10 w-10 text-orange-400" />
            </div>
            <CardTitle className="text-2xl text-white mb-2">
              {maintenanceConfig.title}
            </CardTitle>
            <div className="flex items-center justify-center gap-2 text-orange-400">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Service unavilable it will be close by ROI</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-orange-500/50 bg-orange-500/10">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              <AlertDescription className="text-orange-100">
                {maintenanceConfig.message}
              </AlertDescription>
            </Alert>

            {/* Countdown Timer */}
            {isActive && timeRemaining && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-music-accent" />
                  <span className="text-gray-400">NO MORE</span>
                </div>
                <div className="text-4xl font-mono font-bold text-music-accent">
                  {timeRemaining}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  NOTHING
                </p>
              </div>
            )}

            {/* Maintenance Schedule */}
            <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-music-accent" />
                LEAVE IT 
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Start Time:</span>
                  <span className="text-white">{formatDateTime(maintenanceConfig.startTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">End Time:</span>
                  <span className="text-white">{formatDateTime(maintenanceConfig.endTime)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={handleRefresh}
                className="flex-1 bg-music-accent hover:bg-music-accent/90 text-black"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                FIX IT 
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info Card */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="text-center text-sm text-gray-400">
              <p className="mb-2">
                lets get out.
              </p>
              <p>
                get out ppf the site now .
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServerMaintenance;
