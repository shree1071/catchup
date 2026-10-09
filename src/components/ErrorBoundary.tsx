import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorId: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `err_${Date.now().toString(36)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary]', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorId: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 bg-[#0a0b0d] border border-[#1a1b1e] rounded-xl">
          <div className="w-12 h-12 rounded-full bg-[#ff6363]/10 border border-[#ff6363]/30 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-[#ff6363]" />
          </div>
          <h3 className="text-[#ffffff] text-lg font-medium mb-2">
            {this.props.fallbackTitle || 'Something went wrong'}
          </h3>
          <p className="text-[#6b6c6f] text-sm text-center max-w-md mb-1">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <p className="text-[#3a3b3e] text-xs font-mono mb-4">
            Error ID: {this.state.errorId}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-[#141517] border border-[#2a2b2e] rounded-lg text-[#9c9c9d] hover:text-[#ffffff] hover:border-[#ff6363]/40 transition-all text-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
