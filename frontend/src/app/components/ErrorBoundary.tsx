import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center p-8">
          <div className="max-w-md bg-white/10 border border-line rounded-panel p-6 text-white">
            <h2 className="text-lg font-bold text-error-text mb-2">Đã xảy ra lỗi</h2>
            <p className="text-sm text-white/70 mb-4">{this.state.error.message}</p>
            <button
              type="button"
              onClick={() => window.location.assign('/')}
              className="bg-primary px-4 py-2 rounded-control text-sm"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
