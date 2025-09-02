import { test } from "node:test";
import assert from "node:assert";
import {
  validateUploadInput,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  performDeleteWithMocks,
} from "../uploads.js";

function makeFile({ sizeMB = 1, type = "application/pdf", name = "file.pdf" } = {}) {
  return { size: sizeMB * 1024 * 1024, type, name };
}

test("validateUploadInput rejects oversize files", () => {
  const file = makeFile({ sizeMB: 30, type: "application/pdf" });
  assert.throws(
    () => validateUploadInput(file),
    /exceeds maximum allowed size of 25MB/
  );
});

test("validateUploadInput rejects disallowed types", () => {
  const file = makeFile({ sizeMB: 5, type: "application/zip" });
  assert.throws(() => validateUploadInput(file), /File type .* is not allowed/);
});

test("validateUploadInput accepts allowed types under limit", () => {
  for (const type of ALLOWED_MIME_TYPES) {
    const file = makeFile({ sizeMB: 1, type });
    assert.doesNotThrow(() => validateUploadInput(file));
  }
  const edge = makeFile({ sizeMB: MAX_FILE_SIZE / 1024 / 1024 - 0.001, type: ALLOWED_MIME_TYPES[0] });
  assert.doesNotThrow(() => validateUploadInput(edge));
});

test("performDeleteWithMocks calls storage.delete and remover with correct args", async () => {
  const calls: Array<["delete" | "remove", unknown]> = [];
  const storage = { delete: async (key: string) => { calls.push(["delete", key]); } };
  const remover = async (args: { uploadId: string }) => { calls.push(["remove", args]); };
  const upload: { storedKey: string; _id: string } = { storedKey: "storage:abc123", _id: "upload123" };

  await performDeleteWithMocks(storage, remover, upload);

  assert.deepStrictEqual(calls, [
    ["delete", "storage:abc123"],
    ["remove", { uploadId: "upload123" }],
  ]);
});
