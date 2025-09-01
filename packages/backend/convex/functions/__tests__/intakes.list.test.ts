// @ts-nocheck
import { test } from "node:test";
import assert from "node:assert";
import { applyFiltersAndSorting } from "../helpers/listFilters.js";

const sample = [
  {
    intakeId: "EG-2025-AAAA",
    clientName: "Alpha Co",
    planYear: 2025,
    requestorName: "Jane Smith",
    requestedProductionTime: "Standard",
    status: "STARTED",
    complexityBand: "Low",
    dateReceived: "2024-01-01T12:00:00.000Z",
  },
  {
    intakeId: "EG-2025-BBBB",
    clientName: "Beta LLC",
    planYear: 2026,
    requestorName: "John Doe",
    requestedProductionTime: "Rush",
    status: "ROADBLOCK",
    complexityBand: "High",
    dateReceived: "2024-02-01T12:00:00.000Z",
  },
  {
    intakeId: "EG-2025-CCCC",
    clientName: "Gamma Inc",
    planYear: 2025,
    requestorName: "Emily Chen",
    requestedProductionTime: "Standard",
    status: "NOT_STARTED",
    complexityBand: "Minimal",
    dateReceived: "2024-03-01T12:00:00.000Z",
  },
];

test("filters: status single and multi", () => {
  const single = applyFiltersAndSorting(sample, { status: ["STARTED"], sortBy: "clientName", order: "asc" });
  assert.strictEqual(single.length, 1);
  assert.strictEqual(single[0].intakeId, "EG-2025-AAAA");

  const multi = applyFiltersAndSorting(sample, { status: ["STARTED", "ROADBLOCK"], sortBy: "clientName", order: "asc" });
  assert.strictEqual(multi.length, 2);
  assert.deepStrictEqual(multi.map((i) => i.intakeId).sort(), ["EG-2025-AAAA", "EG-2025-BBBB"]);
});

test("filters: complexityBand", () => {
  const res = applyFiltersAndSorting(sample, { complexityBand: ["High", "Minimal"], sortBy: "clientName", order: "asc" });
  assert.strictEqual(res.length, 2);
});

test("filters: requestor substring", () => {
  const res = applyFiltersAndSorting(sample, { requestorName: "em", sortBy: "clientName", order: "asc" });
  assert.strictEqual(res.length, 1);
  assert.strictEqual(res[0].requestorName, "Emily Chen");
});

test("filters: planYear and production time", () => {
  const res = applyFiltersAndSorting(sample, { planYear: 2025, requestedProductionTime: ["Standard"], sortBy: "clientName", order: "asc" });
  assert.strictEqual(res.length, 2);
  assert.ok(res.every((i) => i.planYear === 2025 && i.requestedProductionTime === "Standard"));
});

test("sorting: clientName asc and dateReceived desc", () => {
  const byName = applyFiltersAndSorting(sample, { sortBy: "clientName", order: "asc" });
  assert.deepStrictEqual(byName.map((i) => i.clientName), ["Alpha Co", "Beta LLC", "Gamma Inc"]);

  const byDateDesc = applyFiltersAndSorting(sample, { sortBy: "dateReceived", order: "desc" });
  assert.deepStrictEqual(byDateDesc.map((i) => i.intakeId), ["EG-2025-CCCC", "EG-2025-BBBB", "EG-2025-AAAA"]);
});

