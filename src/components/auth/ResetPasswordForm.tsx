
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

type ResetPasswordFormProps = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onBackToLogin: () => void;
};

const ResetPasswordForm = ({ loading, setLoading, onBackToLogin }: ResetPasswordFormProps) => {
  const [email, setEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/settings',
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        setResetSent(true);
        toast.success('Password reset email sent. Please check your inbox.');
      }
    } catch (error) {
      console.error('Error during password reset:', error);
      toast.error('An error occurred during password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button 
        type="button" 
        variant="ghost" 
        onClick={onBackToLogin} 
        className="flex items-center text-gray-400 hover:text-white mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to login
      </Button>
      
      {resetSent ? (
        <div className="text-center space-y-4">
          <h3 className="text-xl font-medium">Check your email</h3>
          <p className="text-gray-400">
            We've sent a password reset link to {email}
          </p>
          <p className="text-gray-400 text-sm">
            Didn't receive an email? Check your spam folder or try again.
          </p>
          <Button
            type="button"
            className="mt-4"
            variant="outline"
            onClick={onBackToLogin}
          >
            Back to login
          </Button>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleResetPassword}>
          <div>
            <h3 className="text-xl font-medium mb-4">Reset your password</h3>
            <p className="text-gray-400 text-sm mb-4">
              Enter the email address associated with your account, and we'll send you a link to reset your password.
            </p>
            <label htmlFor="reset-email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <Input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="bg-gray-800 border-gray-700"
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-music-accent hover:bg-music-accent/90 text-black"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>
      )}
    </div>
  );
};

export default ResetPasswordForm;
