import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_C8XUooFx.mjs';
import 'kleur/colors';
import { w as withErrorBoundary, a as withAuthAndConvexProvider, $ as $$Layout } from '../../chunks/Layout_CLBZbsYb.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useConvexAuth, useQuery, useMutation } from 'convex/react';
import { a as api$2 } from '../../chunks/api_CW-UzRCp.mjs';
import { ResultAsync } from 'neverthrow';
import { useState } from 'react';
export { renderers } from '../../renderers.mjs';

function BaseIsland({
  children,
  title
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  if (isLoading) return /* @__PURE__ */ jsx("p", { children: "Loading…" });
  if (!isAuthenticated) return /* @__PURE__ */ jsx("p", { children: "Please sign in to use this app." });
  return /* @__PURE__ */ jsxs(
    "section",
    {
      style: { padding: "1rem", border: "1px solid #eee", borderRadius: 8 },
      children: [
        title ? /* @__PURE__ */ jsx(
          "h3",
          {
            style: {
              marginTop: 0,
              marginBottom: 12,
              fontSize: 18,
              fontWeight: 700
            },
            children: title
          }
        ) : null,
        children
      ]
    }
  );
}

const api$1 = api$2;
function ChatAppImpl() {
  const list = useQuery(api$1.messages?.list, {});
  const send = useMutation(api$1.messages?.send);
  const [content, setContent] = useState("");
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const trimmed = content.trim();
    if (!trimmed) return;
    setPending(true);
    const result = await ResultAsync.fromPromise(
      send({ content: trimmed }),
      (e2) => e2 instanceof Error ? e2 : new Error(String(e2))
    );
    setPending(false);
    if (result.isErr()) {
      setError(result.error.message);
      return;
    }
    setContent("");
  };
  return /* @__PURE__ */ jsxs(BaseIsland, { title: "Chat App", children: [
    /* @__PURE__ */ jsxs("form", { onSubmit, style: { display: "flex", gap: 8 }, children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          value: content,
          onChange: (e) => setContent(e.target.value),
          placeholder: "Say something…",
          style: {
            flex: 1,
            padding: "0.5rem",
            border: "1px solid #ddd",
            borderRadius: 6
          }
        }
      ),
      /* @__PURE__ */ jsx("button", { disabled: pending || !content.trim(), type: "submit", children: pending ? "Sending…" : "Send" })
    ] }),
    error ? /* @__PURE__ */ jsxs("p", { style: { color: "#b91c1c", marginTop: 8 }, children: [
      "Error: ",
      error
    ] }) : null,
    /* @__PURE__ */ jsx(
      "ul",
      {
        style: {
          listStyle: "none",
          padding: 0,
          marginTop: 12,
          display: "grid",
          gap: 8
        },
        children: list === void 0 ? /* @__PURE__ */ jsx("li", { children: "Loading messages…" }) : list.length === 0 ? /* @__PURE__ */ jsx("li", { children: "No messages yet. Say hello!" }) : list.map((m) => /* @__PURE__ */ jsxs(
          "li",
          {
            style: { padding: 8, border: "1px solid #eee", borderRadius: 6 },
            children: [
              /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: "#6b7280" }, children: [
                m.displayName || m.userId,
                " —",
                " ",
                new Date(m.createdAt).toLocaleString()
              ] }),
              /* @__PURE__ */ jsx("div", { children: m.content })
            ]
          },
          m._id
        ))
      }
    )
  ] });
}
const ChatApp = withErrorBoundary(ChatAppImpl, { boundaryId: "ChatApp" });

const registry = {
  chat: ChatApp
};
function getIslandBySlug(slug) {
  return registry[slug] || null;
}

const api = api$2;
function AppResolver({ slug }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const app = useQuery(
    api.apps?.getApp,
    isAuthenticated ? { slug } : "skip"
  );
  if (isLoading) return /* @__PURE__ */ jsx("p", { children: "Loading…" });
  if (!isAuthenticated) return /* @__PURE__ */ jsx("p", { children: "Please sign in to access apps." });
  if (app === void 0) return /* @__PURE__ */ jsx("p", { children: "Loading app…" });
  if (app === null) return /* @__PURE__ */ jsx("p", { children: "App not found." });
  const Island = getIslandBySlug(app.slug);
  return /* @__PURE__ */ jsxs("div", { style: { padding: "1rem" }, children: [
    /* @__PURE__ */ jsx("h2", { style: { fontSize: 20, fontWeight: 700 }, children: app.name }),
    /* @__PURE__ */ jsxs("p", { style: { color: "#6b7280" }, children: [
      "Slug: ",
      app.slug
    ] }),
    /* @__PURE__ */ jsx("div", { style: { marginTop: 12 }, children: Island ? /* @__PURE__ */ jsx(Island, {}) : /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          padding: 12,
          border: "1px dashed #ddd",
          borderRadius: 8
        },
        children: /* @__PURE__ */ jsx("p", { children: "No island registered for this app." })
      }
    ) })
  ] });
}
const AppResolver$1 = withAuthAndConvexProvider(
  withErrorBoundary(AppResolver, { boundaryId: "AppResolver" })
);

const $$Astro = createAstro();
const $$app = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$app;
  const { app } = Astro2.params;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="max-w-3xl mx-auto px-4 py-8"> ${app ? renderTemplate`${renderComponent($$result2, "AppResolver", AppResolver$1, { "client:load": true, "slug": app, "client:component-hydration": "load", "client:component-path": "/Users/andrewharvey/dev/ai-playground/src/components/islands/AppResolver.tsx", "client:component-export": "default" })}` : renderTemplate`<p>Invalid app slug.</p>`} </main> ` })}`;
}, "/Users/andrewharvey/dev/ai-playground/src/pages/apps/[app].astro", void 0);

const $$file = "/Users/andrewharvey/dev/ai-playground/src/pages/apps/[app].astro";
const $$url = "/apps/[app]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$app,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
