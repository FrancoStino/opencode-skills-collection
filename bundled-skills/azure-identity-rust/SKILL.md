---
name: azure-identity-rust
description: Azure Identity SDK for Rust authentication. Use for DeveloperToolsCredential, ManagedIdentityCredential, ClientSecretCredential, and token-based authentication.
risk: critical
source: community
date_added: '2026-02-27'
---

# Azure Identity SDK for Rust

Authentication library for Azure SDK clients using Microsoft Entra ID (formerly Azure AD).

The examples below require a reviewed compatible crate set and replacement of every resource placeholder. Do not use production data for demonstration writes.

## Installation

```sh
cargo add azure_identity@=1.0.0 azure_core@=1.1.0
```

## Environment Variables

```bash
# Service Principal (for production/CI)
export AZURE_TENANT_ID="<your-tenant-id>"
export AZURE_CLIENT_ID="<your-client-id>"
: "${AZURE_CLIENT_SECRET:?Inject through the approved host or CI secret manager}"
export AZURE_CLIENT_SECRET

# User-assigned Managed Identity (optional)
export AZURE_CLIENT_ID="<managed-identity-client-id>"
```

## DeveloperToolsCredential

The recommended credential for local development. Tries developer tools in order (Azure CLI, Azure Developer CLI):

```rust
use azure_identity::DeveloperToolsCredential;
use azure_security_keyvault_secrets::SecretClient;

let credential = DeveloperToolsCredential::new(None)?;
let client = SecretClient::new(
    "https://my-vault.vault.azure.net/",
    credential.clone(),
    None,
)?;
```

### Credential Chain Order

| Order | Credential | Environment |
|-------|-----------|-------------|
| 1 | AzureCliCredential | `az login` |
| 2 | AzureDeveloperCliCredential | `azd auth login` |

## Credential Types

| Credential | Usage |
|------------|-------|
| `DeveloperToolsCredential` | Local development - tries CLI tools |
| `ManagedIdentityCredential` | Azure VMs, App Service, Functions, AKS |
| `WorkloadIdentityCredential` | Kubernetes workload identity |
| `ClientSecretCredential` | Service principal with secret |
| `ClientCertificateCredential` | Service principal with certificate |
| `AzureCliCredential` | Direct Azure CLI auth |
| `AzureDeveloperCliCredential` | Direct azd CLI auth |
| `AzurePipelinesCredential` | Azure Pipelines service connection |
| `ClientAssertionCredential` | Custom assertions (federated identity) |

## ManagedIdentityCredential

For Azure-hosted resources:

```rust
use azure_identity::{ManagedIdentityCredential, ManagedIdentityCredentialOptions, UserAssignedId};

// System-assigned managed identity
let credential = ManagedIdentityCredential::new(None)?;

// User-assigned managed identity
let options = ManagedIdentityCredentialOptions {
    user_assigned_id: Some(UserAssignedId::ClientId("<user-assigned-mi-client-id>".into())),
    ..Default::default()
};
let credential = ManagedIdentityCredential::new(Some(options))?;
```

## ClientSecretCredential

For service principal with secret:

```rust
use azure_identity::ClientSecretCredential;

let credential = ClientSecretCredential::new(
    "<tenant-id>".into(),
    "<client-id>".into(),
    "<client-secret>".into(),
    None,
)?;
```

## Best Practices

1. **Use `DeveloperToolsCredential` for local dev** — automatically picks up Azure CLI
2. **Use `ManagedIdentityCredential` in production** — no secrets to manage
3. **Clone credentials** — credentials are `Arc`-wrapped and cheap to clone
4. **Reuse credential instances** — same credential can be used with multiple clients
5. **Provide the async runtime** — add Tokio with the features required by your application; do not assume a crate-specific `tokio` feature exists

The reviewed example set uses `azure_identity 1.0.0` and compatible Azure core/credential crates. Record and commit Cargo.lock; source/API review is not a compiler or live-service test.

## Reference Links

| Resource | Link |
|----------|------|
| API Reference | https://docs.rs/azure_identity |
| Source Code | https://github.com/Azure/azure-sdk-for-rust/tree/main/sdk/identity/azure_identity |
| crates.io | https://crates.io/crates/azure_identity |

## When to Use
Use when choosing or configuring Entra ID credentials for Rust Azure SDK clients: local developer tools, managed/workload identity or a reviewed service principal.

## Limitations
- Examples are fragments inside async application code, with compatible pinned Azure crates and the required Tokio/Serde/Futures dependencies; verify the selected version’s API before use. They were reviewed against official source/reference, not compiled or run against a cloud account here.
- Use an authorized tenant, resource and identity with least privilege. Writes, overwrites, deletes, backup retrieval and account changes require the corresponding scope; cleanup may remove only explicitly identified disposable resources. Bound requests, retries and downloaded bytes, and do not log payloads, credentials or secret values.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
