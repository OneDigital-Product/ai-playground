import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_C8XUooFx.mjs';
import 'kleur/colors';
import { a as withAuthAndConvexProvider, w as withErrorBoundary, $ as $$Layout } from '../../chunks/Layout_CLBZbsYb.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import { useAuthActions } from '@convex-dev/auth/react';
export { renderers } from '../../renderers.mjs';

function validateEmailDomain(email) {
  return /@onedigital\.com$/i.test(email);
}
function validatePassword(pw) {
  return pw.length >= 8 && /[0-9]/.test(pw) && /[a-z]/.test(pw) && /[A-Z]/.test(pw);
}
function AuthSignIn() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState("signIn");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    if (!validateEmailDomain(email)) {
      setError("Email must be @onedigital.com");
      return;
    }
    if (step === "signUp" && !validatePassword(password)) {
      setError(
        "Password must be 8+ chars and include a number, lowercase and uppercase letter."
      );
      return;
    }
    setSubmitting(true);
    try {
      formData.set("flow", step);
      const result = await signIn("password", formData);
      if (!result.signingIn) {
      }
    } catch (err) {
      setError(err?.message ?? "Sign-in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm", children: [
    /* @__PURE__ */ jsx("h2", { className: "mb-1 text-2xl font-bold", children: step === "signIn" ? "Sign in" : "Create your account" }),
    /* @__PURE__ */ jsx("p", { className: "mb-6 text-sm text-gray-600", children: "Use your @onedigital.com email and password." }),
    /* @__PURE__ */ jsxs("form", { onSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "text-sm font-medium text-gray-700", children: "Email" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "email",
            name: "email",
            type: "email",
            placeholder: "you@onedigital.com",
            className: "w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(
          "label",
          {
            htmlFor: "password",
            className: "text-sm font-medium text-gray-700",
            children: "Password"
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "password",
            name: "password",
            type: "password",
            placeholder: step === "signUp" ? "Min 8 chars, include 0-9, a-z, A-Z" : "••••••••",
            className: "w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsx("input", { type: "hidden", name: "flow", value: step }),
      error && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600", children: error }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: submitting,
            className: "inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50",
            children: submitting ? "Submitting…" : step === "signIn" ? "Sign in" : "Sign up"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              setError(null);
              setStep((s) => s === "signIn" ? "signUp" : "signIn");
            },
            className: "text-sm text-indigo-700 hover:underline",
            children: step === "signIn" ? "Need an account? Sign up" : "Have an account? Sign in"
          }
        )
      ] })
    ] })
  ] });
}
const AuthSignIn$1 = withAuthAndConvexProvider(
  withErrorBoundary(AuthSignIn, { boundaryId: "AuthSignIn" })
);

const $$Signin = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="mx-auto max-w-3xl px-4 py-10"> ${renderComponent($$result2, "AuthSignIn", AuthSignIn$1, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/andrewharvey/dev/ai-playground/src/components/islands/AuthSignIn.tsx", "client:component-export": "default" })} </main> ` })}`;
}, "/Users/andrewharvey/dev/ai-playground/src/pages/auth/signin.astro", void 0);

const $$file = "/Users/andrewharvey/dev/ai-playground/src/pages/auth/signin.astro";
const $$url = "/auth/signin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Signin,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
