import { useState, useEffect } from 'react';

interface OnboardingStatus {
  completed: boolean;
  username: string | null;
  preferences: any;
}

export const useOnboarding = () => {
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>({
    completed: true, // Disabled until user_onboarding table is created
    username: null,
    preferences: {}
  });
  const [loading, setLoading] = useState(false);

  const checkOnboardingStatus = async () => {
    // Disabled until user_onboarding table is created
    setOnboardingStatus({ completed: true, username: null, preferences: {} });
    setLoading(false);
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
