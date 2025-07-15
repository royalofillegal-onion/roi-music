
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthHeader from '@/components/auth/AuthHeader';
import LoginForm from '@/components/auth/LoginForm';
import SignUpForm from '@/components/auth/SignUpForm';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import TermsAcceptance from '@/components/auth/TermsAcceptance';
import { Loader2 } from 'lucide-react';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [isChecking, setIsChecking] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const navigate = useNavigate();

  // Check if user needs to accept terms
  useEffect(() => {
    const termsAccepted = localStorage.getItem('terms_accepted');
    const privacyAccepted = localStorage.getItem('privacy_accepted');
    
    if (!termsAccepted || !privacyAccepted) {
      setShowTerms(true);
      setIsChecking(false);
      return;
    }
    
    // If terms are accepted, proceed with normal auth check
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    // Set up auth listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth: Auth state changed:", event);
      // Redirect to home page if logged in
      if (event === 'SIGNED_IN' && session) {
        console.log("Auth: User signed in, redirecting to home");
        setTimeout(() => {
          navigate('/');
        }, 0);
      }
    });

    // Then check for existing session
    try {
      setIsChecking(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      // Also check localStorage for session data (for better persistence)
      const storedSession = localStorage.getItem('auth.session');
      
      if (session || storedSession) {
        console.log("Auth: User is already logged in, redirecting to home");
        
        // If we have a stored session but no active session, try to restore it
        if (storedSession && !session) {
          try {
            const parsedSession = JSON.parse(storedSession);
            await supabase.auth.setSession({
              access_token: parsedSession.access_token,
              refresh_token: parsedSession.refresh_token,
            });
          } catch (error) {
            console.error("Failed to restore session from localStorage:", error);
            // Clear invalid stored session
            localStorage.removeItem('auth.session');
          }
        }
        
        navigate('/');
      }
    } catch (error) {
      console.error("Error checking session:", error);
    } finally {
      setIsChecking(false);
    }

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleTermsAccepted = () => {
    setShowTerms(false);
    checkAuthState();
  };

  const handleAuthSuccess = () => {
    navigate('/');
  };
  
  const handleResetPassword = () => {
    setAuthMode('reset');
  };
  
  const handleBackToLogin = () => {
    setAuthMode('login');
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-music-accent" />
      </div>
    );
  }

  if (showTerms) {
    return <TermsAcceptance onAccept={handleTermsAccepted} loading={loading} />;
  }

  if (authMode === 'reset') {
    return (
      <div className="min-h-screen flex items-center justify-center pt-6 pb-32 px-4 md:ml-16">
        <div className="w-full max-w-md space-y-8 bg-gray-900/50 p-8 rounded-xl">
          <AuthHeader />
          <ResetPasswordForm 
            loading={loading}
            setLoading={setLoading}
            onBackToLogin={handleBackToLogin}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-6 pb-32 px-4 md:ml-16">
      <div className="w-full max-w-md space-y-8 bg-gray-900/50 p-8 rounded-xl">
        <AuthHeader />
        
        <Tabs defaultValue="login" className="w-full" onValueChange={(value) => setAuthMode(value as 'login' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <LoginForm 
              loading={loading} 
              setLoading={setLoading} 
              onSuccess={handleAuthSuccess}
              onForgotPassword={handleResetPassword}
            />
          </TabsContent>
          
          <TabsContent value="signup">
            <SignUpForm 
              loading={loading} 
              setLoading={setLoading} 
              onSuccess={handleAuthSuccess} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
