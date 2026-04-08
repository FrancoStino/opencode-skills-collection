import { test, expect } from "bun:test";
import { UNCATEGORIZED_CATEGORY } from "../constants/constants.js";

test("UNCATEGORIZED_CATEGORY constant should be used for uncategorized skills", () => {
  // This verifies the constant is properly exported and usable
  expect(UNCATEGORIZED_CATEGORY).toBeDefined();
  expect(typeof UNCATEGORIZED_CATEGORY).toBe("string");
});

test("Skills with 'uncategorized' category should match UNCATEGORIZED_CATEGORY", () => {
  // When skills_index.json has "category": "uncategorized",
  // it should match our constant value
  const upstreamCategory = "uncategorized";
  expect(UNCATEGORIZED_CATEGORY).toBe(upstreamCategory);
});
