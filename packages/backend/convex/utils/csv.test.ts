import { test } from "node:test";
import assert from "node:assert";
import { escapeCsv, sortForExport } from "./csv.js";

test("escapeCsv - handles commas, quotes, and newlines", () => {
  assert.strictEqual(escapeCsv("simple"), "simple");
  assert.strictEqual(escapeCsv("has,comma"), '"has,comma"');
  assert.strictEqual(escapeCsv('has"quote'), '"has""quote"');
  assert.strictEqual(escapeCsv("has\nnewline"), '"has\nnewline"');
  assert.strictEqual(escapeCsv(123), "123");
  assert.strictEqual(escapeCsv(null), "");
  assert.strictEqual(escapeCsv(undefined), "");
});

test("sortForExport - sorts by dateReceived desc/asc", () => {
  const items = [
    { dateReceived: "2024-01-02T10:00:00.000Z", clientName: "B" },
    { dateReceived: "2024-01-03T10:00:00.000Z", clientName: "C" },
    { dateReceived: "2024-01-01T10:00:00.000Z", clientName: "A" },
  ];
  const desc = sortForExport(items, "dateReceived", "desc");
  assert.deepStrictEqual(desc.map((i) => i.clientName), ["C", "B", "A"]);
  const asc = sortForExport(items, "dateReceived", "asc");
  assert.deepStrictEqual(asc.map((i) => i.clientName), ["A", "B", "C"]);
});

test("sortForExport - case-insensitive string sorting", () => {
  const items = [
    { clientName: "beta" },
    { clientName: "Alpha" },
    { clientName: "gamma" },
  ];
  const asc = sortForExport(items, "clientName", "asc");
  assert.deepStrictEqual(asc.map((i) => i.clientName), ["Alpha", "beta", "gamma"]);
  const desc = sortForExport(items, "clientName", "desc");
  assert.deepStrictEqual(desc.map((i) => i.clientName), ["gamma", "beta", "Alpha"]);
});
