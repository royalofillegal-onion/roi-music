
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { FileText, Shield } from 'lucide-react';
import TermsAndConditions from './TermsAndConditions';

interface TermsAcceptanceProps {
  onAccept: () => void;
  loading?: boolean;
}

const TermsAcceptance: React.FC<TermsAcceptanceProps> = ({ onAccept, loading = false }) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const canProceed = termsAccepted && privacyAccepted;

  const handleAccept = () => {
    if (canProceed) {
      // Store acceptance in localStorage
      localStorage.setItem('terms_accepted', 'true');
      localStorage.setItem('privacy_accepted', 'true');
      localStorage.setItem('acceptance_date', new Date().toISOString());
      onAccept();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-6 pb-32 px-4 md:ml-16">
      <div className="w-full max-w-md space-y-8 bg-gray-900/50 p-8 rounded-xl">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-music-accent" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome to ROI MUSIC
          </h2>
          <p className="text-gray-400 text-sm">
            Please review and accept our terms to continue
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-gray-800/30 rounded-lg">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="terms" className="text-sm text-white cursor-pointer">
                  I agree to the{' '}
                  <TermsAndConditions>
                    <button className="text-music-accent hover:text-music-accent/80 underline">
                      Terms and Conditions
                    </button>
                  </TermsAndConditions>
                </label>
                <p className="text-xs text-gray-400 mt-1">
                  Understanding our platform purpose and content policies
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-gray-800/30 rounded-lg">
              <Checkbox
                id="privacy"
                checked={privacyAccepted}
                onCheckedChange={(checked) => setPrivacyAccepted(checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="privacy" className="text-sm text-white cursor-pointer">
                  I agree to the Privacy & Service Policy
                </label>
                <p className="text-xs text-gray-400 mt-1">
                  How we handle your data and provide our services
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-900/20 p-4 rounded-lg border border-green-700/30">
            <div className="flex items-start space-x-2">
              <FileText className="h-4 w-4 text-green-400 mt-0.5" />
              <div className="text-xs text-green-200">
                <p className="font-medium mb-1">What you're agreeing to:</p>
                <ul className="list-disc list-inside space-y-1 text-green-300">
                  <li>Using this platform for entertainment purposes</li>
                  <li>Respecting artists' and creators' rights</li>
                  <li>Understanding all content belongs to rightful owners</li>
                  <li>Supporting the music community</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            onClick={handleAccept}
            disabled={!canProceed || loading}
            className="w-full bg-music-accent hover:bg-music-accent/90 text-black font-medium"
          >
            {loading ? 'Please wait...' : 'Accept and Continue'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By continuing, you confirm that you have read and understood our terms and policies.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAcceptance;
