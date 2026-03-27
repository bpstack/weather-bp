"use client";

import { Component, ReactNode } from "react";
import { track } from "@vercel/analytics";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[ErrorBoundary]", error, info.componentStack);
    try {
      track("error_boundary", {
        message: error.message,
        name: error.name,
        componentStack: info.componentStack.slice(0, 500),
      });
    } catch {
      // analytics unavailable
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <p className="text-text-primary text-lg font-medium mb-2">
              Algo salió mal
            </p>
            <p className="text-text-secondary text-sm mb-6">
              Se produjo un error inesperado. Intenta recargar la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-full bg-accent text-white hover:bg-accent-hover transition-all text-sm font-medium"
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
