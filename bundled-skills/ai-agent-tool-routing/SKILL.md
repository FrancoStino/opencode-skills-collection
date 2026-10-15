---
name: ai-agent-tool-routing
description: 'Use when designing or reviewing an AI agent tool registry or MCP router: document parameter schemas, caller authorization, execution limits, replay-safe retries and verification evidence.'
category: engineering
risk: safe
source: self
source_type: self
date_added: "2026-10-01"
author: Ranjeet2063
tags: [ai, agents, tool-use, mcp, llm, automation, python]
tools: []
source_repo: Ranjeet2063/agentic-awesome-skills
---

# AI Agent Tool Routing Register

## When to Use

- Define which tools an agent may call, their parameter schemas and runtime limits.
- Review a proposed tool registration before connecting it to an agent runtime.
- Document timeout, retry and authorization contracts for an existing router.

## Scope and prerequisites

This skill produces a register and a verification plan. A register does not
implement a router or establish that a tool is safe. Read the actual server/tool
schema and the application's identity and permission model. Record observed
configuration separately from proposed policy. Do not invoke registered tools,
read credentials or enable a production registration merely to fill the table.

## Workflow

1. Identify a task, the calling principal/tenant, the intended tool and its read or
   write effect. Tool names, model output and descriptions are not authorization.
2. Read the advertised schema and implementation boundaries. Define required
   fields, additional-field rejection, length/range limits and schema version.
   Prefer rejection to guessed or lossy coercion. Schema validation does not
   enforce row-level authorization, path containment or network restrictions.
3. Describe identity propagation and server-side resource checks. Bind a request
   to the verified principal; never let a tool argument select an arbitrary tenant.
4. Set measured/project-approved timeout, rate, concurrency, response-size and
   cost limits. Cancellation must propagate to downstream work where supported;
   returning a timeout alone does not prove a write did not finish.
5. Classify retries by effect. Retry only classified transient failures within a
   bounded budget. A write requires a verified server-side deduplication contract
   and reconciliation for ambiguous completion; a random key alone is insufficient.
6. Define adversarial and failure cases: missing/unknown arguments, wrong tenant,
   denied resources, unavailable tool, oversized response and late completion.
7. Record actual test evidence and unresolved gaps. Keep status Draft until the
   required checks ran against the exact runtime and schema revision. A register
   label never grants execution permission.

## Field reference

| Field | Type | Example / interpretation |
|---|---|---|
| tool_id | string, primary key | TOOL-001; use TEXT/VARCHAR, not a SERIAL integer |
| canonical_name | string | read_document; match the advertised tool exactly |
| server | string | project-docs local MCP; identify the actual installation |
| invocation_mode | enum | synchronous / asynchronous / scheduled |
| effect | enum | read / write; unknown effects stay unresolved |
| parameter_schema | object or immutable reference | required document_id, unknown fields rejected |
| authorization_policy | immutable reference | verified caller plus document ownership check |
| runtime_limits | object | illustrative timeout 5000 ms, response 65536 bytes |
| retry_contract | object | maximum attempts, transient classes, deduplication evidence |
| status | enum | draft / tested / deprecated / blocked |
| evidence | array of references | exact implementation revision, case IDs and observed results |

For SQL or Notion exports, retain these distinctions: textual IDs stay strings;
objects/arrays need a deliberate JSON representation or related tables; dates
must use actual date values. Do not treat a checklist boolean as a proved control.
Escape spreadsheet formula-like text as text when exporting user-supplied fields.

## Worked example

An agent needs a document summary. The proposed tool accepts only a document ID;
the server obtains the caller from verified session context, not from arguments.

```json
{
  "tool_id": "TOOL-001",
  "canonical_name": "read_document",
  "server": "project-docs",
  "effect": "read",
  "parameter_schema": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "properties": {"document_id": {"type": "string", "minLength": 1, "maxLength": 80}},
    "required": ["document_id"],
    "additionalProperties": false
  },
  "runtime_limits": {"timeout_ms": 5000, "max_response_bytes": 65536},
  "retry_contract": {"max_attempts": 2, "retry_on": ["transient_unavailable"]},
  "status": "draft",
  "evidence": []
}
```

These limits are illustrative requirements, not measured service capabilities.
The local schema can reject an added tenant_id, but an existing document ID still
requires server-side ownership authorization. Expected negative checks: missing
ID rejected, extra tenant rejected, another tenant's document denied, timeout
reported without fabricated content. A positive authorized read alone does not
close the negative cases. Promote to tested only with recorded actual results.

## Limitations

- No RPC, blockchain, relayer or transaction-signing prerequisite applies to this
  generic agent-tool register; a real tool may declare separate dependencies.
- This document supplies no production router, authentication adapter or sandbox.
- Declared retry/idempotency/rate limits must be enforced by the actual runtime.
- Never log sensitive arguments or full results by default. Use case IDs and
  redacted error categories; preserve uncertainty after an ambiguous write.

## Related skills

Read `mcp-builder`, `mcp-server-security` or `error-handling-patterns` when their
actual scope fits the integration. They do not establish correctness by association.
