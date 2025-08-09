import { useAuthActions } from "@/lib/convex";
import { useState } from "react";
import { withAuthAndConvexProvider } from "@/lib/convex";

function validateEmailDomain(email: string) {
  return /@onedigital\.com$/i.test(email);
}

function validatePassword(pw: string) {
  // min 8 chars, include number, lowercase, uppercase
  return (
    pw.length >= 8 && /[0-9]/.test(pw) && /[a-z]/.test(pw) && /[A-Z]/.test(pw)
  );
}

function AuthSignIn() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    // client-side checks to match server rules
    if (!validateEmailDomain(email)) {
      setError("Email must be @onedigital.com");
      return;
    }
    if (step === "signUp" && !validatePassword(password)) {
      setError(
        "Password must be 8+ chars and include a number, lowercase and uppercase letter.",
      );
      return;
    }

    setSubmitting(true);
    try {
      // include flow in the form data as required by Password provider
      formData.set("flow", step);
      const result = await signIn("password", formData);
      // If sign-in requires verification or redirects, ConvexAuthProvider will handle state
      // We keep the page as-is; Navigation/AuthStatus will update after session established
      if (!result.signingIn) {
        // Not immediately signed in; could be verification step configured; keep UX simple
      }
    } catch (err: any) {
      // ConvexError or generic error
      setError(err?.message ?? "Sign-in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-2xl font-bold">
        {step === "signIn" ? "Sign in" : "Create your account"}
      </h2>
      <p className="mb-6 text-sm text-gray-600">
        Use your @onedigital.com email and password.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
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

        <div className="space-y-1">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder={
              step === "signUp"
                ? "Min 8 chars, include 0-9, a-z, A-Z"
                : "••••••••"
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
        </div>

        {/* Hidden flow field consumed by Convex Auth Password provider */}
        <input type="hidden" name="flow" value={step} />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting
              ? "Submitting…"
              : step === "signIn"
                ? "Sign in"
                : "Sign up"}
          </button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setStep((s) => (s === "signIn" ? "signUp" : "signIn"));
            }}
            className="text-sm text-indigo-700 hover:underline"
          >
            {step === "signIn"
              ? "Need an account? Sign up"
              : "Have an account? Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}

import { withErrorBoundary } from "./ErrorBoundary";

export default withAuthAndConvexProvider(
  withErrorBoundary(AuthSignIn, { boundaryId: "AuthSignIn" }),
);
