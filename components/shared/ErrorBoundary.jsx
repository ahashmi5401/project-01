'use client';

import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-navy text-offwhite p-6">
          <div className="max-w-md w-full border border-hairline bg-navy/60 p-8 rounded-lg shadow-elevation-sm">
            <div className="text-center">
              <div className="w-16 h-16 border border-accent flex items-center justify-center mx-auto mb-6 rounded-lg">
                <svg className="w-8 h-8 text-accent fill-none stroke-current" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="font-sans font-bold text-h2 text-offwhite mb-xl uppercase tracking-tight">
                Something went wrong
              </h2>
              <p className="font-sans text-body text-steelblue mb-xl leading-relaxed">
                An unexpected error occurred. Please refresh the page or try again later.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="font-mono text-label uppercase tracking-wider text-accent border border-accent/20 px-xl py-3 hover:bg-accent/5 transition-colors rounded shadow-elevation-sm"
              >
                Refresh Page
              </button>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-xl text-left">
                  <summary className="font-mono text-label text-steelblue cursor-pointer hover:text-accent">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-md p-lg bg-navy/80 border border-hairline rounded text-label text-red-400 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
