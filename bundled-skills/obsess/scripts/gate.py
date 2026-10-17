#!/usr/bin/env python3
"""Compare evaluator-produced scalar receipts. This does not authenticate evidence.

Exit codes: 0 accept, 1 reject, 2 invalid input, 3 inconclusive.
Requires Python 3.10+ and only the standard library. Makes no external calls.
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from decimal import Decimal
from pathlib import Path
from typing import Any

MAX_INPUT_BYTES = 1_000_000


def nonempty(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{label} must be a non-empty string")
    return value


def number(value: Any, label: str) -> Decimal:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{label} must be a finite JSON number")
    try:
        finite = math.isfinite(value)
    except (OverflowError, TypeError):
        finite = False
    if not finite:
        raise ValueError(f"{label} must be finite")
    return Decimal(str(value))


def object_value(value: Any, label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ValueError(f"{label} must be a JSON object")
    return value


def verdict(status: str, reason: str, delta: Decimal | None = None) -> dict[str, Any]:
    result: dict[str, Any] = {
        "status": status,
        "reason": reason,
        "basis": "reported_measurements_only",
        "evidence_authenticated": False,
    }
    if delta is not None:
        # String preserves decimal subtraction without binary floating-point noise.
        result["improvement"] = str(delta)
    return result


def decide(contract: dict[str, Any], baseline: dict[str, Any],
           candidate: dict[str, Any]) -> dict[str, Any]:
    """Fail closed on incompatible receipts; no mutation or file operations."""
    contract = object_value(contract, "contract")
    if type(contract.get("schema_version")) is not int or contract["schema_version"] != 1:
        raise ValueError("contract.schema_version must be integer 1")

    for field in ("contract_id", "evaluator_revision", "comparison_key"):
        nonempty(contract.get(field), f"contract.{field}")

    metric = object_value(contract.get("primary_metric"), "primary_metric")
    metric_name = nonempty(metric.get("name"), "primary_metric.name")
    direction = metric.get("direction")
    if direction not in ("minimise", "maximise"):
        raise ValueError("direction must be 'minimise' or 'maximise'")
    minimum = number(metric.get("min_delta"), "primary_metric.min_delta")
    if minimum < 0:
        raise ValueError("min_delta must not be negative")

    gates = contract.get("required_gates")
    if not isinstance(gates, list) or not gates:
        raise ValueError("required_gates must be a non-empty list")
    for gate in gates:
        nonempty(gate, "required_gates item")
    if len(set(gates)) != len(gates):
        raise ValueError("required_gates must not contain duplicates")

    values: dict[str, Decimal] = {}
    receipts = {"baseline": baseline, "candidate": candidate}
    for label, raw in receipts.items():
        receipt = object_value(raw, label)
        for field in ("contract_id", "evaluator_revision", "comparison_key"):
            if receipt.get(field) != contract[field]:
                raise ValueError(f"{label}.{field} doesn't match the frozen contract")
        nonempty(receipt.get("artifact_id"), f"{label}.artifact_id")
        if receipt.get("metric_name") != metric_name:
            raise ValueError(f"{label}.metric_name doesn't match the contract")
        if receipt.get("measurement_valid") is not True:
            raise ValueError(f"{label}.measurement_valid must be true")
        refs = receipt.get("evidence_refs")
        if not isinstance(refs, list) or not refs:
            raise ValueError(f"{label}.evidence_refs must be a non-empty list")
        for ref in refs:
            nonempty(ref, f"{label}.evidence_refs item")
        results = object_value(receipt.get("gates"), f"{label}.gates")
        for gate in gates:
            if gate not in results or type(results[gate]) is not bool:
                raise ValueError(f"{label}.gates.{gate} must be an explicit boolean")
        values[label] = number(receipt.get("value"), f"{label}.value")

    failed_baseline = [gate for gate in gates if not baseline["gates"][gate]]
    if failed_baseline:
        raise ValueError("baseline isn't eligible; resolve its contract failures before optimisation")

    failed = [gate for gate in gates if not candidate["gates"][gate]]
    if failed:
        return verdict("reject", "Candidate failed mandatory gates: " + ", ".join(failed))

    if baseline["artifact_id"] == candidate["artifact_id"]:
        return verdict("inconclusive", "The candidate identifies the same artefact as the baseline")

    delta = values["candidate"] - values["baseline"]
    if direction == "minimise":
        delta = -delta
    if delta < 0:
        return verdict("reject", "Candidate regressed on the primary metric", delta)
    if delta == 0:
        return verdict("inconclusive", "No improvement; retain the incumbent", delta)
    if delta < minimum:
        return verdict("inconclusive", "Improvement is below the agreed meaningful threshold", delta)
    return verdict("accept", "Reported gates pass and the reported improvement meets the threshold", delta)


def reject_constant(value: str) -> None:
    raise ValueError(f"Non-finite JSON constant is forbidden: {value}")


def unique_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"Duplicate JSON key: {key}")
        result[key] = value
    return result


def read_json(path: Path) -> dict[str, Any]:
    with path.open("rb") as stream:
        data = stream.read(MAX_INPUT_BYTES + 1)
    if len(data) > MAX_INPUT_BYTES:
        raise ValueError(f"Input exceeds {MAX_INPUT_BYTES} bytes: {path}")
    return object_value(json.loads(data.decode("utf-8"), parse_constant=reject_constant,
                                   object_pairs_hook=unique_object), str(path))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--contract", type=Path, required=True)
    parser.add_argument("--baseline", type=Path, required=True)
    parser.add_argument("--candidate", type=Path, required=True)
    args = parser.parse_args(argv)
    try:
        result = decide(read_json(args.contract), read_json(args.baseline), read_json(args.candidate))
    except (OSError, ValueError, TypeError, OverflowError, RecursionError) as exc:
        result = verdict("invalid", str(exc))
    print(json.dumps(result, ensure_ascii=False, allow_nan=False))
    return {"accept": 0, "reject": 1, "invalid": 2, "inconclusive": 3}[result["status"]]


if __name__ == "__main__":
    sys.exit(main())
