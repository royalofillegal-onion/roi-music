import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Settings, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface QuickActionsToggleProps {
  showQuickActions: boolean;
  onToggle: (enabled: boolean) => void;
}

const QuickActionsToggle: React.FC<QuickActionsToggleProps> = ({ 
  showQuickActions, 
  onToggle 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white p-2"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 bg-gray-900 border-gray-700" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white">Quick Actions</h4>
            <p className="text-xs text-gray-400">
              Toggle visibility of quick action buttons in the floating player
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {showQuickActions ? (
                <Eye className="h-4 w-4 text-green-400" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-sm text-white">
                {showQuickActions ? 'Visible' : 'Hidden'}
              </span>
            </div>
            <Switch
              checked={showQuickActions}
              onCheckedChange={onToggle}
            />
          </div>
          
          <div className="text-xs text-gray-500">
            When enabled, shows like, share, and queue buttons in the floating music player.
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default QuickActionsToggle;