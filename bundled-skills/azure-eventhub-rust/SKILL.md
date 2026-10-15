---
name: azure-eventhub-rust
description: Azure Event Hubs SDK for Rust. Use for sending and receiving events, streaming data ingestion.
risk: critical
source: community
date_added: '2026-02-27'
---

# Azure Event Hubs SDK for Rust

Client library for Azure Event Hubs — big data streaming platform and event ingestion service.

The examples below require a reviewed compatible crate set and replacement of every resource placeholder. Do not use production data for demonstration writes.

## Installation

```sh
cargo add azure_messaging_eventhubs@=0.16.0 azure_identity@=1.1.0-beta.1 azure_core@=1.2.0-beta.1
```

## Environment Variables

```bash
export EVENTHUBS_HOST="<namespace>.servicebus.windows.net"
export EVENTHUB_NAME="<eventhub-name>"
```

## Key Concepts

- **Namespace** — container for Event Hubs
- **Event Hub** — stream of events partitioned for parallel processing
- **Partition** — ordered sequence of events
- **Producer** — sends events to Event Hub
- **Consumer** — receives events from partitions

## Producer Client

### Create Producer

```rust
use azure_identity::DeveloperToolsCredential;
use azure_messaging_eventhubs::ProducerClient;

let credential = DeveloperToolsCredential::new(None)?;
let producer = ProducerClient::builder()
    .open("<namespace>.servicebus.windows.net", "eventhub-name", credential.clone())
    .await?;
```

### Send Single Event

```rust
producer.send_event(vec![1, 2, 3, 4], None).await?;
```

### Send Batch

```rust
let batch = producer.create_batch(None).await?;
if !batch.try_add_event_data(b"event 1".to_vec(), None)? {
    return Err("Event does not fit in the batch".into());
}
if !batch.try_add_event_data(b"event 2".to_vec(), None)? {
    return Err("Send the existing batch and retry the remaining event in a new batch".into());
}

producer.send_batch(batch, None).await?;
```

## Consumer Client

### Create Consumer

```rust
use azure_messaging_eventhubs::ConsumerClient;

let credential = DeveloperToolsCredential::new(None)?;
let consumer = ConsumerClient::builder()
    .open("<namespace>.servicebus.windows.net", "eventhub-name", credential.clone())
    .await?;
```

### Receive Events

```rust
// Open receiver for specific partition
use futures::StreamExt;
let receiver = consumer.open_receiver_on_partition("0".to_string(), None).await?;
let mut events = receiver.stream_events();
// Bound the receive loop and handle the no-event timeout without logging payloads.
for _ in 0..100 {
    match tokio::time::timeout(std::time::Duration::from_secs(10), events.next()).await {
        Ok(Some(Ok(event))) => { /* process the authorized event and checkpoint safely */ }
        Ok(Some(Err(error))) => return Err(error.into()),
        Ok(None) | Err(_) => break,
    }
}
```

### Get Event Hub Properties

```rust
let properties = consumer.get_eventhub_properties(None).await?;
println!("Partitions: {:?}", properties.partition_ids);
```

### Get Partition Properties

```rust
let partition_props = consumer.get_partition_properties("0", None).await?;
println!("Last sequence number: {}", partition_props.last_enqueued_sequence_number);
```

## Best Practices

1. **Reuse clients** — create once, send many events
2. **Use batches** — more efficient than individual sends
3. **Check batch capacity** — `try_add_event_data` returns false when full
4. **Process partitions in parallel** — each partition can be consumed independently
5. **Use consumer groups** — isolate different consuming applications
6. **Handle checkpointing** — use `azure_messaging_eventhubs_checkpointstore_blob` for distributed consumers

## Checkpoint Store (Optional)

For distributed consumers with checkpointing:

```sh
cargo add azure_messaging_eventhubs_checkpointstore_blob
```

Event Hubs 0.16 uses the Azure core beta line, so pair it with the published matching identity beta; do not mix credential traits from the stable core line.

The reviewed example set uses `azure_messaging_eventhubs 0.16.0` and compatible Azure core/credential crates. Record and commit Cargo.lock; source/API review is not a compiler or live-service test.

## Reference Links

| Resource | Link |
|----------|------|
| API Reference | https://docs.rs/azure_messaging_eventhubs |
| Source Code | https://github.com/Azure/azure-sdk-for-rust/tree/main/sdk/eventhubs/azure_messaging_eventhubs |
| crates.io | https://crates.io/crates/azure_messaging_eventhubs |

## When to Use
Use when a Rust application publishes individual/batched events or consumes a specific Event Hubs partition with an explicit consumer group and checkpoint policy.

## Limitations
- Examples are fragments inside async application code, with compatible pinned Azure crates and the required Tokio/Serde/Futures dependencies; verify the selected version’s API before use. They were reviewed against official source/reference, not compiled or run against a cloud account here.
- Use an authorized tenant, resource and identity with least privilege. Writes, overwrites, deletes, backup retrieval and account changes require the corresponding scope; cleanup may remove only explicitly identified disposable resources. Bound requests, retries and downloaded bytes, and do not log payloads, credentials or secret values.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
