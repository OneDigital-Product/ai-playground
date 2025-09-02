# Tailwind v4 Monorepo Configuration Guide

## Quick Setup for New Apps

When adding a new app to the monorepo, follow this exact pattern to ensure consistent spacing:

### 1. Global CSS File Structure

Create your app's global CSS file with this exact structure:

```css
/* apps/[your-app]/app/globals.css or similar */

/* Import shared theme ONCE - this includes Tailwind */
@import "@repo/tailwind-config";

/* App-specific overrides if needed */
:root {
  /* Your app's custom CSS variables */
}
```

**NEVER do this (causes double import):**
```css
/* WRONG - causes spacing issues */
@import "tailwindcss";
@import "@repo/tailwind-config"; 
```

### 2. Component Usage Pattern

When using shared UI components, choose the appropriate pattern:

#### Option A: App Controls All Spacing (Recommended)
```tsx
// Components use "auto" density by default - no built-in spacing
import { Card, CardContent } from "@repo/ui/components/ui/card"

// App provides ALL spacing via className
<Card className="p-6 gap-4">
  <CardContent className="space-y-3">
    {/* content */}
  </CardContent>
</Card>
```

#### Option B: Use Density Presets
```tsx
// Use built-in density variants for consistency
<Card density="compact"> {/* Uses gap-4 py-5 */}
  <CardContent density="compact">
    {/* content */}
  </CardContent>
</Card>
```

### 3. Package.json Configuration

Ensure your app's package.json includes:

```json
{
  "dependencies": {
    "@repo/ui": "workspace:*",
    "@repo/tailwind-config": "workspace:*"
  }
}
```

For Next.js apps, add to `next.config.ts`:
```ts
const nextConfig: NextConfig = {
  transpilePackages: ["@repo/ui", "@repo/backend"],
  // ... other config
}
```

## Architecture Principles

### 1. Single Tailwind Import Rule
- Tailwind CSS must be imported exactly ONCE per app
- Always import via `@repo/tailwind-config` 
- Never import `tailwindcss` directly in app CSS files
- The shared config already includes `@import "tailwindcss"`

### 2. Component Spacing Philosophy
- **Default to "auto" density**: Components ship with minimal spacing
- **Apps control layout**: Page-level spacing is an app concern
- **Density variants available**: Use when you need consistent spacing across apps
- **Avoid compounding**: Be aware that component + page spacing can compound

### 3. CSS Layer Organization
```
1. Theme layer (@repo/tailwind-config)
   - CSS variables
   - Theme tokens
   - Base resets

2. Component layer (@repo/ui)
   - Component-specific styles
   - Density variants
   - NO Tailwind import here

3. App layer (apps/*)
   - Page layouts
   - App-specific overrides
   - Custom utilities
```

## Common Issues & Solutions

### Issue: Components render with too much spacing
**Cause**: Double Tailwind import + component defaults + app spacing
**Solution**: 
1. Remove duplicate `@import "tailwindcss"` 
2. Use `density="auto"` or explicit density
3. Reduce app-level spacing utilities

### Issue: Inconsistent spacing between apps
**Cause**: Each app using different spacing patterns
**Solution**: 
1. Standardize on density variants OR
2. Create app-level spacing tokens:
```css
/* In app globals.css */
:root {
  --app-container-padding: 1rem; /* 16px */
  --app-stack-spacing: 0.75rem; /* 12px */
  --app-grid-gap: 1rem; /* 16px */
}
```

### Issue: Components don't respect app's spacing
**Cause**: Component has hardcoded spacing values
**Solution**: Update component to use:
1. CSS custom properties for spacing
2. Density variants with clear defaults
3. Allow className overrides

## Migration Checklist

For existing apps experiencing spacing issues:

- [ ] Remove duplicate `@import "tailwindcss"` from app globals
- [ ] Keep only `@import "@repo/tailwind-config"`
- [ ] Update Card usage to specify density or spacing
- [ ] Remove `/packages/ui/src/styles.css` import if present
- [ ] Test with `pnpm build` to ensure no CSS conflicts
- [ ] Verify consistent rendering across apps

## Testing Spacing Consistency

Run this check after making changes:

```bash
# Build all apps
pnpm build

# Check for duplicate Tailwind imports
grep -r "@import \"tailwindcss\"" apps/ packages/

# Should only appear in:
# - packages/tailwind-config/shared-styles.css

# Check for conflicting styles
grep -r "styles.css" apps/*/app/globals.css apps/*/src/styles/

# Components should use data-slot attributes
grep -r "data-slot=" packages/ui/src/components/
```

## Recommended App Spacing Defaults

Based on the monorepo's design system:

```css
/* App containers */
.page-container { @apply p-4 md:p-6; }

/* Stacks (vertical spacing) */
.stack-tight { @apply space-y-2; }
.stack-normal { @apply space-y-3; }
.stack-loose { @apply space-y-4; }

/* Grids */
.grid-tight { @apply gap-3; }
.grid-normal { @apply gap-4; }
.grid-loose { @apply gap-6; }

/* Cards (when not using density prop) */
.card-compact { @apply p-4 gap-3; }
.card-normal { @apply p-5 gap-4; }
.card-comfortable { @apply p-6 gap-6; }
```

## Future Improvements

Consider these enhancements for better maintainability:

1. **Tailwind v4 Config Package Enhancement**
   - Add spacing scale configuration
   - Define component-specific tokens
   - Export PostCSS config for consistency

2. **Component Library Patterns**
   - Implement consistent density API across all components
   - Use CSS custom properties for all spacing values
   - Add Storybook to visualize spacing variants

3. **Build-Time Validation**
   - Add linting for duplicate Tailwind imports
   - Validate consistent density usage
   - Check for spacing anti-patterns

---

This guide ensures consistent spacing across your Turborepo monorepo. Follow these patterns for predictable, maintainable component spacing.
