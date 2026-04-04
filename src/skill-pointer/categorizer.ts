import {
  DOMAIN_HEURISTICS,
  POINTER_SUFFIX,
  UNCATEGORIZED_CATEGORY,
} from "../constants/heuristics.js";

/**
 * Resolves the category slug for a given skill folder name
 * using substring matching against DOMAIN_HEURISTICS.
 *
 * Special-cases code-review with PR-related terms to avoid
 * mis-categorisation as a generic "review" category.
 */
export function getCategoryForSkill(skillName: string): string {
  const normalized = skillName.toLowerCase().replace(/_/g, "-");

  const PR_TERMS = ["pr-review", "pull-request", "merge-request"] as const;
  const hasPrTerm = PR_TERMS.some((term) => normalized.includes(term));

  if (normalized.includes("review") && hasPrTerm) {
    return "code-review";
  }

  for (const [category, keywords] of Object.entries(DOMAIN_HEURISTICS)) {
    if (keywords.some((kw) => normalized.includes(kw))) {
      return category;
    }
  }

  return UNCATEGORIZED_CATEGORY;
}

/**
 * Returns true if the folder name indicates an already-generated pointer.
 */
export function isPointerFolder(folderName: string): boolean {
  return folderName.endsWith(POINTER_SUFFIX);
}

/**
 * Returns true if the entry should be skipped entirely
 * (hidden files/dirs, manifest files, etc.).
 */
export function shouldSkipEntry(entryName: string): boolean {
  return entryName.startsWith(".") || entryName === "README.md";
}
