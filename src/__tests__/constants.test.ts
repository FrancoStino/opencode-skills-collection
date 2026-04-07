import { test, expect } from "bun:test";
import { UNCATEGORIZED_CATEGORY } from "../constants/constants.js";

test("UNCATEGORIZED_CATEGORY should match upstream JSON value", () => {
  // The upstream skills_index.json uses "uncategorized" (no underscore)
  // This test will FAIL until we fix the constant
  expect(UNCATEGORIZED_CATEGORY).toBe("uncategorized");
});

test("UNCATEGORIZED_CATEGORY should not have underscore prefix", () => {
  // The old value "_uncategorized" caused a mismatch with upstream data
  expect(UNCATEGORIZED_CATEGORY).not.toStartWith("_");
});
