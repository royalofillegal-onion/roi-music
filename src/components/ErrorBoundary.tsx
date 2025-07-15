
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
          <div className="text-center max-w-md">
            <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-gray-400 mb-6">
              Don't worry, this happens sometimes. Try refreshing the page or go back to home.
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={this.handleRefresh}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
              
              <Button 
                onClick={this.handleGoHome}
                variant="outline"
                className="border-gray-600 text-gray-400 hover:text-white px-6 py-3 rounded-lg w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Home
              </Button>
            </div>
            
            {this.state.error && (
              <details className="mt-6 p-4 bg-gray-800 rounded-lg text-left">
                <summary className="cursor-pointer text-sm text-gray-400 mb-2">
                  Technical Details
                </summary>
                <pre className="text-xs text-red-300 overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
