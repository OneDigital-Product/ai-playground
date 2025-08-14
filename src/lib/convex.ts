import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexAuthProvider, useAuthActions } from "@convex-dev/auth/react";
import React, { type FunctionComponent, type ReactNode } from "react";

const PUBLIC_CONVEX_URL = import.meta.env.PUBLIC_CONVEX_URL || "";

// Only create client if URL is available
const client = PUBLIC_CONVEX_URL 
  ? new ConvexReactClient(PUBLIC_CONVEX_URL)
  : null;

export const convex = client;

export function AuthProvider({ children }: { children: ReactNode }) {
  if (!client) {
    console.warn("Convex client not initialized - PUBLIC_CONVEX_URL not set");
    return React.createElement(React.Fragment, null, children);
  }
  return React.createElement(ConvexAuthProvider as any, { client, children });
}

export function withAuthAndConvexProvider<P = any>(
  Component: FunctionComponent<P>,
) {
  return function WithProviders(props: P) {
    if (!client) {
      console.warn("Convex client not initialized - PUBLIC_CONVEX_URL not set");
      return React.createElement(Component as any, { ...(props as any) });
    }
    return React.createElement(
      ConvexProvider as any,
      { client },
      React.createElement(ConvexAuthProvider as any, {
        client,
        children: React.createElement(Component as any, { ...(props as any) }),
      }),
    );
  };
}

export function withConvexProvider<P = any>(Component: FunctionComponent<P>) {
  return function WithConvexProvider(props: P) {
    if (!client) {
      console.warn("Convex client not initialized - PUBLIC_CONVEX_URL not set");
      return React.createElement(Component as any, { ...(props as any) });
    }
    return React.createElement(
      ConvexProvider as any,
      { client },
      React.createElement(Component as any, { ...(props as any) }),
    );
  };
}

export { useAuthActions };
export {
  useConvexAuth,
  useQuery,
  useMutation,
  useAction,
  useConvex,
} from "convex/react";
