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

