#!/usr/bin/env node

/**
 * CI script: scans bundled-skills/ for dangerous patterns and removes
 * quarantined skills before npm publish.
 *
 * Usage: node scripts/ci-scan-skills.mjs [bundled-skills-path]
 *
 * Expects `npm run build` to have been run first (imports from dist/).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const bundledPath = process.argv[2] || path.join(projectRoot, "bundled-skills");

// Import scanner from compiled output (use file:// URLs for cross-platform ESM compat)
const scannerPath = pathToFileURL(
	path.join(projectRoot, "dist", "skill-pointer", "content-scanner.js")
).href;
const vaultPath = pathToFileURL(
	path.join(projectRoot, "dist", "skill-pointer", "vault-installer.js")
).href;

const { scanSkills } = await import(scannerPath);
const { loadSkillsIndex } = await import(vaultPath);

// Load the full index
const index = loadSkillsIndex(bundledPath);
console.log(`📋 Loaded ${index.length} skills from index`);

// Scan with default patterns
const result = scanSkills(bundledPath, index);

// Always print warnings first (before any early exit)
if (result.warned.length > 0) {
	console.log(`\n⚠️  ${result.warned.length} skill(s) with warnings (kept):`);
	for (const entry of result.warned) {
		const patterns = entry.matchedPatterns.map((p) => p.id).join(", ");
		console.log(`  ⚠ ${entry.skillId} [${patterns}]`);
	}
}

if (result.quarantined.length === 0) {
	console.log("✅ No dangerous skills found — nothing to remove");
	process.exit(0);
}

// Remove quarantined skills from bundled-skills/
console.log(
	`\n🔒 Quarantining ${result.quarantined.length} skill(s):\n`
);

const resolvedBundled = path.resolve(bundledPath);

for (const entry of result.quarantined) {
	const skillDir = path.resolve(bundledPath, entry.skillId);

	// Path traversal guard: ensure resolved path stays inside bundledPath
	if (!skillDir.startsWith(resolvedBundled + path.sep)) {
		console.log(`  ⚠ Skipping ${entry.skillId} — path escapes bundled-skills/`);
		continue;
	}

	const patterns = entry.matchedPatterns.map((p) => p.id).join(", ");
	console.log(`  ✗ ${entry.skillId} [${patterns}]`);

	if (fs.existsSync(skillDir)) {
		fs.rmSync(skillDir, { recursive: true, force: true });
	}
}

// Also remove from skills_index.json
const indexPath = path.join(path.dirname(bundledPath), "skills_index.json");

if (fs.existsSync(indexPath)) {
	const realIndexPath = fs.realpathSync(indexPath);
	const realProjectRoot = fs.realpathSync(projectRoot);
	
	if (!realIndexPath.startsWith(realProjectRoot + path.sep)) {
		console.error(`\n❌ Security error: realIndexPath ${realIndexPath} escapes project root`);
		process.exit(1);
	}

	const quarantinedIds = new Set(result.quarantined.map((q) => q.skillId));
	const rawIndex = JSON.parse(fs.readFileSync(realIndexPath, "utf-8"));
	const cleanIndex = rawIndex.filter((s) => !quarantinedIds.has(s.id));
	const removed = rawIndex.length - cleanIndex.length;

	if (removed > 0) {
		fs.writeFileSync(realIndexPath, JSON.stringify(cleanIndex, null, 2) + "\n", "utf-8");
		console.log(`\n📝 Removed ${removed} entries from skills_index.json`);
	}
}

// Emit GitHub Actions warning annotation for visibility
console.log(
	`::warning::Content scanner quarantined ${result.quarantined.length} skill(s): ${result.quarantined.map((q) => q.skillId).join(", ")}`
);

console.log(
	`\n✅ Done: ${result.passed.length} skills passed, ${result.quarantined.length} removed`
);
