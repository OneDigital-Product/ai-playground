import { useConvexAuth, useQuery } from "convex/react";
import { api as generatedApi } from "@/../convex/_generated/api";
import { withAuthAndConvexProvider } from "@/lib/convex";

const api: any = generatedApi as any;

type AppItem = { _id: string; slug: string; name: string };

function AppsList() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const apps = useQuery(
    api.apps?.listActiveApps,
    isAuthenticated ? {} : ("skip" as any),
  ) as AppItem[] | undefined;

  if (isLoading) return <p>Loading…</p>;

  if (!isAuthenticated) {
    return <p>Please sign in to see available apps.</p>;
  }

  if (apps === undefined) return <p>Loading apps…</p>;
  if (apps.length === 0) return <p>No apps are active.</p>;

  return (
    <ul
      style={{ display: "grid", gap: "0.75rem", padding: 0, listStyle: "none" }}
    >
      {apps.map((app: AppItem) => (
        <li key={app._id}>
          <a
            href={`/apps/${app.slug}`}
            style={{
              display: "block",
              padding: "0.75rem 1rem",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              textDecoration: "none",
              color: "inherit",
              background: "#fafafa",
            }}
          >
            <strong>{app.name}</strong>
            <span style={{ marginLeft: 8, color: "#6b7280", fontSize: 14 }}>
              /{app.slug}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

import { withErrorBoundary } from "./ErrorBoundary";

export default withAuthAndConvexProvider(
  withErrorBoundary(AppsList, { boundaryId: "AppsList" }),
);
