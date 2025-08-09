import React, { Component, type ReactNode } from "react";
import { logger } from "@/lib/logger";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  boundaryId?: string;
};

type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: { componentStack: string }) {
    logger.error("ErrorBoundary caught error", {
      error,
      componentStack: info?.componentStack,
      boundaryId: this.props.boundaryId,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            style={{
              padding: 12,
              border: "1px solid #fee2e2",
              background: "#fef2f2",
              color: "#991b1b",
              borderRadius: 8,
            }}
          >
            <strong>Something went wrong.</strong>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export function withErrorBoundary<T extends object>(
  Wrapped: React.ComponentType<T>,
  options?: { fallback?: ReactNode; boundaryId?: string },
) {
  return function ComponentWithBoundary(props: T) {
    return (
      <ErrorBoundary
        fallback={options?.fallback}
        boundaryId={options?.boundaryId}
      >
        <Wrapped {...(props as T)} />
      </ErrorBoundary>
    );
  };
}
