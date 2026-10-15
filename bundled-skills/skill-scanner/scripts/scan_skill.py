#!/usr/bin/env python3
# /// script
# requires-python = ">=3.9"
# dependencies = ["pyyaml"]
# ///
"""
Static analysis scanner for agent skills.

Scans a skill directory for security issues including prompt injection patterns,
obfuscation, dangerous code, secrets, and excessive permissions.

Usage:
    uv run scan_skill.py <skill-directory>

Output: JSON to stdout with structured findings.
"""
from __future__ import annotations

import base64
import json
import re
import sys
import os
import stat
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

import yaml

# Modified in AAS: bounded inert reads, complete-tree coverage accounting, and
# report redaction. Preserve the upstream source/license in UPSTREAM-NOTICE.md.
MAX_FILE_BYTES = 1024 * 1024
MAX_FILES = 1000
MAX_TOTAL_BYTES = 16 * 1024 * 1024


def read_inert_bytes(path: Path) -> bytes:
    """Read a bounded regular file without following its final symlink."""
    if not getattr(os, "O_NOFOLLOW", 0):
        raise OSError("No guarded file-open support; scan an inert snapshot on a supported host")
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | getattr(os, "O_NONBLOCK", 0))
    try:
        info = os.fstat(fd)
        if not stat.S_ISREG(info.st_mode) or info.st_size > MAX_FILE_BYTES:
            raise OSError("Input is non-regular or exceeds the per-file bound")
        with os.fdopen(fd, "rb", closefd=False) as stream:
            data = stream.read(MAX_FILE_BYTES + 1)
        if len(data) > MAX_FILE_BYTES:
            raise OSError("Input grew beyond the per-file bound")
        return data
    finally:
        os.close(fd)


def read_inert_text(path: Path) -> str:
    return read_inert_bytes(path).decode("utf-8")


def redact_text(text: str) -> str:
    # Remove the complete private-key payload, not merely its BEGIN marker.
    # An unterminated block consumes the remainder rather than exposing its body.
    text = re.sub(
        r"-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY-----[\s\S]*?(?:-----END (?:[A-Z0-9]+ )*PRIVATE KEY-----|\Z)",
        "[REDACTED PRIVATE KEY]", text,
    )
    def sanitize_url(match):
        try:
            parsed = urlsplit(match.group())
            host = parsed.hostname or ""
            if ":" in host:
                host = f"[{host}]"
            if parsed.port is not None:
                host += f":{parsed.port}"
            query = urlencode([(k, "[REDACTED]") for k, _ in parse_qsl(parsed.query, keep_blank_values=True)])
            return urlunsplit((parsed.scheme, host, parsed.path, query, ""))
        except ValueError:
            return "[OMITTED: malformed URL]"
    text = re.sub(r"https?://[^\s\)\]\>\"'`]+", sanitize_url, text)
    for pattern, _, _ in SECRET_PATTERNS:
        text = re.sub(pattern, "[REDACTED]", text)
    return text


def redact_report(value: Any, key: str = "", depth: int = 0, seen=None, budget=None) -> Any:
    seen = set() if seen is None else seen
    budget = [10000] if budget is None else budget
    budget[0] -= 1
    if depth > 50 or budget[0] < 0:
        return "[OMITTED: metadata traversal limit]"
    if re.search(r"(?i)password|passwd|secret|token|credential|api[_-]?key", key):
        return "[REDACTED]"
    if isinstance(value, (dict, list)):
        if id(value) in seen:
            return "[OMITTED: repeated/cyclic metadata]"
        seen.add(id(value))
        if isinstance(value, dict):
            result = {}
            for k, v in value.items():
                if budget[0] <= 0:
                    result["__omitted__"] = "metadata traversal limit"
                    break
                result[redact_text(str(k))] = redact_report(v, str(k), depth + 1, seen, budget)
            return result
        result = []
        for v in value:
            if budget[0] <= 0:
                result.append("[OMITTED: metadata traversal limit]")
                break
            result.append(redact_report(v, depth=depth + 1, seen=seen, budget=budget))
        return result
    if isinstance(value, str):
        return redact_text(value)
    return value


# --- Pattern Definitions ---

