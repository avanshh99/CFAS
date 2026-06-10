// ============================================================
// ErrorBoundary — Global and module fallback boundary
// ============================================================

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center space-y-6">
            <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold text-gray-900">Something went wrong</h1>
              <p className="text-sm text-gray-500">
                EcoSense encountered an unexpected application error.
              </p>
              {this.state.error && (
                <pre className="mt-2 text-left bg-gray-50 rounded-lg p-3 text-xs text-red-600 font-mono max-h-40 overflow-auto border border-gray-100">
                  {this.state.error.message}
                </pre>
              )}
            </div>

            <Button onClick={this.handleReset} className="w-full gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset & Return Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default AppErrorBoundary;
