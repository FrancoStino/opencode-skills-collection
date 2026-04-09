/**
 * Shared constants used across the plugin.
 */

/** Suffix appended to every category pointer folder name. */
export const POINTER_SUFFIX = "-category-pointer" as const;

/** Expected filename for every skill definition. */
export const SKILL_FILENAME = "SKILL.md" as const;

/**
 * Name of the vault directory that stores raw skills, co-located
 * with the rest of OpenCode config under ~/.config/opencode/
 */
export const VAULT_DIR_NAME = "skill-libraries" as const;

/** Fallback category slug for skills not present in skills_index.json. */
export const UNCATEGORIZED_CATEGORY = "uncategorized" as const;
