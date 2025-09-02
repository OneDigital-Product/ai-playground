Title: Add unit tests for uploads validation (type and size)

Description
- Add tests to verify upload validation logic for file type and file size limits (25MB). Ensure mixed success/failure handling is correct and a mock delete flow removes both the storage object and DB record in principle.

Acceptance Criteria
- Tests cover:
  - Rejecting files > 25MB with clear error messages.
  - Rejecting disallowed MIME types.
  - Accepting valid files and returning no errors.
  - Delete mock invokes storage delete and a record remover with proper arguments.
- Tests pass consistently.

Implementation Notes
- Files:
  - `packages/backend/convex/functions/uploads.ts`
    - Exported `ALLOWED_MIME_TYPES`, `MAX_FILE_SIZE`, `validateUploadInput`, and `performDeleteWithMocks`.
    - `uploadFile` action reuses `validateUploadInput`.
  - Added `packages/backend/convex/functions/__tests__/uploads.test.ts` using node:test/assert with simple mocks.

Dependencies
- None

Estimated Effort
- 30–45 minutes

