# AI Playground Platform v2 - Complete Architecture Blueprint

## 1. Executive Summary

This blueprint defines a modern, type-safe AI playground platform built with Astro, Islands Architecture, and Convex. The platform serves as a high-performance shell hosting multiple interactive AI applications while maintaining strict TypeScript enforcement and enterprise-grade security.

## 2. Core Architecture Principles

### 2.1 Technology Stack

- **Frontend Framework**: Astro with Islands Architecture
- **Backend**: Convex (real-time, reactive database)
- **Language**: TypeScript exclusively (no JavaScript allowed)
- **Authentication**: Convex Auth with Magic Links
- **Error Handling**: neverthrow library for Result/Option patterns
- **UI Components**: React/Preact for islands (TypeScript only)

### 2.2 Design Principles

- **Type Safety First**: End-to-end TypeScript with strict mode
- **Performance**: Static shell with dynamic islands
- **Security**: Domain-restricted authentication
- **Developer Experience**: Hot reload, type inference, error boundaries
- **Real-time**: Reactive data updates via Convex

## 3. Authentication & Authorization

### 3.1 Convex Auth Implementation

```typescript
// convex/auth.config.ts
import { convexAuth } from "@convex-dev/auth/server";
import { MagicLink } from "@convex-dev/auth/providers/MagicLink";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    MagicLink({
      id: "magiclink",
      maxAge: 60 * 60 * 24, // 24 hours
      async sendVerificationRequest({ identifier, url }) {
        // Email validation
        if (!identifier.endsWith("@onedigital.com")) {
          throw new Error("Only @onedigital.com emails are allowed");
        }
        // Send magic link via email service
      },
    }),
  ],
});
```

### 3.2 Domain Restriction

- Whitelist: Only `@onedigital.com` emails
- Validation at multiple layers:
  - Client-side form validation
  - Convex Auth provider validation
  - Database schema constraints

## 4. Error Handling with neverthrow

### 4.1 Result Pattern Implementation

```typescript
// src/lib/errors.ts
import { Result, Ok, Err } from "neverthrow";

export type AppError =
  | { type: "AUTH_ERROR"; message: string }
  | { type: "VALIDATION_ERROR"; field: string; message: string }
  | { type: "NETWORK_ERROR"; status: number; message: string }
  | { type: "CONVEX_ERROR"; code: string; message: string };

export const parseResult = <T>(data: unknown): Result<T, AppError> => {
  // Implementation
};
```

### 4.2 Component Error Boundaries

```typescript
// src/components/ErrorBoundary.tsx
import { Result } from "neverthrow";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback: (error: AppError) => ReactNode;
}

export class ErrorBoundary extends Component<Props> {
  // Error boundary implementation with neverthrow
}
```

## 5. Project Structure

```
ai-playground/
├── src/
│   ├── components/
│   │   ├── islands/           # Interactive TypeScript components
│   │   │   ├── ChatApp.tsx
│   │   │   ├── CodeEditor.tsx
│   │   │   └── DataVisualizer.tsx
│   │   ├── shell/             # Static Astro components
│   │   │   ├── Navigation.astro
│   │   │   ├── Footer.astro
│   │   │   └── Layout.astro
│   │   └── shared/            # Shared TypeScript utilities
│   │       ├── ErrorBoundary.tsx
│   │       └── AuthGuard.tsx
│   │
│   ├── lib/
│   │   ├── convex.ts         # Convex client setup
│   │   ├── errors.ts         # neverthrow error types
│   │   ├── auth.ts           # Auth utilities
│   │   └── validators.ts     # Type-safe validators
│   │
│   ├── pages/
│   │   ├── api/              # Astro API routes (if needed)
│   │   ├── apps/
│   │   │   ├── [app].astro   # Dynamic app routes
│   │   │   └── index.astro   # App directory
│   │   ├── auth/
│   │   │   ├── signin.astro
│   │   │   └── verify.astro
│   │   └── index.astro       # Homepage
│   │
│   └── types/
│       ├── global.d.ts       # Global type definitions
│       └── convex.d.ts       # Convex type augmentations
│
├── convex/
│   ├── _generated/           # Auto-generated Convex types
│   ├── schema.ts            # Database schema
│   ├── auth.config.ts       # Auth configuration
│   ├── users.ts             # User mutations/queries
│   ├── apps.ts              # App data functions
│   └── shared.ts            # Shared validators
│
├── public/
│   └── assets/
│
├── astro.config.mjs         # Astro configuration
├── tsconfig.json            # TypeScript config (strict mode)
├── package.json
└── .env.example             # Environment variables template
```

## 6. Database Schema (Convex)

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("user")),
    createdAt: v.number(),
    lastLogin: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .searchIndex("search_name", {
      searchField: "name",
    }),

  apps: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    icon: v.optional(v.string()),
    isActive: v.boolean(),
    config: v.any(), // App-specific configuration
    permissions: v.array(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["isActive"]),

  app_sessions: defineTable({
    userId: v.id("users"),
    appId: v.id("apps"),
    data: v.any(), // Session-specific data
    startedAt: v.number(),
    lastActivity: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_app", ["appId"]),
});
```

## 7. API Design Patterns (Convex)

### 7.1 Query Pattern with neverthrow

```typescript
// convex/apps.ts
import { query } from "./_generated/server";
import { v } from "convex/values";
import { Result, ok, err } from "neverthrow";

