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
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      drag
      dragMomentum={false}
      dragElastic={0.1}
      className={`fixed ${isMobile ? 'bottom-36 left-4' : 'bottom-20 left-4'} z-40 cursor-grab active:cursor-grabbing`}
    >
      <Button
        onClick={onToggle}
        size="lg"
        className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-secondary hover:from-primary-glow hover:to-secondary-glow text-primary-foreground shadow-cyber hover:shadow-neon-cyan transition-all duration-300 animate-neon-glow"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <Settings className="h-6 w-6" />
        </motion.div>
      </Button>
    </motion.div>
  );
};

export default FloatingSettingsToggle;
