import { useAuthActions } from "@/lib/convex";
import { withAuthAndConvexProvider } from "@/lib/convex";
import { useState } from "react";

function validateEmailDomain(email: string) {
  return /@onedigital\.com$/i.test(email);
}

function AuthPasswordReset() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"forgot" | { email: string }>("forgot");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    if (!validateEmailDomain(email)) {
      setError("Email must be @onedigital.com");
      return;
    }
    setSubmitting(true);
    try {
      formData.set("flow", "reset");
      await signIn("password", formData);
      setStep({ email });
    } catch (err: any) {
      setError(err?.message ?? "Failed to send reset code.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const password = String(formData.get("newPassword") || "");
    if (password.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      formData.set("flow", "reset-verification");
      await signIn("password", formData);
      // Success will sign user in; UI will reflect via AuthStatus
    } catch (err: any) {
      setError(err?.message ?? "Reset verification failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-2xl font-bold">Reset your password</h2>
      <p className="mb-6 text-sm text-gray-600">
        We will send a code to your @onedigital.com email.
      </p>
      {step === "forgot" ? (
        <form onSubmit={onRequest} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@onedigital.com"
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>
          <input type="hidden" name="flow" value="reset" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Send code"}
            </button>
            <a
              href="/auth/signin"
              className="text-sm text-indigo-700 hover:underline"
            >
              Back to sign in
            </a>
          </div>
        </form>
      ) : (
        <form onSubmit={onVerify} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="code" className="text-sm font-medium text-gray-700">
              Code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              placeholder="12345678"
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
              placeholder="Min 8 chars, include 0-9, a-z, A-Z"
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>
          <input type="hidden" name="email" value={step.email} />
          <input type="hidden" name="flow" value="reset-verification" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Continue"}
            </button>
            <button
              type="button"
              onClick={() => setStep("forgot")}
              className="text-sm text-indigo-700 hover:underline"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

import { withErrorBoundary } from "./ErrorBoundary";

export default withAuthAndConvexProvider(
  withErrorBoundary(AuthPasswordReset, { boundaryId: "AuthPasswordReset" }),
);
