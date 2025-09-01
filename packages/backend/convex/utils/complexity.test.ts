// @ts-nocheck
import { test } from "node:test";
import assert from "node:assert";
import { calculateComplexity } from "./complexity.js";

test("complexity calculation - boundary cases for band transitions", () => {
  // Test 0-3 => Minimal
  assert.deepEqual(
    calculateComplexity({ sections_changed_flags: { A: false, B: false, C: false, D: false, E: false, F: false, G: false, H: false, I: false, J: false, K: false, L: false, M: false, N: false, O: false, P: false, Q: false } }),
    { score: 0, band: "Minimal" }
  );

  assert.deepEqual(
    calculateComplexity({ sections_changed_flags: { A: true, B: true, C: true, D: false, E: false, F: false, G: false, H: false, I: false, J: false, K: false, L: false, M: false, N: false, O: false, P: false, Q: false } }),
    { score: 3, band: "Minimal" }
  );

  // Test 4-8 => Low
  assert.deepEqual(
    calculateComplexity({ sections_changed_flags: { A: true, B: true, C: true, D: true, E: false, F: false, G: false, H: false, I: false, J: false, K: false, L: false, M: false, N: false, O: false, P: false, Q: false } }),
    { score: 4, band: "Low" }
  );

  assert.deepEqual(
    calculateComplexity({ sections_changed_flags: { A: true, B: true, C: true, D: true, E: true, F: true, G: true, H: true, I: false, J: false, K: false, L: false, M: false, N: false, O: false, P: false, Q: false } }),
    { score: 8, band: "Low" }
  );

  // Test 9-15 => Medium
  assert.deepEqual(
    calculateComplexity({ sections_changed_flags: { A: true, B: true, C: true, D: true, E: true, F: true, G: true, H: true, I: true, J: false, K: false, L: false, M: false, N: false, O: false, P: false, Q: false } }),
    { score: 9, band: "Medium" }
  );

  assert.deepEqual(
    calculateComplexity({ sections_changed_flags: { A: true, B: true, C: true, D: true, E: true, F: true, G: true, H: true, I: true, J: true, K: true, L: true, M: true, N: true, O: true, P: false, Q: false } }),
    { score: 15, band: "Medium" }
  );

  // Test 16+ => High
  assert.deepEqual(
    calculateComplexity({ sections_changed_flags: { A: true, B: true, C: true, D: true, E: true, F: true, G: true, H: true, I: true, J: true, K: true, L: true, M: true, N: true, O: true, P: true, Q: false } }),
    { score: 16, band: "High" }
  );
});

test("complexity calculation - guide type scoring", () => {
  // New Guide Build adds 15 points
  assert.deepEqual(
    calculateComplexity({
      sections_changed_flags: { A: true, B: true, C: false, D: false, E: false, F: false, G: false, H: false, I: false, J: false, K: false, L: false, M: false, N: false, O: false, P: false, Q: false },
      guide_type: "New Guide Build"
    }),
    { score: 17, band: "High" }
  );

  // Update Existing Guide adds 0 points
  assert.deepEqual(
    calculateComplexity({
      sections_changed_flags: { A: true, B: true, C: false, D: false, E: false, F: false, G: false, H: false, I: false, J: false, K: false, L: false, M: false, N: false, O: false, P: false, Q: false },
      guide_type: "Update Existing Guide"
    }),
    { score: 2, band: "Minimal" }
  );
});

test("complexity calculation - communications add-ons scoring", () => {
  // OE Letter adds 3 points
  assert.deepEqual(
    calculateComplexity({
      sections_changed_flags: { A: true, B: false, C: false, D: false, E: false, F: false, G: false, H: false, I: false, J: false, K: false, L: false, M: false, N: false, O: false, P: false, Q: false },
      communications_add_ons: "OE Letter"
    }),
    { score: 4, band: "Low" }
  );

  // OE Presentation adds 5 points
  assert.deepEqual(
    calculateComplexity({
      sections_changed_flags: { A: true, B: false, C: false, D: false, E: false, F: false, G: false, H: false, I: false, J: false, K: false, L: false, M: false, N: false, O: false, P: false, Q: false },
      communications_add_ons: "OE Presentation"
    }),
    { score: 6, band: "Low" }
  );

  // Both adds 10 points
  assert.deepEqual(
    calculateComplexity({
      sections_changed_flags: { A: true, B: false, C: false, D: false, E: false, F: false, G: false, H: false, I: false, J: false, K: false, L: false, M: false, N: false, O: false, P: false, Q: false },
      communications_add_ons: "Both"
    }),
    { score: 11, band: "Medium" }
  );

  // None and Other add 0 points
  assert.deepEqual(
    calculateComplexity({
      sections_changed_flags: { A: true, B: false, C: false, D: false, E: false, F: false, G: false, H: false, I: false, J: false, K: false, L: false, M: false, N: false, O: false, P: false, Q: false },
      communications_add_ons: "None"
    }),
    { score: 1, band: "Minimal" }
  );

  assert.deepEqual(
    calculateComplexity({
      sections_changed_flags: { A: true, B: false, C: false, D: false, E: false, F: false, G: false, H: false, I: false, J: false, K: false, L: false, M: false, N: false, O: false, P: false, Q: false },
      communications_add_ons: "Other"
    }),
    { score: 1, band: "Minimal" }
  );
});

test("complexity calculation - integration test case from requirements", () => {
  // Creating an intake with C & D changes (2), guideType=New Guide Build (15) => score ≥ 17 => High
  assert.deepEqual(
    calculateComplexity({
      sections_changed_flags: { A: false, B: false, C: true, D: true, E: false, F: false, G: false, H: false, I: false, J: false, K: false, L: false, M: false, N: false, O: false, P: false, Q: false },
      guide_type: "New Guide Build"
    }),
    { score: 17, band: "High" }
  );
});

test("complexity calculation - property test: increasing sections never decreases band", () => {
  const baseSections = { A: false, B: false, C: false, D: false, E: false, F: false, G: false, H: false, I: false, J: false, K: false, L: false, M: false, N: false, O: false, P: false, Q: false };
  
  // Test that adding more sections never decreases the score or band
  let previousScore = 0;
  const bands = ["Minimal", "Low", "Medium", "High"];
  let previousBandIndex = 0;
  
  for (let i = 0; i < 17; i++) {
    const sections = { ...baseSections };
    const sectionKeys = Object.keys(sections) as Array<keyof typeof sections>;
    
    // Set the first i sections to true
    for (let j = 0; j < i; j++) {
      if (sectionKeys[j]) {
        sections[sectionKeys[j]] = true;
      }
    }
    
    const result = calculateComplexity({ sections_changed_flags: sections });
    
    // Score should never decrease
    assert.ok(result.score >= previousScore, `Score decreased from ${previousScore} to ${result.score} with ${i} sections`);
    
    // Band should never decrease (get worse complexity)
    const currentBandIndex = bands.indexOf(result.band);
    assert.ok(currentBandIndex >= previousBandIndex, `Band regressed from ${bands[previousBandIndex]} to ${result.band} with ${i} sections`);
    
    previousScore = result.score;
    previousBandIndex = currentBandIndex;
  }
});