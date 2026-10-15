---
name: manifest
description: "Install and configure the Manifest observability plugin for your agents. Use when setting up telemetry, configuring API keys, or troubleshooting the plugin."
risk: critical
source: community
date_added: "2026-02-27"
---

# Manifest setup and verification

## When to Use

- Configure an explicitly requested Manifest telemetry or gateway integration.
- Diagnose missing authorized telemetry without changing unrelated provider routing.

## Availability

This AAS tree bundles instructions, not a plugin, CLI or gateway. Identify the actual host, installed versions and current supported Manifest integration from [official documentation](https://manifest.build/llm-gateway/docs/introduction/). The historical `claude gateway` / `claude plugins` commands in earlier copies are not a verified Claude Code setup contract; do not run them or infer a host configuration path.

Telemetry-only setup and routing all inference through a gateway are distinct changes. Use the user's requested scope and preserve existing providers, credentials and other host entries.

## Procedure

1. Inspect the current authorized integration and target account/endpoint. Verify available tools or CLI help and the exact package/source version. Back up affected configuration privately before a scoped edit.
2. Reuse an existing authorized credential through the host's private credential mechanism. If absent, let the user enter it in the service or a supported local secret interface; never ask them to paste a key in chat or put it in shell arguments. A prefix check is not authentication proof.
3. Establish what data will leave the host: prompts, responses, account identifiers, costs, tool traces and error payloads. Choose actual redaction/retention controls and obtain authorization for private transmission and provider charges. Do not assume metadata-only telemetry when full-body logging is enabled.
4. Prepare the concrete supported configuration for the selected integration. Use HTTPS for remote endpoints and reject userinfo/unintended redirects; local loopback may be appropriate for a separately reviewed self-hosted service. Change only the authorized entries. Restart only the relevant service when the integration actually requires it; preserve other running tasks.
5. Send one approved synthetic fixture only if a provider call is authorized. Verify the exact request/trace, returned model or telemetry receipt, charge and secret-redacted logs at both ends. A startup log or three-second wait alone does not prove delivery. An unavailable authentication or provider check remains unverified.
6. Return the changed configuration path, backup, observed receipt and remaining limitations. Verify the rollback/disable path; do not disable a competing diagnostic plugin merely because its name looks similar.

## Example

The user requests telemetry for an existing local agent. Identify its supported exporter, draft the exact endpoint and private credential mapping, apply the authorized scoped change, and verify one synthetic trace without altering the default model provider. If only a gateway integration is available, explain that difference before making a routing change.

## Limitations

- Current Manifest keys, endpoints, plans and integrations can change; use the actual account instructions and official schemas.
- Gateway fallback or automatic request repair may change provider, data destination, parameters and retry costs; configure them only within the authorized scope.
- This guide does not prove authentication, production delivery, billing accuracy or privacy merely by being installed.
