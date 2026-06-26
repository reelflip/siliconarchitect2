/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    const self = this as any;
    if (self.state.hasError) {
      return (
        <div className="p-6 bg-slate-900 border border-red-500/30 rounded-xl text-left space-y-4">
          <h2 className="text-sm font-bold text-red-400 font-mono flex items-center gap-2">
            ⚠️ COMPONENT RENDERING ERROR
          </h2>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            An unexpected error occurred while rendering this section:
          </p>
          <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-red-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap max-h-40">
            {self.state.error?.toString() || "Unknown rendering exception"}
          </pre>
          <button
            onClick={() => self.setState({ hasError: false, error: null })}
            className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-all"
          >
            RETRY RENDERING
          </button>
        </div>
      );
    }

    return self.props.children;
  }
}
