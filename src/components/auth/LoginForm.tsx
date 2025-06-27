
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
      } else {
        // Store authentication data for better persistence
        if (rememberMe) {
          localStorage.setItem('auth.session', JSON.stringify(data.session));
        }
        
        // Ensure that the session is properly set in the supabase client
        supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        
        toast.success('Logged in successfully');
        onSuccess();
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
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="bg-gray-800 border-gray-700"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-2">
          Password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="bg-gray-800 border-gray-700"
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
            className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-music-accent focus:ring-music-accent/80"
          />
          <label htmlFor="remember-me" className="ml-2 text-sm text-gray-400">
            Remember me
          </label>
        </div>
        
        <Button 
          type="button" 
          variant="link" 
          onClick={onForgotPassword}
          className="text-gray-400 hover:text-white p-0 h-auto"
        >
          Forgot password?
        </Button>
      </div>
      
      <Button
        type="submit"
        className="w-full bg-music-accent hover:bg-music-accent/90 text-black"
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
};

export default LoginForm;
