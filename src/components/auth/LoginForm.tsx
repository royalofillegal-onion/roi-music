
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type LoginFormProps = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onSuccess: () => void;
  onForgotPassword: () => void;
};

const LoginForm = ({ loading, setLoading, onSuccess, onForgotPassword }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    try {
      setLoading(true);

      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else if (data?.session && data?.user) {
        toast.success('Logged in successfully');
        // AuthContext listener picks up the SIGNED_IN event; just navigate.
        onSuccess();
      } else {
        toast.error('Invalid login response');
      }
    } catch (error) {
      console.error('Error during login:', error);
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleLogin}>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="bg-card border-border focus:border-music-accent"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-2 text-foreground">
          Password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="bg-card border-border focus:border-music-accent"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-border bg-card text-music-accent focus:ring-music-accent/80"
          />
          <label htmlFor="remember-me" className="ml-2 text-sm text-muted-foreground">
            Remember me
          </label>
        </div>
        
        <Button 
          type="button" 
          variant="link" 
          onClick={onForgotPassword}
          className="text-muted-foreground hover:text-foreground p-0 h-auto"
        >
          Forgot password?
        </Button>
      </div>
      
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-background to-card text-foreground border-2 border-primary hover:from-primary hover:to-accent hover:text-background transition-all font-semibold shadow-md hover:shadow-glow"
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
};

export default LoginForm;
