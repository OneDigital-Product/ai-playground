# UI Package — Card Density Variant

**⚠️ IMPORTANT: Before making UI changes, read `TAILWIND_V4_MONOREPO_GUIDE.md` in the repo root for critical spacing patterns and import rules.**

This document explains the new density prop supported by Card components in the shared UI package. It centralizes spacing control (comfortable vs compact vs auto) and lets apps opt into different layouts without hand-written class overrides.

## Overview
- Card, CardHeader, CardContent, and CardFooter now accept a density prop.
- Two options:
  - comfortable (default): preserves existing spacing across apps.
  - compact: tighter spacing for data-dense pages (e.g., dashboards, forms, tables).
- Implemented with class-variance-authority (cva); defaults are backward compatible.

## Usage examples
Basic example with compact density:

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@repo/ui/components/ui/card";

export function Example() {
  return (
    <Card density="compact">
      <CardHeader density="compact">
        <CardTitle>Compact Card</CardTitle>
      </CardHeader>
      <CardContent density="compact" className="space-y-3">
        {/* Content */}
      </CardContent>
      <CardFooter density="compact">
        {/* Actions */}
      </CardFooter>
    </Card>
  );
}
```

Explicitly using the default (comfortable):

```tsx
<Card>
  <CardHeader>
    <CardTitle>Comfortable Card</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

Or explicitly setting comfortable:

```tsx
<Card density="comfortable">{/* ... */}</Card>
```

## Available components
The following components support the density prop:
- Card
- CardHeader
- CardContent
- CardFooter

Note: CardTitle, CardDescription, and CardAction do not require density.

## Visual differences
- Comfortable (default):
  - Card: gap-6, py-6
  - CardHeader: bottom padding applied when bordered ([.border-b]:pb-6)
  - CardFooter: top padding applied when bordered ([.border-t]:pt-6)
- Compact:
  - Card: gap-4, py-5
  - CardHeader: consistent pb-4 (and [.border-b]:pb-4)
  - CardFooter: consistent pt-4 (and [.border-t]:pt-4)

These compact values mirror the app-level overrides used previously in enrollment-dashboard.

## Migration guidance
- Replace manual className spacing overrides with density="compact" at the usage site.
- Typical changes:
  - <Card className="gap-4 py-5"> → <Card density="compact">
  - <CardHeader className="pb-4"> → <CardHeader density="compact">
  - <CardContent className="space-y-3"> → keep the space-y-* utility if needed for inner stacks; also add density="compact" to align with the variant
  - <CardFooter className="pt-4"> → <CardFooter density="compact">
- Keep any special padding overrides (e.g., className="p-0") where required for tables or charts; density does not remove those custom classes.

Tip: Apply density at all three (Card, CardHeader, CardContent/Footer) for predictable spacing.

## Backward compatibility
- Default density is comfortable, so existing apps are unaffected until they opt into compact.
- The compact variant is intentionally conservative: it only adjusts major vertical spacing so it’s safe to adopt without disrupting layout structure.

## Reference implementation
- apps/enrollment-dashboard: migrated to density="compact" across home, dashboard, uploads, intake form, and intake detail pages; verified to visually match previous manual overrides.

# Standardized Navigation (AppShell)

This package includes a reusable, cross-app navigation system that aligns with our design principles and works in both Next.js (admin/docs/host) and Astro (web) apps.

Key goals
- Consistent navigation patterns (persistent left sidebar, optional top bar)
- Prominent home return from any location
- Accessible (keyboard, focus rings, aria-current)
- Density-aware (comfortable | compact) to match app needs
- Framework-neutral link rendering with optional `linkComponent`

Primary API
- `AppShell` — layout wrapper with topbar + sidebar + mobile drawer
- `SidebarNav` — standalone sidebar list if you only need the nav

Types
```ts
type NavItem = { label: string; href: string; icon?: IconType; badge?: React.ReactNode; exact?: boolean };
type NavSection = { label?: string; items: NavItem[]; collapsible?: boolean; defaultOpen?: boolean };
type Density = "comfortable" | "compact";
```

Usage — AppShell (recommended)
```tsx
import AppShell, { SidebarNav, type NavSection } from "@repo/ui/components/navigation/app-nav";
import { Home, LayoutDashboard, Users, Settings } from "lucide-react";

const sections: NavSection[] = [
  {
    label: "Overview",
    collapsible: false,
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Management",
    collapsible: true,
    defaultOpen: true,
    items: [
      { label: "People", href: "/people", icon: Users },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export default function PageLayout({ children, pathname }: { children: React.ReactNode; pathname: string }) {
  return (
    <AppShell
      home={{ label: "Home", href: "/", icon: Home }}
      sections={sections}
      currentPath={pathname}
      density="compact" // or "comfortable"
      // linkComponent={Link} // Optional: pass Next.js Link to prefetch
      topbarActions={null}
    >
      {children}
    </AppShell>
  );
}
```

Usage — Next.js with basePath
- Always pass the correct `home.href` and item `href`s (including basePath), or compute them via router helpers.
- For active states, pass `currentPath` from `usePathname()`.
- Optional: pass `linkComponent={Link}` to use Next’s `<Link>` for prefetch.

Usage — Astro (apps/web)
- Use plain `<a>` (default). Pass the current path via `Astro.url.pathname` into the component.

Density guidance
- Default is `compact`, matching dashboard needs (per repo spacing guidelines).
- `comfortable` increases paddings/gaps if a flow benefits from more whitespace.

Accessibility & behaviour
- Keyboard reachable; visible focus rings; `aria-current="page"` on active links.
- Mobile: top bar includes a hamburger that opens a left Sheet with the same nav.
- Home is always visible in top bar and at the top of the sidebar.

Notes
- Icons are optional; we use `lucide-react` where needed.
- No framework-specific router code is embedded; apps control URLs and active path.
- The component does not force content padding; apply per-page spacing as appropriate.
