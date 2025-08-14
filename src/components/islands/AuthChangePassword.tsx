import { withAuthAndConvexProvider } from "@/lib/convex";
import { useState } from "react";
import { useAction, useConvexAuth } from "convex/react";
import { api as generatedApi } from "@/../convex/_generated/api";

const api: any = generatedApi as any;

function AuthChangePassword() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const changePassword = useAction(api.password.changePassword);

  // Email is derived server-side from the authenticated user
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return <p>Loading…</p>;
  if (!isAuthenticated) return <p>Please sign in to change your password.</p>;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setSuccess("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setError(err?.message ?? "Failed to update password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-2xl font-bold">Change password</h2>
      <p className="mb-6 text-sm text-gray-600">
        Enter your current password and a new password.
      </p>{" "}
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1">
          <label
            htmlFor="currentPassword"
            className="text-sm font-medium text-gray-700"
          >
            Current password
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="newPassword"
            className="text-sm font-medium text-gray-700"
          >
            New password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min 8 chars, include 0-9, a-z, A-Z"
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

import { withErrorBoundary } from "./ErrorBoundary";

export default withAuthAndConvexProvider(
  withErrorBoundary(AuthChangePassword, { boundaryId: "AuthChangePassword" }),
);
