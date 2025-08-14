import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_C8XUooFx.mjs';
import 'kleur/colors';
import { a as withAuthAndConvexProvider, w as withErrorBoundary, $ as $$Layout } from '../chunks/Layout_CLBZbsYb.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useConvexAuth, useQuery } from 'convex/react';
import { a as api$1 } from '../chunks/api_CW-UzRCp.mjs';
export { renderers } from '../renderers.mjs';

const api = api$1;
function AppsList() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const apps = useQuery(
    api.apps?.listActiveApps,
    isAuthenticated ? {} : "skip"
  );
  if (isLoading) return /* @__PURE__ */ jsx("p", { children: "Loading…" });
  if (!isAuthenticated) {
    return /* @__PURE__ */ jsx("p", { children: "Please sign in to see available apps." });
  }
  if (apps === void 0) return /* @__PURE__ */ jsx("p", { children: "Loading apps…" });
  if (apps.length === 0) return /* @__PURE__ */ jsx("p", { children: "No apps are active." });
  return /* @__PURE__ */ jsx(
    "ul",
    {
      style: { display: "grid", gap: "0.75rem", padding: 0, listStyle: "none" },
      children: apps.map((app) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
        "a",
        {
          href: `/apps/${app.slug}`,
          style: {
            display: "block",
            padding: "0.75rem 1rem",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            textDecoration: "none",
            color: "inherit",
            background: "#fafafa"
          },
          children: [
            /* @__PURE__ */ jsx("strong", { children: app.name }),
            /* @__PURE__ */ jsxs("span", { style: { marginLeft: 8, color: "#6b7280", fontSize: 14 }, children: [
              "/",
              app.slug
            ] })
          ]
        }
      ) }, app._id))
    }
  );
}
const AppsList$1 = withAuthAndConvexProvider(
  withErrorBoundary(AppsList, { boundaryId: "AppsList" })
);

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="max-w-3xl mx-auto px-4 py-8"> <h2 class="text-2xl font-bold mb-6">Welcome to AI Playground</h2> <p class="mb-6">Explore available apps below when signed in.</p> ${renderComponent($$result2, "AppsList", AppsList$1, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/andrewharvey/dev/ai-playground/src/components/islands/AppsList.tsx", "client:component-export": "default" })} </main> ` })}`;
}, "/Users/andrewharvey/dev/ai-playground/src/pages/index.astro", void 0);

const $$file = "/Users/andrewharvey/dev/ai-playground/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
