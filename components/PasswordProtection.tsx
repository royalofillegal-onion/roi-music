import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

interface PasswordProtectionProps {
  expectedPassword: string;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

const PasswordProtection: React.FC<PasswordProtectionProps> = ({
  expectedPassword,
  onSuccess,
  title = "Protected Content",
  description = "Please enter the password to access this content."
}) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple password check
    setTimeout(() => {
      if (password === expectedPassword) {
        toast.success('Access granted!');
        onSuccess();
      } else {
        toast.error('Incorrect password. Please try again.');
        setPassword('');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-md w-full space-y-8 bg-gray-800/50 p-8 rounded-xl border border-gray-700 backdrop-blur-sm">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="mt-2 text-gray-400 text-sm">{description}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-500 focus:ring-yellow-500"
              required
              autoFocus
            />
          </div>
          
          <Button
            type="submit"
            disabled={isLoading || !password.trim()}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
          >
            {isLoading ? 'Verifying...' : 'Access Content'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PasswordProtection;