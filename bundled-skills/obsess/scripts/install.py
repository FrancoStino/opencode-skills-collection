#!/usr/bin/env python3
"""Install /obsess locally without network access or unapproved overwrites.

Requires Python 3.10+. Install into an explicit project or the user's home.
--upgrade preserves the prior installation outside the skills search path.
Concurrent installers or external edits during installation aren't supported.
"""
from __future__ import annotations

import argparse
from dataclasses import dataclass
from datetime import datetime, timezone
import json
from pathlib import Path
import shutil
import sys
import tempfile
from typing import Any


class InstallError(RuntimeError):
    """A validation failure or a recoverable installation failure."""


@dataclass(frozen=True)
class Plan:
    source: Path
    config_root: Path
    skill: Path
    command: Path | None
    duplicate_paths: tuple[Path, ...]
    legacy_command: bool
    upgrade: bool


def check_path(path: Path, *, leaf_directory: bool | None = None) -> None:
    """Refuse symlinks and files where a directory is required."""
    if path.is_symlink():
        raise InstallError(f"Refusing a symlinked path: {path}")
    for parent in path.parents:
        if parent.is_symlink():
            raise InstallError(f"Refusing a symlinked parent: {parent}")
        if parent.exists() and not parent.is_dir():
            raise InstallError(f"A parent isn't a directory: {parent}")
    if path.exists() and leaf_directory is not None:
        expected = path.is_dir() if leaf_directory else path.is_file()
        if not expected:
            kind = "directory" if leaf_directory else "file"
            raise InstallError(f"Expected a {kind}: {path}")


def validate(plan: Plan) -> None:
    if not plan.source.is_dir() or not (plan.source / "SKILL.md").is_file():
        raise InstallError("Source must be the obsess skill directory containing SKILL.md")
    for entry in plan.source.rglob("*"):
        if entry.is_symlink():
            raise InstallError(f"The package contains a symlink: {entry}")
        if not entry.is_file() and not entry.is_dir():
            raise InstallError(f"The package contains an unsupported file type: {entry}")
    if plan.skill.is_relative_to(plan.source) or plan.source.is_relative_to(plan.skill):
        raise InstallError("Source and installation directories mustn't overlap")
    check_path(plan.config_root, leaf_directory=True)
    check_path(plan.config_root / "obsess-backups", leaf_directory=True)
    check_path(plan.skill, leaf_directory=True)
    for competing in plan.duplicate_paths:
        if competing.exists() or competing.is_symlink():
            raise InstallError(
                f"A same-name skill already exists at {competing}. "
                "Upgrade that copy instead of creating a duplicate installation."
            )
    command_path = plan.config_root / "commands" / "obsess.md"
    check_path(command_path, leaf_directory=False)
    if plan.command is None and command_path.exists():
        raise InstallError(
            f"An /obsess command already exists at {command_path}. "
            "Move it aside before native installation, or use --legacy-command for OpenCode."
        )
    destinations = [plan.skill] + ([plan.command] if plan.command is not None else [])
    for destination in destinations:
        if destination.exists() and not plan.upgrade:
            raise InstallError(
                f"Installation already exists: {destination}. "
                "Use --upgrade to preserve a backup before replacing it."
            )
    if plan.legacy_command:
        wrapper = plan.source / "references" / "integrations" / "opencode" / "obsess.md"
        if not wrapper.is_file():
            raise InstallError("The package is missing its OpenCode command wrapper")
        skill_text = (plan.source / "SKILL.md").read_text(encoding="utf-8")
        if skill_text.count('  opencode/slash: "true"') != 1:
            raise InstallError("Expected exactly one native OpenCode slash flag in the source skill")


def make_plan(source: Path, host: str, *, project: Path | None = None,
              global_install: bool = False, home: Path | None = None,
              legacy_command: bool = False, upgrade: bool = False) -> Plan:
    if host not in {"claude", "opencode"}:
        raise InstallError("host must be claude or opencode")
    if global_install == (project is not None):
        raise InstallError("Choose exactly one of --project and --global")
    if legacy_command and host != "opencode":
        raise InstallError("--legacy-command is only supported for OpenCode")
    source = source.expanduser().resolve(strict=True)
    if global_install:
        base = (home or Path.home()).expanduser().resolve(strict=True)
        roots = (base / ".claude", base / ".config" / "opencode", base / ".agents")
    else:
        assert project is not None
        base = project.expanduser().resolve(strict=True)
        roots = (base / ".claude", base / ".opencode", base / ".agents")
    if not base.is_dir():
        raise InstallError(f"Installation base isn't a directory: {base}")
    config_root = roots[0] if host == "claude" else roots[1]
    skill = config_root / "skills" / "obsess"
    duplicates = tuple(root / "skills" / "obsess" for root in roots if root != config_root)
    plan = Plan(
        source=source, config_root=config_root, skill=skill,
        command=config_root / "commands" / "obsess.md" if legacy_command else None,
        duplicate_paths=duplicates, legacy_command=legacy_command, upgrade=upgrade,
    )
    validate(plan)
    return plan


