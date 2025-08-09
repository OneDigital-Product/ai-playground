const PUBLIC_CONVEX_URL = import.meta.env.PUBLIC_CONVEX_URL;
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { type FunctionComponent, type JSX, type ReactNode } from "react";

const client = new ConvexReactClient(PUBLIC_CONVEX_URL);

export const convex = client;

export function AuthProvider({ children }: { children: ReactNode }) {
  return <ConvexAuthProvider client={client}>{children}</ConvexAuthProvider>;
}

// Astro context providers don't work when used in .astro files.
// See this and other related issues: https://github.com/withastro/astro/issues/2016#issuecomment-981833594
//
// This exists to conveniently wrap any component that uses Convex.
export function withConvexProvider<Props extends JSX.IntrinsicAttributes>(
  Component: FunctionComponent<Props>,
) {
  return function WithConvexProvider(props: Props) {
    return (
      <ConvexProvider client={client}>
        <Component {...props} />
      </ConvexProvider>
    );
  };
}

export { useAuthActions } from "@convex-dev/auth/react";
export { useConvexAuth } from "convex/react";
