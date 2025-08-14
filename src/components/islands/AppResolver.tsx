import { useConvexAuth, useQuery } from "convex/react";
import { api as generatedApi } from "@/../convex/_generated/api";
import { withAuthAndConvexProvider } from "@/lib/convex";
import { getIslandBySlug } from "./registry";

const api: any = generatedApi as any;

type AppItem = { _id: string; slug: string; name: string };

function AppResolver({ slug }: { slug: string }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const app = useQuery(
    api.apps?.getApp,
    isAuthenticated ? { slug } : ("skip" as any),
  ) as AppItem | null | undefined;

  if (isLoading) return <p>Loading…</p>;
  if (!isAuthenticated) return <p>Please sign in to access apps.</p>;

  if (app === undefined) return <p>Loading app…</p>;
  if (app === null) return <p>App not found.</p>;

  const Island = getIslandBySlug(app.slug);

  return (
    <div style={{ padding: "1rem" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700 }}>{app.name}</h2>
      <p style={{ color: "#6b7280" }}>Slug: {app.slug}</p>
      <div style={{ marginTop: 12 }}>
        {Island ? (
          <Island />
        ) : (
          <div
            style={{
              padding: 12,
              border: "1px dashed #ddd",
              borderRadius: 8,
            }}
          >
            <p>No island registered for this app.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { withErrorBoundary } from "./ErrorBoundary";

export default withAuthAndConvexProvider(
  withErrorBoundary(AppResolver, { boundaryId: "AppResolver" }),
);
