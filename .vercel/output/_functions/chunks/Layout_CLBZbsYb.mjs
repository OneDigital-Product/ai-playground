import { e as createComponent, m as maybeRenderHead, k as renderComponent, r as renderTemplate, f as createAstro, h as addAttribute, l as renderHead, n as renderSlot } from './astro/server_C8XUooFx.mjs';
import 'kleur/colors';
/* empty css                         */
import { jsx } from 'react/jsx-runtime';
import { ConvexReactClient, ConvexProvider, useConvexAuth } from 'convex/react';
import { ConvexAuthProvider, useAuthActions } from '@convex-dev/auth/react';
import React, { Component } from 'react';

const PUBLIC_CONVEX_URL = "http://localhost:5173/fake-convex";
const client = new ConvexReactClient(PUBLIC_CONVEX_URL);
function withAuthAndConvexProvider(Component) {
  return function WithProviders(props) {
    return React.createElement(
      ConvexProvider,
      { client },
      React.createElement(ConvexAuthProvider, {
        client,
        children: React.createElement(Component, { ...props })
      })
    );
  };
}

const env = typeof process !== "undefined" && process.env?.NODE_ENV || "development";
const isProd = env === "production";
function format(level, message, meta) {
  const ts = (/* @__PURE__ */ new Date()).toISOString();
  return { ts, level, message, meta };
}
const logger = {
  debug(message, meta) {
    if (!isProd) console.debug(format("debug", message, meta));
  },
  info(message, meta) {
    if (!isProd) console.info(format("info", message, meta));
  },
  warn(message, meta) {
    console.warn(format("warn", message, meta));
  },
  error(message, meta) {
    console.error(format("error", message, meta));
  }
};

class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    logger.error("ErrorBoundary caught error", {
      error,
      componentStack: info?.componentStack,
      boundaryId: this.props.boundaryId
    });
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? /* @__PURE__ */ jsx(
        "div",
        {
          style: {
            padding: 12,
            border: "1px solid #fee2e2",
            background: "#fef2f2",
            color: "#991b1b",
            borderRadius: 8
          },
          children: /* @__PURE__ */ jsx("strong", { children: "Something went wrong." })
        }
      );
    }
    return this.props.children;
  }
}
function withErrorBoundary(Wrapped, options) {
  return function ComponentWithBoundary(props) {
    return /* @__PURE__ */ jsx(
      ErrorBoundary,
      {
        fallback: options?.fallback,
        boundaryId: options?.boundaryId,
        children: /* @__PURE__ */ jsx(Wrapped, { ...props })
      }
    );
  };
}

function AuthStatus() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  if (isLoading) return /* @__PURE__ */ jsx("span", { children: "Loading…" });
  if (!isAuthenticated) {
    return /* @__PURE__ */ jsx(
      "a",
      {
        href: "/auth/signin",
        style: { textDecoration: "none", color: "inherit" },
        children: "Sign in"
      }
    );
  }
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: () => signOut(),
      style: {
        border: "1px solid #ddd",
        padding: "0.25rem 0.5rem",
        borderRadius: 6,
        background: "white",
        cursor: "pointer"
      },
      children: "Sign out"
    }
  );
}
const AuthStatus$1 = withAuthAndConvexProvider(
  withErrorBoundary(AuthStatus, { boundaryId: "AuthStatus" })
);

const $$Navigation = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<header style="border-bottom: 1px solid #eee; padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between;"> <a href="/" style="font-weight: 700; text-decoration: none; color: inherit;">AI Playground</a> <nav style="display: flex; gap: 1rem; align-items: center;"> <a href="/" style="text-decoration: none; color: inherit;">Home</a> <a href="/apps/chat" style="text-decoration: none; color: inherit;">Chat</a> <!-- React island for auth status / sign-in/out --> <div> ${renderComponent($$result, "AuthStatus", AuthStatus$1, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/andrewharvey/dev/ai-playground/src/components/islands/AuthStatus.tsx", "client:component-export": "default" })} </div> </nav> </header>`;
}, "/Users/andrewharvey/dev/ai-playground/src/components/shell/Navigation.astro", void 0);

const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>AI Playground</title>${renderHead()}</head> <body> ${renderComponent($$result, "Navigation", $$Navigation, {})} ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "/Users/andrewharvey/dev/ai-playground/src/layouts/Layout.astro", void 0);

export { $$Layout as $, withAuthAndConvexProvider as a, withErrorBoundary as w };
