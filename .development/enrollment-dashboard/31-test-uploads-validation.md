Title: Add unit tests for uploads validation (type and size)

Description
- Add tests to verify upload validation logic for file type and file size limits (25MB). Ensure mixed success/failure handling is correct in the upload action and delete flows are robust.

Acceptance Criteria
- Tests cover:
  - Rejecting files > 25MB with clear error messages.
  - Rejecting disallowed MIME types.
  - Accepting valid files and returning expected metadata.
  - Delete action removes storage object and DB record (mock storage is fine for tests).
- Tests pass consistently.

Implementation Notes
- Files:
  - `packages/backend/convex/functions/uploads.ts`
  - Add test file `packages/backend/convex/functions/__tests__/uploads.test.ts` (or similar) that imports the action/mutations and exercises validation branches.
- If needed, factor out `ALLOWED_MIME_TYPES` and `MAX_FILE_SIZE` into exported constants for testing.

Dependencies
- None

Estimated Effort
- 30–45 minutes