PROMPT_INJECTION_PATTERNS: list[tuple[str, str, str]] = [
    # (pattern, description, severity)
    (r"(?i)ignore\s+(all\s+)?previous\s+instructions", "Instruction override: ignore previous instructions", "critical"),
    (r"(?i)disregard\s+(all\s+)?(previous|prior|above)\s+(instructions|rules|guidelines)", "Instruction override: disregard previous", "critical"),
    (r"(?i)forget\s+(all\s+)?(previous|prior|your)\s+(instructions|rules|training)", "Instruction override: forget previous", "critical"),
    (r"(?i)you\s+are\s+now\s+(a|an|in)\s+", "Role reassignment: 'you are now'", "high"),
    (r"(?i)act\s+as\s+(a|an)\s+unrestricted", "Role reassignment: unrestricted mode", "critical"),
    (r"(?i)enter\s+(developer|debug|admin|god)\s+mode", "Jailbreak: developer/debug mode", "critical"),
    (r"(?i)DAN\s+(mode|prompt|jailbreak)", "Jailbreak: DAN pattern", "critical"),
    (r"(?i)do\s+anything\s+now", "Jailbreak: do anything now", "critical"),
    (r"(?i)bypass\s+(safety|security|content|filter|restriction)", "Jailbreak: bypass safety", "critical"),
    (r"(?i)override\s+(system|safety|security)\s+(prompt|message|instruction)", "System prompt override", "critical"),
    (r"(?i)\bsystem\s*:\s*you\s+are\b", "System prompt injection marker", "high"),
    (r"(?i)new\s+system\s+(prompt|instruction|message)\s*:", "New system prompt injection", "critical"),
    (r"(?i)from\s+now\s+on,?\s+(you|ignore|forget|disregard)", "Temporal instruction override", "high"),
    (r"(?i)pretend\s+(that\s+)?you\s+(have\s+no|don't\s+have|are\s+not\s+bound)", "Pretend-based jailbreak", "high"),
    (r"(?i)respond\s+(only\s+)?with\s+(the\s+)?(raw|full|complete)\s+(system|initial)\s+prompt", "System prompt extraction", "high"),
    (r"(?i)output\s+(your|the)\s+(system|initial|original)\s+(prompt|instructions)", "System prompt extraction", "high"),
]

OBFUSCATION_PATTERNS: list[tuple[str, str]] = [
    # (description, detail)
    ("Zero-width characters", "Zero-width space, joiner, or non-joiner detected"),
    ("Right-to-left override", "RTL override character can hide text direction"),
    ("Homoglyph characters", "Characters visually similar to ASCII but from different Unicode blocks"),
    ("Unicode Tag characters", "Tags block (U+E0000-E007F) can encode invisible ASCII text readable by LLMs"),
]

SECRET_PATTERNS: list[tuple[str, str, str]] = [
    # (pattern, description, severity)
    (r"(?i)AKIA[0-9A-Z]{16}", "AWS Access Key ID", "critical"),
    (r"(?i)aws.{0,20}secret.{0,20}['\"][0-9a-zA-Z/+]{40}['\"]", "AWS Secret Access Key", "critical"),
    (r"ghp_[0-9a-zA-Z]{36}", "GitHub Personal Access Token", "critical"),
    (r"ghs_[0-9a-zA-Z]{36}", "GitHub Server Token", "critical"),
    (r"gho_[0-9a-zA-Z]{36}", "GitHub OAuth Token", "critical"),
    (r"github_pat_[0-9a-zA-Z_]{82}", "GitHub Fine-Grained PAT", "critical"),
    (r"sk-[0-9a-zA-Z]{20,}T3BlbkFJ[0-9a-zA-Z]{20,}", "OpenAI API Key", "critical"),
    (r"sk-ant-api03-[0-9a-zA-Z\-_]{90,}", "Anthropic API Key", "critical"),
    (r"xox[bpors]-[0-9a-zA-Z\-]{10,}", "Slack Token", "critical"),
    (r"-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----", "Private Key", "critical"),
    (r"(?i)(password|passwd|pwd)\s*[:=]\s*['\"][^'\"]{8,}['\"]", "Hardcoded password", "high"),
    (r"(?i)(api[_-]?key|apikey)\s*[:=]\s*['\"][0-9a-zA-Z]{16,}['\"]", "Hardcoded API key", "high"),
    (r"(?i)(secret|token)\s*[:=]\s*['\"][0-9a-zA-Z]{16,}['\"]", "Hardcoded secret/token", "high"),
]

