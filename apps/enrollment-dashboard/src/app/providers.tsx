"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";
import { ToastProvider } from "../components/toast";

export function Providers({ children }: { children: ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const client = useMemo(() => new ConvexReactClient(convexUrl!), [convexUrl]);

  // Narrow ReactNode to satisfy potential cross-version React type unions in CI/build.
  const typedChildren = children as unknown as import("react").ReactNode;

  return (
    <ConvexProvider client={client}>
      <ToastProvider>
        {typedChildren}
      </ToastProvider>
    </ConvexProvider>
  );
}
