# ADR: Intake Operations via Convex SDK vs HTTP

## Description
Decide whether to implement intake create/status/section operations using the Convex client SDK directly from the app or via dedicated Convex HTTP endpoints.

Decision factors:
- Type safety and DX (SDK gives end-to-end types).
- CORS and cross-origin patterns.
- Auth model and propagation.
- Caching/CDN behavior and URL-addressable APIs.
- Consistency with other parts of the app (Phase 1 choices).

## Prerequisites
- None.

## Deliverables
- ADR markdown checked in (this file or a copy under `docs/adr/`), including chosen option and rationale.
- Clear guidance for subsequent implementation tasks (09–11).

## Acceptance Criteria
- Decision reviewed/approved by stakeholders.
- Next steps unambiguous for implementers.

## Suggested Template
```md
# ADR: Intakes API Surface (SDK vs HTTP)
- Status: Proposed / Accepted
- Context: \<why change is needed\>
- Options Considered: SDK | HTTP
- Decision: \<chosen option\>
- Rationale: \<key reasons\>
- Consequences: \<impact on testing, DX, performance\>
- Rollback Plan: \<how to revert if needed\>
```

