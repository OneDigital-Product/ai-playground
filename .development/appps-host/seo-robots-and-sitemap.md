Title: Unified robots.txt and Sitemap Aggregation

Intent
- Serve a single `robots.txt` and aggregate `sitemap.xml` from the gateway that reflect all child applications.

Why This Is Useful
- Centralizes crawl directives and discovery for the main domain.
- Avoids fragmentation or conflicting directives across child apps.

What This Should Do (Conceptually)
- Provide `/robots.txt` tailored per environment (e.g., disallow on previews).
- Expose `/sitemap.xml` that includes sitemap index entries pointing to child app sitemaps (e.g., web/admin).
- Ensure correct canonical URLs under the main domain, even though content is served by child apps.

Scope and Integration Points
- Add small route handlers under `src/app` for `robots.txt` and `sitemap.xml`.
- Optionally fetch child sitemap URLs or build them from env to avoid runtime fetch.

Risks and Considerations
- Keep generation fast; avoid runtime aggregation on hot path if remote fetch is slow.
- Ensure canonical/alternate links within child apps remain consistent with the host domain strategy.

Rollout and Validation
- Validate with search engine testing tools; confirm `200` responses and correct content-types.
- Acceptance: Single robots and sitemap accessible; search console recognizes aggregated sitemaps.

