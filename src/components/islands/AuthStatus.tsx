import { useConvexAuth } from "convex/react";
import { useAuthActions, withAuthAndConvexProvider } from "@/lib/convex";

function AuthStatus() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (isLoading) return <span>Loading…</span>;

  if (!isAuthenticated) {
    return (
      <a
        href="/auth/signin"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        Sign in
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signOut()}
      style={{
        border: "1px solid #ddd",
        padding: "0.25rem 0.5rem",
        borderRadius: 6,
        background: "white",
        cursor: "pointer",
      }}
    >
      Sign out
    </button>
  );
}

import { withErrorBoundary } from "./ErrorBoundary";

export default withAuthAndConvexProvider(
  withErrorBoundary(AuthStatus, { boundaryId: "AuthStatus" }),
);
