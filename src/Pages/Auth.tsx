
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from '@/components/auth/LoginForm';
import SignUpForm from '@/components/auth/SignUpForm';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import TermsAcceptance from '@/components/auth/TermsAcceptance';
import { Loader2, User } from 'lucide-react';

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
        // Use window.location for mobile APK compatibility
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      }
    });

    // Then check for existing session
    try {
      setIsChecking(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      // Also check localStorage for session data (for better persistence)
      const storedSession = localStorage.getItem('auth.session');
      
      if (session) {
        console.log("Auth: User is already logged in, redirecting to home");
        window.location.href = '/';
      } else if (storedSession) {
        console.log("Auth: Attempting to restore session from localStorage");
        try {
          const parsedSession = JSON.parse(storedSession);
          const { data, error } = await supabase.auth.setSession({
            access_token: parsedSession.access_token,
            refresh_token: parsedSession.refresh_token,
          });
          
          if (error) {
            console.error("Failed to restore session:", error);
            localStorage.removeItem('auth.session');
          } else if (data.session) {
            console.log("Auth: Session restored successfully");
            window.location.href = '/';
          }
        } catch (error) {
          console.error("Failed to parse stored session:", error);
          localStorage.removeItem('auth.session');
        }
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
              <User className="w-10 h-10 text-background" />
            </div>
          </div>
          
          <div>
            <h1 className="text-4xl font-bold">
              <span className="text-foreground">ROI</span>
              <span className="text-primary"> MUSIC</span>
            </h1>
            <p className="text-muted-foreground mt-2">Sign in to access your music world</p>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full" onValueChange={(value) => setAuthMode(value as 'login' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2 bg-card/50 border-2 border-primary/20 p-1">
            <TabsTrigger 
              value="login" 
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:border-primary/50 data-[state=active]:border-2 data-[state=active]:shadow-md"
            >
              Login
            </TabsTrigger>
            <TabsTrigger 
              value="signup"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-background data-[state=active]:font-semibold data-[state=active]:shadow-glow"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-6">
            <LoginForm 
              loading={loading}
              setLoading={setLoading}
              onSuccess={handleAuthSuccess}
              onForgotPassword={handleResetPassword}
            />
          </TabsContent>

          <TabsContent value="signup" className="mt-6">
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
