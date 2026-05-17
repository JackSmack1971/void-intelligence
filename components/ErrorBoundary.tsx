"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { ShieldAlert, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  children?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  showDetails: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    if (this.props.onReset) {
      try {
        this.props.onReset();
      } catch (e) {
        console.error("Error executing onReset callback in ErrorBoundary:", e);
      }
    }
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      showDetails: false,
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-4">
          <div className="max-w-2xl w-full bg-gray-900/50 backdrop-blur-md border border-red-500/30 rounded-xl p-6 shadow-[0_0_24px_rgba(239,68,68,0.15)] flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-red-500/20 pb-4">
              <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-red-400">Something went wrong</h2>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">system error boundary</p>
              </div>
            </div>

            <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-4 font-mono text-sm text-red-200">
              <span className="font-bold text-red-400">Error:</span> {this.state.error?.message || "An unexpected error occurred."}
            </div>

            {/* Diagnostic Panel Toggle */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                className="flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider font-bold w-fit"
              >
                {this.state.showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Diagnostic Details
              </button>

              {this.state.showDetails && (
                <div className="bg-[#0b0c15] border border-white/5 rounded-lg p-4 max-h-60 overflow-y-auto text-xs font-mono text-gray-400 flex flex-col gap-3 shadow-inner">
                  {this.state.error?.stack && (
                    <div>
                      <h4 className="text-red-400 font-bold border-b border-white/5 pb-1 mb-1">Stack Trace:</h4>
                      <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <h4 className="text-cyan-400 font-bold border-b border-white/5 pb-1 mb-1">Component Stack:</h4>
                      <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recovery Control Panel */}
            <div className="flex items-center gap-3 border-t border-white/5 pt-4 mt-2">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-medium text-sm rounded-lg transition-all shadow-[0_4px_12px_rgba(239,68,68,0.2)]"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>

              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 border border-white/10 hover:bg-white/5 text-gray-300 font-medium text-sm rounded-lg transition-all"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
