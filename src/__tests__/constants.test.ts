import { test, expect } from "bun:test";
import { UNCATEGORIZED_CATEGORY } from "../constants/constants.js";

test("UNCATEGORIZED_CATEGORY should match upstream JSON value", () => {
  expect(UNCATEGORIZED_CATEGORY).toBe("uncategorized");
});

test("UNCATEGORIZED_CATEGORY should not have underscore prefix", () => {
  expect(UNCATEGORIZED_CATEGORY).not.toStartWith("_");
});
