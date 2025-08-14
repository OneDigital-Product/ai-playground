import type { ReactNode } from "react";
import { useConvexAuth } from "convex/react";

function BaseIsland({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) return <p>Loading…</p>;
  if (!isAuthenticated) return <p>Please sign in to use this app.</p>;

  return (
    <section
      style={{ padding: "1rem", border: "1px solid #eee", borderRadius: 8 }}
    >
      {title ? (
        <h3
          style={{
            marginTop: 0,
            marginBottom: 12,
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          {title}
        </h3>
      ) : null}
      {children}
    </section>
  );
}

export default BaseIsland;
