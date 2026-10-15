---
name: aegisops-ai
description: "Autonomous DevSecOps & FinOps Guardrails. Guide to reviewing Linux kernel patches, Terraform cost changes and Kubernetes policy with a separately reviewed upstream tool and configured model."
risk: critical
source: community
author: Champbreed
date_added: "2026-03-24"
---

# /aegisops-ai — Autonomous Governance Orchestrator

AegisOps-AI is described by its upstream as a governance pipeline
that integrates advanced AI reasoning directly into
the SDLC. It acts as an intelligent gatekeeper for
systems-level security, cloud infrastructure costs,
and Kubernetes compliance.

## Goal

To automate high-stakes security and financial audits by:
1. Identifying logic-based vulnerabilities (UAF, Stale
State) in Linux Kernel patches.
2. Detecting massive "Silent Disaster" cost drifts in
Terraform plans.
3. Translating natural language security intent into
hardened K8s manifests.

## When to Use
- **Kernel Patch Review:** Auditing raw C-based Git diffs for memory safety.
- **Pre-Apply IaC Audit:** Analyzing `terraform plan` outputs to prevent bill spikes.
- **Cluster Hardening:** Generating "Least Privilege" securityContexts for deployments.
- **CI/CD Quality Gating:** Blocking non-compliant merges via GitHub Actions.

## When Not to Use

- **Web App Logic:** Do not use for standard web vulnerabilities (XSS, SQLi); use dedicated SAST scanners.
- **Non-C Memory Analysis:** The patch analyzer is optimized for C-logic; avoid using it for high-level languages like Python or JS.
- **Direct Resource Mutation:** This is an *auditor*, not a deployment tool. It does not execute `terraform apply` or `kubectl apply`.
- **Post-Mortem Analysis:** For analyzing *why* a previous AI session failed, use `/analyze-project` instead.

---
## 🤖 Generative AI Integration

AegisOps-AI leverages the **Google GenAI SDK** to implement a "Reasoning Path" for autonomous security and financial audits:

* **Neural Patch Analysis:** Performs semantic code reviews of Linux Kernel patches, moving beyond simple pattern matching to understand complex memory state logic.
* **Intelligent Cost Synthesis:** Processes raw Terraform plan diffs through a financial reasoning model to detect high-risk resource escalations and "silent" fiscal drifts.
* **Natural Language Policy Mapping:** Translates human security intent into syntactically correct, hardened Kubernetes `securityContext` configurations.

## 🧭 Core Modules

### 1. 🐧 Kernel Patch Reviewer (`patch_analyzer.py`)

* **Problem:** Manual review of Linux Kernel memory safety is time-consuming and prone to human error.
* **Solution:** A configured model proposes findings on raw Git diffs; verify each reachable trigger and consequence through code review and appropriate tests. No latency or detection guarantee is made.
* **Key Output:** `analysis_results.json`

### 2. 💰 FinOps & Cloud Auditor (`cost_auditor.py`)

* **Problem:** Infrastructure-as-Code (IaC) changes can lead to accidental "Silent Disasters" and massive cloud bill spikes.
* **Solution:** Analyzes `terraform plan` output to identify cost anomalies—such as accidental upgrades from `t3.micro` to high-performance GPU instances.
* **Key Output:** `infrastructure_audit_report.json`

### 3. ☸️ K8s Policy Hardener (`k8s_policy_generator.py`)

* **Problem:** Implementing "Least Privilege" security contexts in Kubernetes is complex and often neglected.
* **Solution:** Translates natural language security requirements into candidate YAML manifests requiring schema, policy and application validation (Read-only root FS, Non-root enforcement, etc.).
* **Key Output:** `hardened_deployment.yaml`

## 🛠️ Setup & Environment

AAS bundles this guide only: `patch_analyzer.py`, `cost_auditor.py`, `k8s_policy_generator.py`, `main.py` and their reports are upstream components, not local bundled files. Verify the upstream repository, a fixed revision, license, dependencies, model availability and actual entry point before using the tool. Treat provider findings as advisory, not an automatic CI merge authority.

Obtain authorization for paid model calls and transmission of private patches, plans or cluster configuration. Redact secrets and personal/account identifiers; do not assume `.env` storage is automatically secure.

### 1. Clone the Repository

```bash
git clone https://github.com/Champbreed/AegisOps-AI.git
cd AegisOps-AI
```
## 2. Setup

```bash
python3 -m venv venv
source venv/bin/activate
pip install google-genai python-dotenv
```
### 3. API Configuration

Use the host's existing private credential mechanism for `GEMINI_API_KEY`. If a local `.env` is required by the reviewed upstream implementation, ensure it is owner-only and gitignored, preserve any existing file and never display its contents. Confirm the installed SDK/model combination instead of assuming an old model alias remains available.

## 🏁 Operational Dashboard

Only after reviewing the fixed upstream checkout and authorizing its network/cost effects, its documented entry point may be run there:

```bash
python3 main.py
```
### Pattern: Over-Privileged Container

* **Indicators:** `allowPrivilegeEscalation: true` or root user execution.
* **Investigation:** Pass security intent (e.g., "non-root only") to the K8s Hardener module.

---

## 💡 Best Practices

* **Context is King:** Provide at least 5 lines of context around Git diffs for more accurate neural reasoning.
* **Continuous Gating:** Run the FinOps auditor before every infrastructure change, not after.
* **Manual Sign-off:** Use AI findings as a high-fidelity signal, but maintain human-in-the-loop for kernel-level merges.

---

## 🔒 Security & Safety Notes

* **Key Management:** Use CI/CD secrets for `GEMINI_API_KEY` in production.
* **Least Privilege:** Test "Hardened" manifests in staging first to ensure no functional regressions.

## Links

- **Repository**: https://github.com/Champbreed/AegisOps-AI
- **Documentation**: https://github.com/Champbreed/AegisOps-AI#readme

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
