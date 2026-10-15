---
name: aws-skills
description: "Plan and review AWS architecture and infrastructure changes using the upstream AWS skill collection."
risk: safe
source: "https://github.com/zxkane/aws-skills"
date_added: "2026-02-27"
---

# AWS Skill Collection Workflow

## When to Use
- You need to choose an AWS architecture or infrastructure workflow for an existing application.
- You want to review an infrastructure plan before any cloud change.

## Workflow
1. Establish the application requirements, existing AWS services, target account/region, constraints, and required outcome. Read the project's infrastructure definitions before proposing changes.
2. Open the [upstream AWS skill collection](https://github.com/zxkane/aws-skills) and select the workflow matching the actual services and infrastructure framework. This catalog entry is a routing workflow; it does not bundle every upstream skill.
3. Read that workflow's prerequisites and referenced documentation. For an existing deployment, request authorized read-only inventory or use user-provided configuration; do not infer account identity from names.
4. Produce an architecture or infrastructure plan with resource boundaries, IAM access, networking, cost assumptions, and a validation/rollback plan. Distinguish observed configuration from proposed changes.
5. Review the plan with the user before any operation that creates, modifies, or deletes cloud resources. Follow the selected tool's current documentation and the project's normal review/deployment process.
6. Verify the result against the requested requirements and report which checks ran, which were simulated, and which require deployment access.

## Example
> Review this application's AWS infrastructure and propose a least-privilege change plan. Read configuration first; do not deploy.

## Limitations
- The upstream collection is an external prerequisite; report inaccessible guidance instead of inventing its instructions.
- Planning does not prove a deployment works. Never claim account, pricing, permissions, or availability without current evidence.
- Cloud changes require the user's authorized scope and the project's deployment controls.