def describe(plan: Plan) -> dict[str, Any]:
    return {
        "skill": str(plan.skill),
        "command": str(plan.command) if plan.command else None,
        "upgrade_requested": plan.upgrade,
        "native_opencode_slash": not plan.legacy_command,
        "network_access": False,
        "permissions_changed": False,
    }


def _promote(staged: Path, destination: Path) -> None:
    staged.rename(destination)


def install(plan: Plan, *, dry_run: bool = False) -> dict[str, Any]:
    validate(plan)
    result = describe(plan)
    if dry_run:
        return {**result, "status": "dry_run", "files_written": False}

    plan.config_root.mkdir(parents=True, exist_ok=True)
    stage = Path(tempfile.mkdtemp(prefix=".obsess-stage-", dir=plan.config_root))
    promoted: list[Path] = []
    backups: list[tuple[Path, Path]] = []
    backup_root: Path | None = None
    try:
        staged_skill = stage / "skill"
        shutil.copytree(
            plan.source, staged_skill,
            ignore=shutil.ignore_patterns("__pycache__", "*.pyc", ".git", ".DS_Store", ".pytest_cache"),
        )
        items: list[tuple[Path, Path, str]] = [(staged_skill, plan.skill, "skill")]
        if plan.legacy_command:
            installed_skill = staged_skill / "SKILL.md"
            text = installed_skill.read_text(encoding="utf-8")
            installed_skill.write_text(
                text.replace('  opencode/slash: "true"', '  opencode/slash: "false"', 1),
                encoding="utf-8",
            )
            staged_command = stage / "command.md"
            shutil.copy2(plan.source / "references" / "integrations" / "opencode" / "obsess.md", staged_command)
            assert plan.command is not None
            items.append((staged_command, plan.command, "command.md"))

        # Revalidate before touching existing installations. This isn't a concurrency lock.
        validate(plan)
        if any(destination.exists() for _, destination, _ in items):
            backup_parent = plan.config_root / "obsess-backups"
            backup_parent.mkdir(parents=True, exist_ok=True)
            stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ-")
            backup_root = Path(tempfile.mkdtemp(prefix=stamp, dir=backup_parent))
        for staged, destination, backup_name in items:
            destination.parent.mkdir(parents=True, exist_ok=True)
            if destination.exists():
                assert backup_root is not None
                backup = backup_root / backup_name
                destination.rename(backup)
                backups.append((destination, backup))
            _promote(staged, destination)
            promoted.append(destination)
        return {**result, "status": "installed", "files_written": True,
                "backup": str(backup_root) if backup_root else None}
    except Exception as exc:
        rollback_errors: list[str] = []
        for destination in reversed(promoted):
            try:
                if destination.is_dir():
                    shutil.rmtree(destination)
                elif destination.exists():
                    destination.unlink()
            except OSError as error:
                rollback_errors.append(str(error))
        for destination, backup in reversed(backups):
            try:
                if destination.exists() or destination.is_symlink():
                    raise InstallError(f"Can't restore backup over an existing path: {destination}")
                backup.rename(destination)
            except (OSError, InstallError) as error:
                rollback_errors.append(str(error))
        if backup_root is not None:
            try:
                backup_root.rmdir()  # Remove only an empty, successfully restored backup.
            except OSError:
                pass
        message = f"Installation failed: {exc}. Existing files were restored where possible."
        if rollback_errors:
            message += f" Backup location: {backup_root}. Recovery errors: " + "; ".join(rollback_errors)
        raise InstallError(message) from exc
    finally:
        shutil.rmtree(stage, ignore_errors=True)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", required=True, choices=("claude", "opencode"))
    target = parser.add_mutually_exclusive_group(required=True)
    target.add_argument("--project", type=Path, help="Existing project directory")
    target.add_argument("--global", dest="global_install", action="store_true", help="Install for this user")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--upgrade", action="store_true", help="Back up an existing copy before replacement")
    parser.add_argument("--legacy-command", action="store_true", help="Use an OpenCode command wrapper instead of native slash registration")
    args = parser.parse_args(argv)
    try:
        plan = make_plan(Path(__file__).resolve().parents[1], args.host,
                         project=args.project, global_install=args.global_install,
                         legacy_command=args.legacy_command, upgrade=args.upgrade)
        result = install(plan, dry_run=args.dry_run)
    except (InstallError, OSError, ValueError) as exc:
        print(json.dumps({"status": "error", "reason": str(exc)}, ensure_ascii=False), file=sys.stderr)
        return 2
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
