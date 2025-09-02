Title: Audit secondary text contrast and tune tokens (AA 4.5:1)

Description:
- Verify contrast ratios for secondary text (gray on white) and links across light/dark themes.
- Adjust shared Tailwind theme tokens if any fall below 4.5:1 (AA body text). Prefer tweaks to `--muted-foreground` and related variables.

Acceptance Criteria:
- Documented contrast results for key text classes used in the app (e.g., `text-muted-foreground`).
- If any fail, update CSS variables and show before/after ratios; verify no visual regressions in other apps.
- Automated lint/check step or script that flags regressions (optional, e.g., using `axe-core` in a small Playwright check).

Estimated Effort/Complexity: M

Dependencies:
- None.

Relevant Files/Components:
- `packages/tailwind-config/shared-styles.css` (theme tokens)
- `apps/enrollment-dashboard/src/app/**/*.tsx` (verify usage sites)
