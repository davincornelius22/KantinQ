import React, { Component, ErrorInfo, ReactNode } from "react";
import { logger } from "../utils/logger";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global Error Boundary component to intercept uncaught React errors gracefully.
 * Prevents raw stack traces or internal implementation details from leaking to the end user.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log through secure logger with automatic data masking
    logger.error("ErrorBoundary caught an unhandled application error:", {
      message: error.message,
      componentStack: errorInfo.componentStack,
    });
  }

  public handleReload = (): void => {
    window.location.reload();
  };

  public handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.href = "/";
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-xl font-bold text-slate-800 mb-2">
              Terjadi Kesalahan pada Aplikasi
            </h1>

            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Mohon maaf atas ketidaknyamanannya. Terjadi kendala teknis yang tidak
              terduga pada sistem KantinQ. Silakan muat ulang halaman atau kembali
              ke menu utama.
            </p>

            {/* Security note: Raw stack traces are masked and omitted from UI */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-6 text-xs text-amber-900 text-left">
              <span className="font-semibold block mb-1">
                🛡️ Perlindungan Keamanan Pengguna
              </span>
              Detail teknis internal dan jejak stack trace disembunyikan demi
              keamanan data dan privasi pengguna.
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-xl transition shadow-sm hover:shadow"
              >
                <RefreshCw className="w-4 h-4" />
                Muat Ulang
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition border border-slate-200"
              >
                <Home className="w-4 h-4" />
                Beranda
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

