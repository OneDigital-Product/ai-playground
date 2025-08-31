## Cross-repo or decoupled type consumption

If you need to consume the backend from outside the monorepo (or prefer a pinned API surface):
- Add `convex-helpers` and generate a portable API file:
  - `pnpm --filter @repo/backend add -D convex-helpers`
  - `pnpm --filter @repo/backend exec npx convex-helpers ts-api-spec`
- Commit the generated API file to `packages/backend/convex/_generated/` or publish it under a subpath export; consumers can import that file directly.