#!/usr/bin/env python3
"""Backward-compatible shim.

The implementation now lives in ``polis/routing.py``. This shim keeps existing
references working (SKILL.md, docs, the reconcile regression test, and anyone
calling ``python3 scripts/route_contract.py``).
"""
import sys
from pathlib import Path

# Make the `polis` package importable when this file is run directly from the repo.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from polis.routing import *  # noqa: F401,F403
# Re-export private helpers used by scripts/test_reconcile_parsing.py.
from polis.routing import _extract_quality, _extract_actual_minutes, main  # noqa: F401

if __name__ == "__main__":
    main()