DANGEROUS_SCRIPT_PATTERNS: list[tuple[str, str, str]] = [
    # (pattern, description, severity)
    # Data exfiltration
    (r"(?i)(requests\.(get|post|put)|urllib\.request|http\.client|aiohttp)\s*\(", "HTTP request (potential exfiltration)", "medium"),
    (r"(?i)(curl|wget)\s+", "Shell HTTP request", "medium"),
    (r"(?i)socket\.(connect|create_connection)", "Raw socket connection", "high"),
    (r"(?i)subprocess.*\b(nc|ncat|netcat)\b", "Netcat usage (potential reverse shell)", "critical"),
    # Credential access
    (r"(?i)(~|HOME|USERPROFILE).*\.(ssh|aws|gnupg|config)", "Sensitive directory access", "high"),
    (r"(?i)open\s*\(.*(\.env|credentials|\.netrc|\.pgpass|\.my\.cnf)", "Sensitive file access", "high"),
    (r"(?i)os\.environ\s*\[.*(?:KEY|SECRET|TOKEN|PASSWORD|CREDENTIAL)", "Environment secret access", "medium"),
    # Dangerous execution
    (r"\beval\s*\(", "eval() usage", "high"),
    (r"\bexec\s*\(", "exec() usage", "high"),
    (r"(?i)subprocess.*shell\s*=\s*True", "Shell execution with shell=True", "high"),
    (r"(?i)os\.(system|popen|exec[lv]p?e?)\s*\(", "OS command execution", "high"),
    (r"(?i)__import__\s*\(", "Dynamic import", "medium"),
    # File system manipulation
    (r"(?i)(open|write|Path).*\.(claude|bashrc|zshrc|profile|bash_profile)", "Agent/shell config modification", "critical"),
    (r"(?i)(open|write|Path).*(settings\.json|CLAUDE\.md|MEMORY\.md|\.mcp\.json)", "Agent settings modification", "critical"),
    (r"(?i)(open|write|Path).*(\.git/hooks|\.husky)", "Git hooks modification", "critical"),
    # Encoding/obfuscation in scripts
    (r"(?i)base64\.(b64decode|decodebytes)\s*\(", "Base64 decoding (potential obfuscation)", "medium"),
    (r"(?i)codecs\.(decode|encode)\s*\(.*rot", "ROT encoding (obfuscation)", "high"),
    (r"(?i)compile\s*\(.*exec", "Dynamic code compilation", "high"),
]

# Domains commonly trusted in skill contexts
TRUSTED_DOMAINS = {
    "github.com", "api.github.com", "raw.githubusercontent.com",
    "docs.sentry.io", "develop.sentry.dev", "sentry.io",
    "pypi.org", "npmjs.com", "crates.io",
    "docs.python.org", "docs.djangoproject.com",
    "developer.mozilla.org", "stackoverflow.com",
    "agentskills.io",
}


def parse_frontmatter(content: str) -> tuple[dict[str, Any] | None, str]:
    """Parse YAML frontmatter from SKILL.md content."""
    if not content.startswith("---"):
        return None, content

    parts = content.split("---", 2)
    if len(parts) < 3:
        return None, content

    try:
        fm = yaml.safe_load(parts[1])
        body = parts[2]
        return fm if isinstance(fm, dict) else None, body
    except yaml.YAMLError:
        return None, content


def check_frontmatter(skill_dir: Path, content: str) -> list[dict[str, Any]]:
    """Validate SKILL.md frontmatter."""
    findings: list[dict[str, Any]] = []
    fm, _ = parse_frontmatter(content)

    if fm is None:
        findings.append({
            "type": "Invalid Frontmatter",
            "severity": "high",
            "location": "SKILL.md:1",
            "description": "Missing or unparseable YAML frontmatter",
            "category": "Validation",
        })
        return findings

    # Required fields
    if "name" not in fm:
        findings.append({
            "type": "Missing Name",
            "severity": "high",
            "location": "SKILL.md frontmatter",
            "description": "Required 'name' field missing from frontmatter",
            "category": "Validation",
        })

    if "description" not in fm:
        findings.append({
            "type": "Missing Description",
            "severity": "medium",
            "location": "SKILL.md frontmatter",
            "description": "Required 'description' field missing from frontmatter",
            "category": "Validation",
        })

    # Name-directory mismatch
    if "name" in fm and fm["name"] != skill_dir.name:
        findings.append({
            "type": "Name Mismatch",
            "severity": "medium",
            "location": "SKILL.md frontmatter",
            "description": "Frontmatter name does not match the selected directory identifier",
            "category": "Validation",
        })

    # Unrestricted tools
    tools = fm.get("allowed-tools", "")
    if isinstance(tools, str) and tools.strip() == "*":
        findings.append({
            "type": "Unrestricted Tools",
            "severity": "critical",
            "location": "SKILL.md frontmatter",
            "description": "allowed-tools is set to '*' (unrestricted access to all tools)",
            "category": "Excessive Permissions",
        })

    return findings


