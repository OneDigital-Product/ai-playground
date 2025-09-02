# Design Review Summary

Strong foundation: the dashboard feels clear, purposeful, and consistent. Cards, headings, and copy are
straightforward, and the form structure is comprehensive. Navigation is fast and mostly smooth. However, a few
primary-flow gaps and accessibility polish items block production‑grade quality.

Screenshots

- Desktop home: /var/folders/.../home-desktop.png
- Tablet home: /var/folders/.../home-tablet.png
- Mobile home: /var/folders/.../home-mobile.png
- Desktop intake: /var/folders/.../intake-desktop.png
- Tablet intake: /var/folders/.../intake-tablet.png
- Mobile intake: /var/folders/.../intake-mobile.png
- Button hover: /var/folders/.../hover-create-intake.png

## Findings

#### Blockers

- Primary intake creation doesn’t complete: Clicking “Create Intake” after filling required fields keeps the
page in place with a generic error banner and no success indication or navigation. This stalls the core flow
and leaves the user uncertain whether anything was saved. Evidence: intake page remains at /intakes/new after
submission; no success state is presented. Screenshot: intake-desktop.png.
- File upload flow is non-functional: “Upload Files” on /uploads does not open an uploader, dialog, or
navigation. The key CTA appears to do nothing, leaving the feature inaccessible. Evidence from interaction
on /uploads.

#### High-Priority

- Input validation clarity: The “Payroll Storage URL” accepts a non-URL value without an inline error. This
invites data quality issues and creates rework later. Evidence: attempted “not-a-url” successfully passes
required validation; no format guidance shown.
- Missing success/empty/load states on form submit: There’s no visible success toast, redirect, or inline
confirmation, and no loading progress when submitting. This creates uncertainty and encourages repeated
clicks.
- Accessible name and icon semantics: The dev tools button contains an image without a discernible alt
attribute. While the button has text, decorative images in controls should be ignored by assistive tech to
avoid noise. Lack of explicit treatment risks inconsistent AT output.

#### Medium-Priority / Suggestions

- Mobile ergonomics on long form: The intake page is extremely long on mobile. While it stacks correctly and
has no horizontal scroll, the length increases cognitive load. Consider grouping sections with an in-page
index or collapsible groups to aid orientation. Evidence: intake-mobile.png.
- Section radio groups repetition: The many repeated “Include in Guide” / “Changes Beyond Annual Updates”
pairs create scanning fatigue. Clearer section dividers or sticky subheaders could improve wayfinding.
- Focus management: On submit, focus doesn’t move to the first invalid field or error banner. Users navigating
by keyboard need clear focus placement to the problem area to correct quickly.
- Secondary text contrast check: Body copy appears light on white. It likely passes, but confirm 4.5:1 across
themes, especially gray-on-white and link-on-white states.
- Dashboard CTA hierarchy: The three top cards are balanced, but the primary action for first-time users
competes equally with others. Elevating the “Manage Intakes” or “Create First Intake” path would reduce choice
paralysis.

#### Nitpicks

- Nit: Button hover/active states feel slightly subtle on dark backgrounds, making state feedback less
pronounced than on light buttons. Screenshot: hover-create-intake.png.
- Nit: The Quick Start block sits quite far below the hero line; it’s discoverable but feels visually
disconnected from the card row above.
- Nit: Minor layout jumps during Fast Refresh in dev (not a prod issue), but worth keeping an eye on for
perceived smoothness.

### Phase Notes

- Interaction & User Flow
    - Home → Intakes → New Intake executed. Perceived performance is snappy.
    - Destructive confirmations: not applicable in current paths; no destructive actions surfaced.
    - Destructive confirmations: not applicable in current paths; no destructive actions surfaced.
- 
Responsiveness
    - 1440/768/375 verified. No horizontal scroll detected at 375 (hasHScroll: false). Layout stacks cleanly
on tablet and mobile. Evidence: home-* and intake-* screenshots.
- 
Visual Polish
    - Headings, spacing, and cards are consistent and calm. Visual hierarchy is clear on the home page; the
intake form could benefit from stronger sectional cues.
- 
Accessibility (WCAG 2.1 AA)
    - Keyboard: Tabbing works and visible focus is present (outline is applied). Enter key activates links/
buttons.
    - Semantics: Form controls expose accessible names (Playwright queries by role/name succeeded), but image
within a button lacks explicit decorative handling.
    - Labels: Required indicators present; association appears correct via accessible names.
    - Focus on errors: Focus does not move to the first error on submit; error guidance is only visual at
the top.
    - Contrast: Primary buttons appear high contrast (white text on dark navy).
    - Contrast audit (automated): Ran axe-core color-contrast checks on the Intake form in both light and dark themes.
      - Light theme violations: 0
      - Dark theme violations: 0
      - Key token checked: `--muted-foreground` (used via `text-muted-foreground`) against `--background`.
      - Conclusion: All secondary/paragraph text met AA 4.5:1; no token changes required.

#### Token Contrast Notes

- Light theme
  - background: `--background: oklch(1 0 0)`
  - muted-foreground: `--muted-foreground: oklch(0.556 0 0)`
  - axe-core on representative page: 0 violations (color-contrast)

- Dark theme
  - background: `--background: oklch(17.98% 0.037 232.57)`
  - muted-foreground: `--muted-foreground: oklch(65% 0.015 240)`
  - axe-core on representative page: 0 violations (color-contrast)

No changes made to `packages/tailwind-config/shared-styles.css`.
- 
Robustness
    - Validation: Required-field validation works; format validation for URL is absent/unclear.
    - Empty states: “Recent Intakes” and “Recent Uploads” show friendly empties.
    - Loading/error states: Missing on submit; no progress or inline field-level errors for format issues.
- 
Code Health (surface-level)
    - UI feels unified and consistent with a shared system. Repeated radio group blocks suggest an opportunity
for a reusable “section config” primitive to reduce duplication and improve maintainability.
- 
Content & Console
    - Copy is concise and free of grammar issues.
    - Console: clean during testing, aside from standard React DevTools notice. An initial 404 was observed
once during the first load but not reproducible later.