export const getApp = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { error: "UNAUTHORIZED" };
    }

    const app = await ctx.db
      .query("apps")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!app) {
      return { error: "NOT_FOUND" };
    }

    return { data: app };
  },
});
```

### 7.2 Mutation Pattern

```typescript
// convex/apps.ts
export const createAppSession = mutation({
  args: {
    appId: v.id("apps"),
    initialData: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email?.endsWith("@onedigital.com")) {
      throw new Error("Unauthorized domain");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const sessionId = await ctx.db.insert("app_sessions", {
      userId: user._id,
      appId: args.appId,
      data: args.initialData || {},
      startedAt: Date.now(),
      lastActivity: Date.now(),
    });

    return sessionId;
  },
});
```

## 8. Island Components Architecture

### 8.1 Base Island Component

```typescript
// src/components/islands/BaseIsland.tsx
import { ConvexProvider, useQuery } from "convex/react";
import { Result } from 'neverthrow';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import type { ReactNode } from 'react';

interface BaseIslandProps {
  children: ReactNode;
  appSlug: string;
}

export const BaseIsland: React.FC<BaseIslandProps> = ({ children, appSlug }) => {
  return (
    <ErrorBoundary fallback={(error) => <ErrorDisplay error={error} />}>
      <ConvexProvider client={convexClient}>
        {children}
      </ConvexProvider>
    </ErrorBoundary>
  );
};
```

### 8.2 Example AI App Island

```typescript
// src/components/islands/ChatApp.tsx
import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Result, ok, err } from 'neverthrow';

export const ChatApp: React.FC = () => {
  const [input, setInput] = useState('');
  const messages = useQuery(api.chat.getMessages);
  const sendMessage = useMutation(api.chat.send);

  const handleSend = async () => {
    const result = await sendMessage({ content: input })
      .then(ok)
      .catch(err);

    result.match(
      () => setInput(''),
      (error) => console.error('Failed to send:', error)
    );
  };

  return (
    <div className="chat-container">
      {/* Chat UI implementation */}
    </div>
  );
};
```

## 9. State Management

### 9.1 Global State via Convex

- All application state stored in Convex
- Real-time subscriptions for reactive updates
- No client-side state management libraries needed

### 9.2 Local State Pattern

```typescript
// src/hooks/useLocalState.ts
import { useState, useCallback } from "react";
import { Result, ok, err } from "neverthrow";

export function useLocalState<T>(
  initialValue: T,
  validator?: (value: T) => Result<T, Error>,
) {
  const [state, setState] = useState<T>(initialValue);

  const updateState = useCallback(
    (newValue: T): Result<void, Error> => {
      if (validator) {
        const result = validator(newValue);
        if (result.isErr()) {
          return err(result.error);
        }
      }
      setState(newValue);
      return ok(undefined);
    },
    [validator],
  );

  return [state, updateState] as const;
}
```

## 10. Security Considerations

### 10.1 Authentication Flow

1. User enters email on signin page
2. Client validates @onedigital.com domain
3. Convex Auth sends magic link
4. User clicks link, token validated
5. Session created with JWT
6. All subsequent requests include auth token

### 10.2 Security Headers

```typescript
// astro.config.mjs
export default defineConfig({
  security: {
    checkOrigin: true,
  },
  vite: {
    server: {
      headers: {
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      },
    },
  },
});
```

### 10.3 Data Validation

- Zod schemas for all user inputs
- Convex schema validation at database level
- TypeScript strict mode for compile-time safety

## 11. Development Workflow

### 11.1 Environment Setup

```bash
# .env.local
CONVEX_DEPLOYMENT=<your-deployment>
PUBLIC_CONVEX_URL=<your-convex-url>
EMAIL_SERVER=<smtp-config>
ALLOWED_DOMAIN=onedigital.com
```

### 11.2 Development Commands

```json
// package.json
{
  "scripts": {
    "dev": "astro dev",
    "dev:convex": "convex dev",
    "build": "tsc && astro build",
    "preview": "astro preview",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "lint": "eslint . --ext .ts,.tsx,.astro"
  }
}
```

### 11.3 TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@convex/*": ["convex/*"]
    }
  },
  "include": ["src/**/*", "convex/**/*"],
  "exclude": ["node_modules", "dist", ".astro"]
}
```

## 12. Performance Optimizations

### 12.1 Island Loading Strategy

- Lazy load islands with `client:visible`
- Preload critical islands with `client:load`
- Use `client:idle` for non-critical components

### 12.2 Bundle Optimization

```typescript
// astro.config.mjs
export default defineConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom"],
            "convex-vendor": ["convex/react", "convex/client"],
            utils: ["neverthrow", "zod"],
          },
        },
      },
    },
  },
});
```

## 13. Monitoring & Observability

### 13.1 Error Tracking

```typescript
// src/lib/monitoring.ts
import { Result } from "neverthrow";

export const trackError = (error: AppError, context?: Record<string, any>) => {
  // Send to monitoring service
  console.error("App Error:", error, context);

  // In production, send to service like Sentry
  if (import.meta.env.PROD) {
    // Sentry.captureException(error, { extra: context });
  }
};
```

### 13.2 Performance Metrics

- Core Web Vitals tracking
- Convex query performance monitoring
- Island hydration timing

## 14. Future Enhancements

### Phase 2 Considerations

- WebSocket support for real-time collaboration
- Advanced caching strategies
- Progressive Web App capabilities
- Offline support with service workers
- Multi-tenant architecture
- Advanced RBAC (Role-Based Access Control)

## 15. Conclusion

This architecture provides a robust, type-safe foundation for an AI playground platform with:

- **Performance**: Static shell with dynamic islands
- **Security**: Domain-restricted authentication
- **Developer Experience**: Full TypeScript with neverthrow
- **Scalability**: Convex handles real-time data at scale
- **Maintainability**: Clear separation of concerns

The platform is ready for immediate development with a clear path for future enhancements.
