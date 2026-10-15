---
name: azure-cosmos-rust
description: Azure Cosmos DB SDK for Rust (NoSQL API). Use for document CRUD, queries, containers, and globally distributed data.
risk: critical
source: community
date_added: '2026-02-27'
---

# Azure Cosmos DB SDK for Rust

Client library for Azure Cosmos DB NoSQL API — globally distributed, multi-model database.

The examples below require a reviewed compatible crate set and replacement of every resource placeholder. Do not use production data for demonstration writes.

## Installation

```sh
cargo add azure_data_cosmos@=0.37.1 azure_identity@=1.0.0 azure_core@=1.1.0
```

## Environment Variables

```bash
export COSMOS_ENDPOINT="https://<account>.documents.azure.com:443/"
export COSMOS_DATABASE="mydb"
export COSMOS_CONTAINER="mycontainer"
```

## Authentication

```rust
use azure_identity::DeveloperToolsCredential;
use azure_data_cosmos::{AccountEndpoint, AccountReference, CosmosClient, RoutingStrategy};

let credential = DeveloperToolsCredential::new(None)?;
let endpoint: AccountEndpoint = "https://<account>.documents.azure.com/".parse()?;
let account = AccountReference::with_credential(endpoint, credential.clone());
let client = CosmosClient::builder()
    .build(account, RoutingStrategy::ProximityTo("East US".into()))
    .await?;
```

## Client Hierarchy

| Client | Purpose | Get From |
|--------|---------|----------|
| `CosmosClient` | Account-level operations | Direct instantiation |
| `DatabaseClient` | Database operations | `client.database_client()` |
| `ContainerClient` | Container/item operations | `database.container_client()` |

## Core Workflow

### Get Database and Container Clients

```rust
let database = client.database_client("myDatabase");
let container = database.container_client("myContainer", None).await?;
```

### Create Item

```rust
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
struct Item {
    pub id: String,
    pub partition_key: String,
    pub value: String,
}

let item = Item {
    id: "1".into(),
    partition_key: "partition1".into(),
    value: "hello".into(),
};

container.create_item("partition1", "1", item, None).await?;
```

### Read Item

```rust
let response = container.read_item("partition1", "1", None).await?;
let item: Item = response.into_model()?;
```

### Replace Item

```rust
let mut item: Item = container.read_item("partition1", "1", None).await?.into_model()?;
item.value = "updated".into();

container.replace_item("partition1", "1", item, None).await?;
```

### Patch Item

```rust
// Explicit preview opt-in: cargo add azure_data_cosmos@=0.37.1 --features preview_patch
use azure_data_cosmos::models::{PatchInstructions, PatchOperation};

let patch = PatchInstructions::from(vec![
    PatchOperation::set("/value", serde_json::json!("newValue")),
]);
let patched: Item = container.patch_item("partition1", "1", patch, None)
    .await?.into_model()?;
```

### Delete Item

```rust
container.delete_item("partition1", "1", None).await?;
```

The reviewed current API uses an async builder/container initialization and a separate explicit item ID. Preview PATCH is not a production-ready guarantee; review its selected strategy, conflict/retry behavior and request-unit cost. [Official crate reference](https://docs.rs/azure_data_cosmos/0.37.1/azure_data_cosmos/).

## Key Auth (Optional)

Enable key-based authentication with feature flag:

```sh
cargo add azure_data_cosmos@=0.37.1 --features key_auth
```

## Best Practices

1. **Always specify partition key** — required for point reads and writes
2. **Use `into_model()?`** — to deserialize responses into your types
3. **Derive `Serialize` and `Deserialize`** — for all document types
4. **Use Entra ID auth** — prefer `DeveloperToolsCredential` over key auth
5. **Reuse client instances** — clients are thread-safe and reusable

The reviewed example set uses `azure_data_cosmos 0.37.1` and compatible Azure core/credential crates. Record and commit Cargo.lock; source/API review is not a compiler or live-service test.

## Reference Links

| Resource | Link |
|----------|------|
| API Reference | https://docs.rs/azure_data_cosmos |
| Source Code | https://github.com/Azure/azure-sdk-for-rust/tree/main/sdk/cosmos/azure_data_cosmos |
| crates.io | https://crates.io/crates/azure_data_cosmos |

## When to Use
Use when a Rust application needs Cosmos DB NoSQL item CRUD, partition-key point reads, container access or explicitly opted-in preview patching.

## Limitations
- Examples are fragments inside async application code, with compatible pinned Azure crates and the required Tokio/Serde/Futures dependencies; verify the selected version’s API before use. They were reviewed against official source/reference, not compiled or run against a cloud account here.
- Use an authorized tenant, resource and identity with least privilege. Writes, overwrites, deletes, backup retrieval and account changes require the corresponding scope; cleanup may remove only explicitly identified disposable resources. Bound requests, retries and downloaded bytes, and do not log payloads, credentials or secret values.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