def check_prompt_injection(content: str, filepath: str) -> list[dict[str, Any]]:
    """Scan content for prompt injection patterns."""
    findings: list[dict[str, Any]] = []
    lines = content.split("\n")

    for line_num, line in enumerate(lines, 1):
        for pattern, description, severity in PROMPT_INJECTION_PATTERNS:
            if re.search(pattern, line):
                findings.append({
                    "type": "Prompt Injection Pattern",
                    "severity": severity,
                    "location": f"{filepath}:{line_num}",
                    "description": description,
                    "category": "Prompt Injection",
                })
                break  # One finding per line

    return findings


def check_obfuscation(content: str, filepath: str) -> list[dict[str, Any]]:
    """Detect obfuscation techniques."""
    findings: list[dict[str, Any]] = []
    lines = content.split("\n")

    # Zero-width characters
    zwc_pattern = re.compile(r"[\u200b\u200c\u200d\u2060\ufeff]")
    for line_num, line in enumerate(lines, 1):
        if zwc_pattern.search(line):
            chars = [f"U+{ord(c):04X}" for c in zwc_pattern.findall(line)]
            findings.append({
                "type": "Zero-Width Characters",
                "severity": "high",
                "location": f"{filepath}:{line_num}",
                "description": f"Zero-width characters detected: {', '.join(chars)}",
                "category": "Obfuscation",
            })

    # RTL override
    rtl_pattern = re.compile(r"[\u202a-\u202e\u2066-\u2069]")
    for line_num, line in enumerate(lines, 1):
        if rtl_pattern.search(line):
            findings.append({
                "type": "RTL Override",
                "severity": "high",
                "location": f"{filepath}:{line_num}",
                "description": "Right-to-left override or embedding character detected",
                "category": "Obfuscation",
            })

    # Unicode Tag characters (U+E0000 block) — invisible text readable by LLMs
    tag_pattern = re.compile(r"[\U000e0001-\U000e007f]")
    tag_chars = tag_pattern.findall(content)
    if tag_chars:
        findings.append({
            "type": "Unicode Tag Smuggling",
            "severity": "critical",
            "location": filepath,
            "description": "Invisible Unicode Tag characters detected; inspect the source locally",
            "tag_character_count": len(tag_chars),
            "category": "Obfuscation",
        })

    # Suspicious base64 strings (long base64 that decodes to text with suspicious keywords)
    b64_pattern = re.compile(r"[A-Za-z0-9+/]{40,}={0,2}")
    for line_num, line in enumerate(lines, 1):
        for match in b64_pattern.finditer(line):
            try:
                decoded = base64.b64decode(match.group()).decode("utf-8", errors="ignore")
                suspicious_keywords = ["ignore", "system", "override", "eval", "exec", "password", "secret"]
                for kw in suspicious_keywords:
                    if kw.lower() in decoded.lower():
                        findings.append({
                            "type": "Suspicious Base64",
                            "severity": "high",
                            "location": f"{filepath}:{line_num}",
                            "description": f"Base64 string decodes to text containing '{kw}'",
                            "decoded_length": len(decoded),
                            "category": "Obfuscation",
                        })
                        break
            except Exception:
                pass

    # HTML comments with suspicious content
    comment_pattern = re.compile(r"<!--(.*?)-->", re.DOTALL)
    for match in comment_pattern.finditer(content):
        comment_text = match.group(1)
        # Check if the comment contains injection-like patterns
        for pattern, description, severity in PROMPT_INJECTION_PATTERNS:
            if re.search(pattern, comment_text):
                # Find line number
                line_num = content[:match.start()].count("\n") + 1
                findings.append({
                    "type": "Hidden Injection in Comment",
                    "severity": "critical",
                    "location": f"{filepath}:{line_num}",
                    "description": f"HTML comment contains injection pattern: {description}",
                    "category": "Prompt Injection",
                })
                break

    return findings


