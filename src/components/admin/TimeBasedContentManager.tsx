import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Clock } from 'lucide-react';

const TimeBasedContentManager = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time-Based Content Manager
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Database Setup Required</p>
            <p className="text-xs text-muted-foreground">
              The 'time_based_content' table needs to be created to use this feature.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeBasedContentManager;
