/**
 * Domain heuristics map used to categorize skill folders by name.
 * Each key is a category slug; each value is a list of substrings
 * matched (case-insensitive) against the skill folder name.
 *
 * Ported from SkillPointer (blacksiders/SkillPointer) — MIT License.
 */
export const DOMAIN_HEURISTICS: Readonly<Record<string, readonly string[]>> = {
  "security": [
    "attack", "injection", "vulnerability", "xss", "penetration",
    "privilege", "fuzzing", "auth", "jwt", "oauth", "bypass",
    "malware", "forensics", "hacker", "wireshark", "nmap",
    "security", "exploit", "encryption",
  ],
  "code-review": [
    "code-review", "codereview", "pr-review", "reviewer",
    "review-bot", "static-analysis", "quality-gate", "sonarqube",
  ],
  "git": [
    "git", "github", "gitlab", "pull-request", "merge-request",
    "commit", "branch", "rebase", "cherry-pick", "stash",
    "release", "conventional-commits",
  ],
  "ai-ml": [
    "ai-", "ml-", "llm", "gpt", "claude", "gemini", "openai",
    "anthropic", "prompt", "rag", "diffusion", "huggingface",
    "pytorch", "tensorflow", "comfy", "flux",
    "machine-learning", "deep-learning", "nlp",
  ],
  "web-dev": [
    "angular", "react", "vue", "tailwind", "frontend", "css",
    "html", "nextjs", "svelte", "astro", "web", "dom",
    "ui-patterns", "vercel", "shopify", "sass", "bootstrap",
  ],
  "backend-dev": [
    "api", "nestjs", "express", "django", "flask", "fastapi",
    "spring", "laravel", "node", "graphql", "rest", "grpc",
    "backend", "server", "microservice", "wordpress", "php",
  ],
  "devops": [
    "aws", "azure", "docker", "kubernetes", "ci-cd", "terraform",
    "ansible", "github-actions", "jenkins", "devops", "cloud",
    "linux", "k8s", "bash", "deploy", "nginx",
  ],
  "database": [
    "sql", "mysql", "postgres", "mongo", "redis", "database",
    "schema", "prisma", "orm", "nosql", "supabase", "sqlite",
  ],
  "design": [
    "ui", "ux", "design", "figma", "svg",
    "animation", "motion", "framer", "creative",
  ],
  "automation": [
    "automation", "zapier", "make", "n8n", "selenium",
    "playwright", "puppeteer", "workflow", "scraper", "cron",
  ],
  "mobile": [
    "ios", "android", "react-native", "flutter",
    "swift", "kotlin", "mobile", "xcode",
  ],
  "game-dev": [
    "game", "unity", "unreal", "godot",
    "phaser", "3d", "vr", "ar", "pygame",
  ],
  "business": [
    "business", "founder", "sales", "marketing", "seo",
    "growth", "product", "agile", "scrum", "jira", "crm",
  ],
  "writing": [
    "writing", "copywriting", "blog",
    "documentation", "readme", "content",
  ],
  "architecture": [
    "pattern", "clean-code", "system-design", "ddd", "architect",
  ],
  "testing": [
    "test-", "unit-test", "jest", "pytest",
    "cypress", "quality", "qa-",
  ],
  "agents": [
    "multi-agent", "swarm", "autonomous",
    "orchestration", "autogen", "crewai",
  ],
  "data-science": [
    "pandas", "numpy", "matplotlib", "scikit",
    "jupyter", "visualization", "data-", "etl",
  ],
  "blockchain": [
    "crypto", "web3", "solidity", "smart-contract",
    "ethereum", "bitcoin", "nft",
  ],
  "tooling": [
    "cli", "prettier", "eslint",
    "bundler", "npm", "extension", "plugin",
  ],
  "programming": [
    "python", "javascript", "typescript", "java",
    "cpp", "ruby", "csharp", "algorithm", "data-structure",
  ],
  "context-management": [
    "context", "memory", "compress", "compact", "restore", "save",
  ],
  "mcp": [
    "mcp-", "model-context-protocol",
  ],
} as const;

export const POINTER_SUFFIX = "-category-pointer" as const;
export const SKILL_FILENAME = "SKILL.md" as const;

/**
 * Name of the vault directory that stores raw skills, co-located
 * with the rest of OpenCode config under ~/.config/opencode/
 */
export const VAULT_DIR_NAME = "skill-libraries" as const;
export const UNCATEGORIZED_CATEGORY = "_uncategorized" as const;
