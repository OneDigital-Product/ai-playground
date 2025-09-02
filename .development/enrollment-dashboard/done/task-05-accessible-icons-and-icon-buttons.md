Title: Ensure accessible icons and icon-only buttons

Description:
- Audit interactive controls that use icons and ensure they have discernible names. Icon-only buttons must include `aria-label`.
- Decorative icons inside labeled controls must be hidden from assistive tech (`aria-hidden="true"`, `focusable="false"`).

Acceptance Criteria:
- Axe/ARIA lints report no “element has no accessible name” violations for icon buttons (e.g., remove file, overflow menu).
- Decorative icons (e.g., lucide-react icons) inside labeled buttons/links are not exposed to the accessibility tree.
- Visual appearance unchanged.

Estimated Effort/Complexity: S

Dependencies:
- None.

Relevant Files/Components:
- `apps/enrollment-dashboard/src/components/upload-dropzone.tsx` (Remove file “X” button)
- `apps/enrollment-dashboard/src/components/upload-list.tsx` (More menu trigger, icon buttons)
- Shared pattern: consider a tiny wrapper `Icon` utility in `@repo/ui` if helpful (optional)
