
import React, { useEffect, useState } from "react";
import MusicVisualizer from "@/components/MusicVisualizer";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import FloatingMusicInfo from "@/components/FloatingMusicInfo";
import FloatingSettingsPanel from "@/components/FloatingSettingsPanel";
import RecentlyPlayedSection from "@/components/RecentlyPlayedSection";
import FestivalPopup from "@/components/FestivalPopup";
import TimeLighting from "@/components/TimeLighting";
import DynamicHomepage from "@/components/DynamicHomepage";
import { Music2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useDynamicContent } from "@/hooks/useDynamicContent";
import UserProfile from "@/components/UserProfile";

const Index = () => {
  const { onboardingStatus, loading: onboardingLoading, markOnboardingComplete } = useOnboarding();
  const { config } = useDynamicContent();
  const [timeBasedBanner, setTimeBasedBanner] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showFloatingSettings, setShowFloatingSettings] = useState(false);
  const [showFestivalPopup, setShowFestivalPopup] = useState(false);
  
  useEffect(() => {
    // Check auth status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    
    checkAuth();
    
    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Simplified banner content fetching
    const fetchContent = async () => {
      try {
        const { data: bannerData, error: bannerError } = await supabase.rpc('get_time_based_content', {
          content_type_param: 'banner'
        });
        
        if (bannerError) throw bannerError;
        
        const currentBanner = bannerData?.find((item: any) => item.is_current_period);
        if (currentBanner?.content_data && typeof currentBanner.content_data === 'object' && 'message' in currentBanner.content_data) {
          setTimeBasedBanner(currentBanner.content_data.message as string);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };
    
    fetchContent();
  }, []);
  
  // Dynamic site title from config
  const siteTitle = config.site_title?.replace(/"/g, '') || 'ROI MUSIC';

  // Only show onboarding for logged-in users who haven't completed it
  const showOnboarding = isLoggedIn && onboardingStatus && !onboardingStatus.completed;
  
  return (
    <div className="relative pb-32 md:pb-40 px-4 md:px-8 md:ml-16 min-h-screen">
      {/* Time-based lighting overlay */}
      <TimeLighting />
      
      <MusicVisualizer />
      
      {/* Floating Music Info Component */}
      <FloatingMusicInfo />
      
      {/* Festival Popup */}
      <FestivalPopup onClose={() => setShowFestivalPopup(false)} />
      
      {/* Header with User Profile and Site Name */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-bloody rounded-full flex items-center justify-center shadow-bloody animate-bloody-glow">
              <Music2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-fire bg-clip-text text-transparent">{siteTitle}</h1>
          </div>
        </div>
        <UserProfile />
      </div>
      
      {/* Time-based Banner */}
      {timeBasedBanner && (
        <div className="mb-6 p-4 bg-gradient-bloody rounded-xl border border-primary/30 backdrop-blur-sm shadow-crimson">
          <p className="text-center text-sm md:text-base font-medium text-primary-glow">
            {timeBasedBanner}
          </p>
        </div>
      )}

      {/* Dynamic Homepage Content */}
      <DynamicHomepage className="space-y-6 md:space-y-8 lg:space-y-12" />

      {/* Recently Played Section - Always show */}
      <div className="animate-slide-up mt-8">
        <RecentlyPlayedSection />
      </div>

      {/* Onboarding Flow - Only show for logged-in users */}
      {!onboardingLoading && showOnboarding && (
        <OnboardingFlow onComplete={markOnboardingComplete} />
      )}
      
      {/* Floating Settings Components */}
      <FloatingSettingsPanel 
        isVisible={showFloatingSettings}
        onToggle={setShowFloatingSettings}
      />

    </div>
  );
};

export default Index;
