"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";
import { ToastProvider } from "../components/toast";

export function Providers({ children }: { children: ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const client = useMemo(() => new ConvexReactClient(convexUrl!), [convexUrl]);

  return (
    <ConvexProvider client={client}>
      <ToastProvider>{children}</ToastProvider>
    </ConvexProvider>
  );
}
