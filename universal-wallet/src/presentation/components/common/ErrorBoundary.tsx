import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from './Card';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Here you could send to Sentry, LogRocket, etc.
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Mock error logging service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.log('Error logged to service:', errorReport);

    // In real implementation, send to error tracking service:
    // errorTrackingService.captureException(error, { extra: errorReport });
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{ backgroundColor: 'var(--apple-secondary-system-background)' }}
        >
          <Card padding="xl" className="max-w-md mx-auto text-center">
            <div className="mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'var(--apple-red-light)' }}
              >
                <ErrorIcon className="w-8 h-8" style={{ color: 'var(--apple-red)' }} />
              </div>

              <h2
                className="text-xl font-bold mb-2"
                style={{ color: 'var(--apple-label)' }}
              >
                Something went wrong
              </h2>

              <p
                className="text-sm mb-4"
                style={{ color: 'var(--apple-secondary-label)' }}
              >
                We encountered an unexpected error. Your wallet data is safe.
              </p>
            </div>

            {/* Error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div
                className="text-left p-4 rounded-xl mb-6 overflow-auto max-h-32"
                style={{ backgroundColor: 'var(--apple-gray-6)' }}
              >
                <h3
                  className="text-sm font-semibold mb-2"
                  style={{ color: 'var(--apple-label)' }}
                >
                  Error Details:
                </h3>
                <pre
                  className="text-xs whitespace-pre-wrap"
                  style={{ color: 'var(--apple-red)' }}
                >
                  {this.state.error.message}
                </pre>
              </div>
            )}

            <div className="space-y-3">
              <Button
                variant="primary"
                size="large"
                fullWidth
                onClick={this.handleRetry}
              >
                <RefreshIcon className="w-4 h-4 mr-2" />
                Try Again
              </Button>

              <Button
                variant="secondary"
                size="large"
                fullWidth
                onClick={this.handleReload}
              >
                <ReloadIcon className="w-4 h-4 mr-2" />
                Reload App
              </Button>
            </div>

            <p
              className="text-xs mt-6"
              style={{ color: 'var(--apple-tertiary-label)' }}
            >
              If this problem persists, please contact support.
            </p>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional component wrapper for simpler usage
export const ErrorBoundaryWrapper: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback }) => {
  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
};

// Hook for manual error reporting
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error, context?: string) => {
    console.error(`Error in ${context || 'component'}:`, error);

    // In development, throw to trigger error boundary
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }

    // In production, just log
    // errorTrackingService.captureException(error, { extra: { context } });
  }, []);

  return { handleError };
};

// Icon Components
const ErrorIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const RefreshIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const ReloadIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);