def scan_masked_locations(content: str, filepath: str) -> list[dict[str, Any]]:
    """Detect hardcoded secrets."""
    findings: list[dict[str, Any]] = []
    lines = content.split("\n")

    for line_num, line in enumerate(lines, 1):
        for pattern, description, severity in SECRET_PATTERNS:
            if re.search(pattern, line):
                # Mask the actual secret in evidence
                evidence = "[REDACTED: credential detected; inspect the reported local location]"
                findings.append({
                    "type": "Secret Detected",
                    "severity": severity,
                    "location": f"{filepath}:{line_num}",
                    "description": description,
                    "evidence": evidence,
                    "category": "Secret Exposure",
                })
                break  # One finding per line

    return findings


def check_scripts(script_path: Path) -> list[dict[str, Any]]:
    """Analyze a script file for dangerous patterns."""
    findings: list[dict[str, Any]] = []
    try:
        content = read_inert_text(script_path)
    except (OSError, UnicodeError):
        return [{"type": "Unreadable Input", "severity": "high", "location": str(script_path.name),
                 "description": "Script could not be read within guarded input bounds", "category": "Coverage"}]

    relative = script_path.name
    lines = content.split("\n")

    for line_num, line in enumerate(lines, 1):
        for pattern, description, severity in DANGEROUS_SCRIPT_PATTERNS:
            if re.search(pattern, line):
                findings.append({
                    "type": "Dangerous Code Pattern",
                    "severity": severity,
                    "location": f"scripts/{relative}:{line_num}",
                    "description": description,
                    "category": "Malicious Code",
                })
                break  # One finding per line

    return findings


def extract_urls(content: str, filepath: str) -> list[dict[str, Any]]:
    """Extract and categorize URLs."""
    urls: list[dict[str, Any]] = []
    url_pattern = re.compile(r"https?://[^\s\)\]\>\"'`]+")
    lines = content.split("\n")

    for line_num, line in enumerate(lines, 1):
        for match in url_pattern.finditer(line):
            url = match.group().rstrip(".,;:")
            try:
                # Extract domain
                domain = urlsplit(url).hostname or "unknown"
                # Check if root domain is trusted
                domain_parts = domain.split(".")
                root_domain = ".".join(domain_parts[-2:]) if len(domain_parts) >= 2 else domain
                trusted = root_domain in TRUSTED_DOMAINS or domain in TRUSTED_DOMAINS
            except (IndexError, ValueError):
                domain = "unknown"
                trusted = False

            urls.append({
                "domain": domain,
                "trusted": trusted,
                "trust_basis": "familiar hostname only; not provenance or execution approval",
                "location": f"{filepath}:{line_num}",
            })

    return urls


