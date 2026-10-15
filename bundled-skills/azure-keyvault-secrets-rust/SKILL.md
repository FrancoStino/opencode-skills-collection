---
name: azure-keyvault-secrets-rust
description: 'Azure Key Vault Secrets SDK for Rust. Use for storing and retrieving secrets, passwords, and API keys. Triggers: "keyvault secrets rust", "SecretClient rust", "get secret rust", "set secret rust".'
risk: critical
source: community
date_added: '2026-02-27'
---

# Azure Key Vault Secrets SDK for Rust

Client library for Azure Key Vault Secrets — secure storage for passwords, API keys, and other secrets.

The examples below require a reviewed compatible crate set and replacement of every resource placeholder. Do not use production data for demonstration writes.

## Installation

```sh
cargo add azure_security_keyvault_secrets@=1.0.1 azure_identity@=1.0.0 azure_core@=1.1.0
```

## Environment Variables

```bash
export AZURE_KEYVAULT_URL="https://<vault-name>.vault.azure.net/"
```

## Authentication

```rust
use azure_identity::DeveloperToolsCredential;
use azure_security_keyvault_secrets::SecretClient;

let credential = DeveloperToolsCredential::new(None)?;
let client = SecretClient::new(
    "https://<vault-name>.vault.azure.net/",
    credential.clone(),
    None,
)?;
```

## Core Operations

### Get Secret

```rust
let secret = client
    .get_secret("secret-name", None)
    .await?
    .into_model()?;

let secret_value = secret.value.ok_or("Secret has no value")?;
// Pass directly to the authorized consumer; never print the value.
```

### Set Secret

```rust
use azure_security_keyvault_secrets::models::SetSecretParameters;

let params = SetSecretParameters {
    value: Some("secret-value".into()),
    ..Default::default()
};

let secret = client
    .set_secret("secret-name", params.try_into()?, None)
    .await?
    .into_model()?;
```

### Update Secret Properties

```rust
use azure_security_keyvault_secrets::models::UpdateSecretPropertiesParameters;
use std::collections::HashMap;

let params = UpdateSecretPropertiesParameters {
    content_type: Some("text/plain".into()),
    tags: Some(HashMap::from([("env".into(), "prod".into())])),
    ..Default::default()
};

client
    .update_secret_properties("secret-name", params.try_into()?, None)
    .await?;
```

### Delete Secret

```rust
client.delete_secret("secret-name", None).await?;
```

### List Secrets

```rust
use azure_security_keyvault_secrets::ResourceExt;
use futures::TryStreamExt;

let mut pager = client.list_secret_properties(None)?;
while let Some(secret) = pager.try_next().await? {
    let name = secret.resource_id()?.name;
    println!("Secret: {}", name);
}
```

### Get Specific Version

```rust
use azure_security_keyvault_secrets::models::SecretClientGetSecretOptions;

let options = SecretClientGetSecretOptions {
    secret_version: Some("version-id".into()),
    ..Default::default()
};

let secret = client
    .get_secret("secret-name", Some(options))
    .await?
    .into_model()?;
```

## Best Practices

1. **Use Entra ID auth** — `DeveloperToolsCredential` for dev, `ManagedIdentityCredential` for production
2. **Use `into_model()?`** — to deserialize responses
3. **Use `ResourceExt` trait** — for extracting names from IDs
4. **Handle soft delete** — deleted secrets can be recovered within retention period
5. **Set content type** — helps identify secret format
6. **Use tags** — for organizing and filtering secrets
7. **Version secrets** — new values create new versions automatically

## RBAC Permissions

Assign these Key Vault roles:
- `Key Vault Secrets User` — get and list
- `Key Vault Secrets Officer` — full CRUD

The reviewed example set uses `azure_security_keyvault_secrets 1.0.1` and compatible Azure core/credential crates. Record and commit Cargo.lock; source/API review is not a compiler or live-service test.

## Reference Links

| Resource | Link |
|----------|------|
| API Reference | https://docs.rs/azure_security_keyvault_secrets |
| Source Code | https://github.com/Azure/azure-sdk-for-rust/tree/main/sdk/keyvault/azure_security_keyvault_secrets |
| crates.io | https://crates.io/crates/azure_security_keyvault_secrets |

## When to Use
Use when a Rust application retrieves a specified secret/version or performs authorized secret creation, metadata updates, listing or deletion in an identified Key Vault.

## Limitations
- Examples are fragments inside async application code, with compatible pinned Azure crates and the required Tokio/Serde/Futures dependencies; verify the selected version’s API before use. They were reviewed against official source/reference, not compiled or run against a cloud account here.
- Use an authorized tenant, resource and identity with least privilege. Writes, overwrites, deletes, backup retrieval and account changes require the corresponding scope; cleanup may remove only explicitly identified disposable resources. Bound requests, retries and downloaded bytes, and do not log payloads, credentials or secret values.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
