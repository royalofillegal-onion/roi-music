
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingStatus {
  completed: boolean;
  username: string | null;
  preferences: any;
}

export const useOnboarding = () => {
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setOnboardingStatus(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_onboarding')
        .select('completed, username, preferences')
        .eq('user_id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking onboarding status:', error);
        setOnboardingStatus({ completed: false, username: null, preferences: {} });
      } else {
        setOnboardingStatus(data || { completed: false, username: null, preferences: {} });
      }
    } catch (error) {
      console.error('Error in checkOnboardingStatus:', error);
      setOnboardingStatus({ completed: false, username: null, preferences: {} });
    } finally {
      setLoading(false);
    }
  };

  const markOnboardingComplete = () => {
    setOnboardingStatus(prev => prev ? { ...prev, completed: true } : null);
  };

  return {
    onboardingStatus,
    loading,
    checkOnboardingStatus,
    markOnboardingComplete
  };
};