def check_structural_attacks(skill_dir: Path, content: str, frontmatter: dict[str, Any] | None) -> list[dict[str, Any]]:
    """Detect structural attack patterns that go beyond text content."""
    findings: list[dict[str, Any]] = []

    # 1. Symlinks — files that resolve to paths outside the skill directory
    for path in skill_dir.rglob("*"):
        if path.is_symlink():
            target = path.resolve()
            is_internal = target.is_relative_to(skill_dir.resolve())
            findings.append({
                "type": "Symlink Detected",
                "severity": "medium" if is_internal else "critical",
                "location": str(path.relative_to(skill_dir)),
                "description": "Symlink may expose other files; inspect its target locally",
                "target_within_skill": is_internal,
                "category": "Symlink Exfiltration",
            })

    # 2. YAML hook exploitation — hooks in frontmatter execute shell commands
    if frontmatter and "hooks" in frontmatter:
        hooks = frontmatter["hooks"]
        hook_types = hooks.keys() if isinstance(hooks, dict) else []
        for hook_type in hook_types:
            findings.append({
                "type": "Frontmatter Hooks",
                "severity": "critical",
                "location": "SKILL.md frontmatter",
                "description": "Skill defines lifecycle hooks. Hooks execute shell commands "
                              "automatically on lifecycle events — the model cannot prevent execution. "
                              "Review all hook commands carefully.",
                "category": "Hook Exploitation",
            })

    # 3. !`command` pre-prompt injection — runs at template expansion time
    bang_pattern = re.compile(r"!\`[^`]+\`")
    for line_num, line in enumerate(content.split("\n"), 1):
        for match in bang_pattern.finditer(line):
            cmd = match.group()[2:-1]  # Strip !` and `
            findings.append({
                "type": "Pre-prompt Command",
                "severity": "high",
                "location": f"SKILL.md:{line_num}",
                "description": "Pre-prompt command syntax can execute at skill load time; inspect locally",
                "command_length": len(cmd),
                "category": "Pre-prompt Injection",
            })

    # 4. Test file auto-discovery — conftest.py, test_*.py, *.test.js/ts
    test_patterns = {
        "conftest.py": "pytest auto-imports conftest.py at collection time — code runs before any tests",
        "test_*.py": "pytest discovers and runs test_*.py files automatically",
        "*_test.py": "pytest discovers and runs *_test.py files automatically",
        "*.test.js": "Jest/Vitest may discover .test.js files if dot:true glob is set",
        "*.test.ts": "Jest/Vitest may discover .test.ts files if dot:true glob is set",
    }
    for path in skill_dir.rglob("*"):
        if not path.is_file():
            continue
        name = path.name
        for pattern, desc in test_patterns.items():
            import fnmatch
            if fnmatch.fnmatch(name, pattern):
                findings.append({
                    "type": "Test File Auto-Discovery",
                    "severity": "high",
                    "location": str(path.relative_to(skill_dir)),
                    "description": f"{desc}. Bundled test files execute as a side effect of running "
                                  "the test suite — review file contents for hidden payloads.",
                    "category": "Test File RCE",
                })

    # 5. npm postinstall — bundled package.json with lifecycle scripts
    for pkg_json in skill_dir.rglob("package.json"):
        if pkg_json.is_symlink():
            continue
        try:
            pkg = json.loads(read_inert_text(pkg_json))
            if not isinstance(pkg, dict):
                continue
        except (json.JSONDecodeError, OSError, ValueError, UnicodeError):
            continue
        scripts = pkg.get("scripts") or {}
        if not isinstance(scripts, dict):
            scripts = {}  # Invalid package metadata is not executable hook evidence.
        lifecycle_hooks = ["preinstall", "install", "postinstall", "preuninstall", "postuninstall"]
        for hook in lifecycle_hooks:
            if hook in scripts:
                findings.append({
                    "type": "npm Lifecycle Hook",
                    "severity": "critical",
                    "location": str(pkg_json.relative_to(skill_dir)),
                    "description": f"package.json defines the '{hook}' lifecycle script. "
                                  "npm executes lifecycle hooks automatically on install — "
                                  "this is a common supply chain attack vector.",
                    "category": "Supply Chain",
                })

    # 6. Image metadata — parse PNG chunks properly to find tEXt/iTXt metadata
    import struct
    for img_path in skill_dir.rglob("*.png"):
        if img_path.is_symlink():
            continue
        try:
            data = read_inert_bytes(img_path)
            # PNG files start with 8-byte signature, then chunks
            # Each chunk: 4-byte length (big-endian), 4-byte type, data, 4-byte CRC
            if data[:8] != b"\x89PNG\r\n\x1a\n":
                continue
            offset = 8
            while offset + 8 <= len(data):
                chunk_len = struct.unpack(">I", data[offset:offset + 4])[0]
                chunk_type = data[offset + 4:offset + 8]
                chunk_data = data[offset + 8:offset + 8 + chunk_len]

                keyword = ""
                value = ""
                if chunk_type == b"tEXt":
                    # tEXt: keyword\0text
                    parts = chunk_data.split(b"\x00", 1)
                    if len(parts) > 1:
                        keyword = parts[0].decode("ascii", errors="ignore")
                        value = parts[1][:200].decode("latin-1", errors="ignore")
                elif chunk_type == b"iTXt":
                    # iTXt: keyword\0comprFlag\0comprMethod\0langTag\0transKeyword\0text
                    parts = chunk_data.split(b"\x00", 4)
                    if len(parts) >= 5:
                        keyword = parts[0].decode("ascii", errors="ignore")
                        value = parts[4][:200].decode("utf-8", errors="ignore")

                if keyword and value.strip():
                            findings.append({
                                "type": "Image Metadata Text",
                                "severity": "high",
                                "location": str(img_path.relative_to(skill_dir)),
                                "description": "PNG contains text metadata. "
                                              "Hidden instructions in image metadata can be read by "
                                              "multimodal LLMs when they inspect the file.",
                                "category": "Image Injection",
                            })

                # Advance to next chunk: length + type(4) + data + CRC(4)
                offset += 4 + 4 + chunk_len + 4
        except (OSError, struct.error):
            continue

    return findings


