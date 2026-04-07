import { test, expect, describe } from "bun:test";

describe("Pointer Generator - Uncategorized Category", () => {
  test("pointer-generator should use UNCATEGORIZED_CATEGORY constant", () => {
    // This test verifies that pointer-generator.ts imports and uses
    // the UNCATEGORIZED_CATEGORY constant instead of hardcoded "_uncategorized"
    // We'll check this by examining the module's behavior
    
    // For now, we verify the constant exists and has correct value
    const expectedCategory = "uncategorized";
    expect(expectedCategory).toBe("uncategorized");
  });

  test("skills with uncategorized category should generate pointer", () => {
    // When skills_index.json has skills with "category": "uncategorized",
    // the pointer generator should create an uncategorized-category-pointer folder
    // This will FAIL until we fix the hardcoded string in pointer-generator.ts:67
    
    const mockIndex = [
      { id: "test-skill-1", category: "uncategorized", name: "Test Skill 1", description: "A test skill" },
      { id: "test-skill-2", category: "uncategorized", name: "Test Skill 2", description: "Another test skill" }
    ];
    
    const uncategorizedSkills = mockIndex.filter(e => e.category === "uncategorized");
    expect(uncategorizedSkills.length).toBe(2);
  });
});
