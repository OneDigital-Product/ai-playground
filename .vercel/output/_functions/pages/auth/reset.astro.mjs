import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_C8XUooFx.mjs';
import 'kleur/colors';
import { jsx, jsxs } from 'react/jsx-runtime';
import { a as withAuthAndConvexProvider, w as withErrorBoundary, $ as $$Layout } from '../../chunks/Layout_CLBZbsYb.mjs';
import { useState } from 'react';
import { useConvexAuth, useAction } from 'convex/react';
import { a as api$1 } from '../../chunks/api_CW-UzRCp.mjs';
export { renderers } from '../../renderers.mjs';

const api = api$1;
function AuthChangePassword() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const changePassword = useAction(api.password.changePassword);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  if (isLoading) return /* @__PURE__ */ jsx("p", { children: "Loading…" });
  if (!isAuthenticated) return /* @__PURE__ */ jsx("p", { children: "Please sign in to change your password." });
  async function onSubmit(e) {
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
    } catch (err) {
      setError(err?.message ?? "Failed to update password.");
    } finally {
      setSubmitting(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm", children: [
    /* @__PURE__ */ jsx("h2", { className: "mb-1 text-2xl font-bold", children: "Change password" }),
    /* @__PURE__ */ jsx("p", { className: "mb-6 text-sm text-gray-600", children: "Enter your current password and a new password." }),
    " ",
    /* @__PURE__ */ jsxs("form", { onSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(
          "label",
          {
            htmlFor: "currentPassword",
            className: "text-sm font-medium text-gray-700",
            children: "Current password"
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "currentPassword",
            name: "currentPassword",
            type: "password",
            value: currentPassword,
            onChange: (e) => setCurrentPassword(e.target.value),
            placeholder: "••••••••",
            className: "w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(
          "label",
          {
            htmlFor: "newPassword",
            className: "text-sm font-medium text-gray-700",
            children: "New password"
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "newPassword",
            name: "newPassword",
            type: "password",
            value: newPassword,
            onChange: (e) => setNewPassword(e.target.value),
            placeholder: "Min 8 chars, include 0-9, a-z, A-Z",
            className: "w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none",
            required: true
          }
        )
      ] }),
      error && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600", children: error }),
      success && /* @__PURE__ */ jsx("p", { className: "text-sm text-green-600", children: success }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: submitting,
          className: "inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50",
          children: submitting ? "Saving…" : "Save"
        }
      ) })
    ] })
  ] });
}
const AuthChangePassword$1 = withAuthAndConvexProvider(
  withErrorBoundary(AuthChangePassword, { boundaryId: "AuthChangePassword" })
);

const $$Reset = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Change Password" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="mx-auto max-w-2xl p-6"> ${renderComponent($$result2, "AuthChangePassword", AuthChangePassword$1, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/islands/AuthChangePassword", "client:component-export": "default" })} </section> ` })}`;
}, "/Users/andrewharvey/dev/ai-playground/src/pages/auth/reset.astro", void 0);

const $$file = "/Users/andrewharvey/dev/ai-playground/src/pages/auth/reset.astro";
const $$url = "/auth/reset";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Reset,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