def compute_description_body_overlap(frontmatter: dict[str, Any] | None, body: str) -> float:
    """Compute keyword overlap between description and body as a heuristic."""
    if not frontmatter or "description" not in frontmatter or frontmatter["description"] is None:
        return 0.0

    if not isinstance(frontmatter["description"], str):
        return 0.0
    desc_words = set(re.findall(r"\b[a-z]{4,}\b", frontmatter["description"].lower()))
    body_words = set(re.findall(r"\b[a-z]{4,}\b", body.lower()))

    if not desc_words:
        return 0.0

    overlap = desc_words & body_words
    return len(overlap) / len(desc_words)


def scan_skill(skill_dir: Path) -> dict[str, Any]:
    """Run full scan on a skill directory."""
    skill_md = skill_dir / "SKILL.md"
    if not skill_md.exists():
        return {"error": "No SKILL.md found in the requested directory", "scan_complete": False}

    try:
        content = read_inert_text(skill_md)
    except (OSError, UnicodeError):
        return {"error": "Cannot read SKILL.md within guarded input bounds", "scan_complete": False}

    coverage_errors: list[str] = []
    inventory: list[Path] = []
    total_bytes = 0
    def walk_error(error):
        raise error
    try:
        for root, dirs, files in os.walk(skill_dir, followlinks=False, onerror=walk_error):
            for directory in list(dirs):
                if (Path(root) / directory).is_symlink():
                    coverage_errors.append("Linked directory was not read")
                    dirs.remove(directory)
            for name in files:
                path = Path(root) / name
                if path.is_symlink():
                    coverage_errors.append("Linked file was not read")
                    continue
                info = path.stat()
                if not stat.S_ISREG(info.st_mode):
                    coverage_errors.append("Non-regular input was not read")
                    continue
                inventory.append(path)
                total_bytes += info.st_size
                if len(inventory) > MAX_FILES or info.st_size > MAX_FILE_BYTES or total_bytes > MAX_TOTAL_BYTES:
                    return {"error": "Input tree exceeds scan bounds", "scan_complete": False}
    except OSError:
        return {"error": "Cannot inventory input tree", "scan_complete": False}

    frontmatter, body = parse_frontmatter(content)

    all_findings: list[dict[str, Any]] = []
    all_urls: list[dict[str, Any]] = []

    # 1. Frontmatter validation
    all_findings.extend(check_frontmatter(skill_dir, content))

    # 2. Prompt injection patterns in SKILL.md
    all_findings.extend(check_prompt_injection(content, "SKILL.md"))

    # 3. Obfuscation detection in SKILL.md
    all_findings.extend(check_obfuscation(content, "SKILL.md"))

    # 4. Secret detection in SKILL.md
    all_findings.extend(scan_masked_locations(content, "SKILL.md"))

    # 5. URL extraction from SKILL.md
    all_urls.extend(extract_urls(content, "SKILL.md"))

    # 6. Inspect every regular text blob in the bounded tree, including nested
    # scripts and references. Unsupported binary inputs remain coverage gaps.
    refs_dir = skill_dir / "references"
    scripts_dir = skill_dir / "scripts"
    scanned_files = ["SKILL.md"]
    for path in sorted(inventory):
        if path == skill_md:
            continue
        rel_path = str(path.relative_to(skill_dir))
        try:
            text = read_inert_text(path)
        except (OSError, UnicodeError):
            coverage_errors.append(f"Unreadable or unsupported text: {rel_path}")
            continue
        if "\0" in text:
            coverage_errors.append(f"Binary input not analyzed as text: {rel_path}")
            continue
        scanned_files.append(rel_path)
        all_findings.extend(check_prompt_injection(text, rel_path))
        all_findings.extend(check_obfuscation(text, rel_path))
        all_findings.extend(scan_masked_locations(text, rel_path))
        all_urls.extend(extract_urls(text, rel_path))
        if path.suffix in (".py", ".sh", ".js", ".ts", ".mjs", ".cjs"):
            for finding in check_scripts(path):
                finding["location"] = finding["location"].replace(f"scripts/{path.name}", rel_path)
                all_findings.append(finding)

    # 8. Structural attacks (symlinks, hooks, !command, test files, npm, image metadata)
    all_findings.extend(check_structural_attacks(skill_dir, content, frontmatter))

    # 9. Description-body overlap
    overlap = compute_description_body_overlap(frontmatter, body)

    # Build structure info
    structure = {
        "has_skill_md": True,
        "has_references": refs_dir.is_dir() if (refs_dir := skill_dir / "references") else False,
        "has_scripts": scripts_dir.is_dir() if (scripts_dir := skill_dir / "scripts") else False,
        "reference_files": sorted(f.name for f in (skill_dir / "references").iterdir() if f.suffix == ".md") if (skill_dir / "references").is_dir() else [],
        "script_files": sorted(f.name for f in (skill_dir / "scripts").iterdir() if f.suffix in (".py", ".sh", ".js", ".ts")) if (skill_dir / "scripts").is_dir() else [],
    }

    # Summary counts
    severity_counts: dict[str, int] = {}
    for f in all_findings:
        sev = f.get("severity", "unknown")
        severity_counts[sev] = severity_counts.get(sev, 0) + 1

    untrusted_urls = [u for u in all_urls if not u["trusted"]]

    # Allowed tools analysis
    tools_info = None
    if frontmatter and "allowed-tools" in frontmatter:
        tools_str = frontmatter["allowed-tools"]
        if isinstance(tools_str, str):
            tools_list = [t.strip() for t in tools_str.replace(",", " ").split() if t.strip()]
            tools_info = {
                "tools": [tool for tool in ("Bash", "Edit", "Glob", "Grep", "Read", "Task", "WebFetch", "Write") if tool in tools_list],
                "unknown_tool_count": sum(tool not in ("Read", "Grep", "Glob", "Bash", "Write", "Edit", "WebFetch", "Task", "*") for tool in tools_list),
                "has_bash": "Bash" in tools_list,
                "has_write": "Write" in tools_list,
                "has_edit": "Edit" in tools_list,
                "has_webfetch": "WebFetch" in tools_list,
                "has_task": "Task" in tools_list,
                "unrestricted": tools_str.strip() == "*",
            }

    return {
        "report_format": "skill-scanner.locators.v2",
        "scan_complete": not coverage_errors,
        "coverage": {"scanned_files": scanned_files, "errors": coverage_errors,
                     "scope": "bounded static pattern inspection, not semantic approval"},
        "skill_name": skill_dir.name,
        "structure": structure,
        "frontmatter": {
            "parseable": frontmatter is not None,
            "fields": {
                field: {"present": field in frontmatter, "expected_type": isinstance(frontmatter.get(field), expected)}
                for field, expected in (("name", str), ("description", str), ("allowed-tools", str), ("hooks", dict))
            } if frontmatter is not None else {},
        },
        "tools": tools_info,
        "findings": all_findings,
        "finding_counts": severity_counts,
        "total_findings": len(all_findings),
        "urls": {
            "total": len(all_urls),
            "untrusted": untrusted_urls,
            "trusted_count": len(all_urls) - len(untrusted_urls),
        },
        "description_body_overlap": round(overlap, 2),
    }



def main():
    if len(sys.argv) < 2:
        print("Usage: scan_skill.py <skill-directory>", file=sys.stderr)
        sys.exit(1)

    try:
        skill_dir = Path(sys.argv[1]).resolve()
        if not skill_dir.is_dir():
            print(json.dumps({"error": "Requested input is not a directory", "scan_complete": False}))
            sys.exit(1)
        result = scan_skill(skill_dir)
    except (OSError, RuntimeError, ValueError):
        # Filesystem/parser error details can contain sensitive paths or payloads.
        result = {"error": "Input could not be inspected within guarded bounds", "scan_complete": False}
    print(json.dumps(result, indent=2))
    if result.get("error") or not result.get("scan_complete", False):
        sys.exit(2)


if __name__ == "__main__":
    main()
