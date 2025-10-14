import log from 'loglevel';
import React from 'react';

import { ModernErrorBoundary } from './ModernErrorBoundary';

interface ModernErrorBoundaryWrapperProps {
  children: React.ReactNode;
}

interface ModernErrorBoundaryWrapperState {
  hasError: boolean;
  error?: Error;
}

export class ModernErrorBoundaryWrapper extends React.Component<
  ModernErrorBoundaryWrapperProps,
  ModernErrorBoundaryWrapperState
> {
  constructor(props: ModernErrorBoundaryWrapperProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ModernErrorBoundaryWrapperState {
    log.debug('getDerivedStateFromError', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    log.debug('catch error', error, errorInfo);
    this.setState({ hasError: true, error });
  }

  render() {
    if (this.state.hasError) {
      return <ModernErrorBoundary error={this.state.error} />;
    }

    return this.props.children;
  }
}
