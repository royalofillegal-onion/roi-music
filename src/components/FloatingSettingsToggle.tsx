import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface FloatingSettingsToggleProps {
  onToggle: () => void;
}

const FloatingSettingsToggle: React.FC<FloatingSettingsToggleProps> = ({ onToggle }) => {
  const isMobile = useIsMobile();

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`fixed ${isMobile ? 'bottom-36 left-4' : 'bottom-20 left-4'} z-40`}
    >
      <Button
        onClick={onToggle}
        size="lg"
        className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Settings className="h-6 w-6" />
      </Button>
    </motion.div>
  );
};

export default FloatingSettingsToggle;