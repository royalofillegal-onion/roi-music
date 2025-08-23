
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type SignUpFormProps = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onSuccess: () => void;
};

const SignUpForm = ({ loading, setLoading, onSuccess }: SignUpFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !name) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      
      if (error) {
        toast.error(error.message);
      } else if (data.user) {
        // Create a profile for the user
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            user_id: data.user.id,
            name,
          });
          
        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
        
        toast.success('Account created successfully! You are now logged in.');
        // Force page reload to ensure clean auth state
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error during signup:', error);
      toast.error('An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSignUp}>
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Name
        </label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          required
          className="bg-gray-800 border-gray-700"
        />
      </div>
      
      <div>
        <label htmlFor="signup-email" className="block text-sm font-medium mb-2">
          Email
        </label>
        <Input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="bg-gray-800 border-gray-700"
        />
      </div>
      
      <div>
        <label htmlFor="signup-password" className="block text-sm font-medium mb-2">
          Password
        </label>
        <Input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="bg-gray-800 border-gray-700"
          minLength={6}
        />
      </div>
      
      <Button
        type="submit"
        className="w-full bg-music-accent hover:bg-music-accent/90 text-black"
        disabled={loading}
      >
        {loading ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
};

export default SignUpForm;
