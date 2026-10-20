import React from 'react';
import { RefreshCw, Moon } from 'lucide-react';

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dreamora ErrorBoundary caught an exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleClearDataAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="w-16 h-16 rounded-full bg-purple-900/50 border border-purple-500/30 flex items-center justify-center mb-4 shadow-xl">
            <Moon className="w-8 h-8 text-purple-300 animate-pulse" />
          </div>
          <h1 className="text-xl font-bold mb-2 text-purple-200">
            Dreamora Encountered a Gentle Reset
          </h1>
          <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
            We experienced an unexpected issue. Don't worry—your sleep data is safe. Let's restore your calm workspace.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={this.handleClearDataAndReload}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-all border border-slate-700"
            >
              Reset Session & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
