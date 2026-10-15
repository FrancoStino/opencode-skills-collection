---
name: hosted-agents-v2-py
description: "Build hosted agents using Azure AI Projects SDK with HostedAgentDefinition. Use when creating container-based agents in Azure AI Foundry."
risk: critical
source: community
date_added: "2026-02-27"
---

## Compatibility and maintenance

Primary editorial path for this compatibility group. The instruction-only procedure remains local; no executable support files are bundled so existing installations
continue to work offline. This is one shared procedure, not an additional capability.
Preserve the callable ID when an existing manifest or client configuration uses it.
Modified in AAS on 2026-09-05; original metadata and license notices are retained.

# Azure AI Hosted Agents (Python)

Build container-based hosted agents using `HostedAgentDefinition` from the Azure AI Projects SDK.

## Installation

```bash
pip install 'azure-ai-projects==2.3.0' azure-identity
```

These are SDK 2.3.0 instruction fragments aligned with the current Microsoft hosted-agent guide. Validate the installed schema and service support before provisioning; documentation inspection is not a cloud integration test.

## Environment Variables

```bash
export AZURE_AI_PROJECT_ENDPOINT="https://<resource>.services.ai.azure.com/api/projects/<project>"
```

## Prerequisites

Before creating hosted agents:

1. **Container Image** - Build and push to Azure Container Registry (ACR)
2. **ACR Pull Permissions** - Grant the project identity the registry role supported by its permission mode; current hosted-agent guidance uses Container Registry Repository Reader
3. **Capability Host** - Confirm current project/region hosted-agent availability and the application's network policy; do not enable public hosting automatically
4. **SDK Version** - Ensure `azure-ai-projects==2.3.0`

## Authentication

Use the approved Azure credential flow for the intended tenant/subscription; this sketch uses `DefaultAzureCredential`:

```python
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient

import os

credential = DefaultAzureCredential()
client = AIProjectClient(
    endpoint=os.environ["AZURE_AI_PROJECT_ENDPOINT"],
    credential=credential
)
```

## Core Workflow

### 1. Imports

```python
import os
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import (
    HostedAgentDefinition,
    ContainerConfiguration,
    ProtocolVersionRecord,
    AgentEndpointProtocol,
)
```

### 2. Create Hosted Agent

```python
client = AIProjectClient(
    endpoint=os.environ["AZURE_AI_PROJECT_ENDPOINT"],
    credential=DefaultAzureCredential()
)

agent = client.agents.create_version(
    agent_name="my-hosted-agent",
    definition=HostedAgentDefinition(
        protocol_versions=[
            ProtocolVersionRecord(protocol=AgentEndpointProtocol.RESPONSES, version="2.0.0")
        ],
        cpu="1",
        memory="2Gi",
        container_configuration=ContainerConfiguration(image=os.environ["REVIEWED_CONTAINER_IMAGE"]),
        environment_variables={
            "AZURE_AI_PROJECT_ENDPOINT": os.environ["AZURE_AI_PROJECT_ENDPOINT"],
            "MODEL_NAME": os.environ["MODEL_DEPLOYMENT_NAME"]
        }
    )
)

print(f"Created agent: {agent.name} (version: {agent.version})")
```

### 3. List Agent Versions

```python
versions = client.agents.list_versions(agent_name="my-hosted-agent")
for version in versions:
    print(f"Version: {version.version}")  # Inspect supported status fields via get_version
```

Inspect the exact returned model for supported fields; a created version is not proof a running container is healthy. Close synchronous client/credential resources through their supported context managers or `close()` methods.

### 4. Delete Agent Version

```python
client.agents.delete_version(
    agent_name="my-hosted-agent",
    agent_version=agent.version
)
```

## HostedAgentDefinition Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `protocol_versions` | `list[ProtocolVersionRecord]` | Yes | Protocol versions the agent supports |
| `container_configuration` | `ContainerConfiguration` | Yes for an image deployment | Reviewed registry image reference |
| `cpu` | `str` | No | CPU allocation (e.g., "1", "2") |
| `memory` | `str` | No | Memory allocation (e.g., "2Gi", "4Gi") |
| `environment_variables` | `dict[str, str]` | No | Environment variables for the container |

## Protocol Versions

The `protocol_versions` parameter specifies which protocols your agent supports:

```python
from azure.ai.projects.models import ProtocolVersionRecord, AgentEndpointProtocol

# RESPONSES protocol - standard agent responses
protocol_versions=[
    ProtocolVersionRecord(protocol=AgentEndpointProtocol.RESPONSES, version="2.0.0")
]
```

**Available Protocols:**
| Protocol | Description |
|----------|-------------|
| `AgentEndpointProtocol.RESPONSES` | Standard response protocol for agent interactions |

## Resource Allocation

Specify CPU and memory for your container:

```python
definition=HostedAgentDefinition(
    protocol_versions=[...],
    container_configuration=ContainerConfiguration(image=os.environ["REVIEWED_CONTAINER_IMAGE"]),
    cpu="2",      # 2 CPU cores
    memory="4Gi"  # 4 GiB memory
)
```

**Illustrative resource sizes; verify regional/SKU limits before provisioning:**
| Resource | Min | Max | Default |
|----------|-----|-----|---------|
| CPU | 0.5 | 4 | 1 |
| Memory | 1Gi | 8Gi | 2Gi |

## Tools Configuration

Configure tool support inside the selected container runtime/framework. The following tool dictionaries describe application-specific intent; do not assume a `tools` field exists on `HostedAgentDefinition` or that defining it provisions a tool or grants permission:

### Code Interpreter

```python
tools=[{"type": "code_interpreter"}]
```

### MCP Tools

```python
tools=[
    {"type": "code_interpreter"},
    {
        "type": "mcp",
        "server_label": "my-mcp-server",
        "server_url": "https://my-mcp-server.example.com"
    }
]
```

### Multiple Tools

```python
tools=[
    {"type": "code_interpreter"},
    {"type": "file_search"},
    {
        "type": "mcp",
        "server_label": "custom-tool",
        "server_url": "https://custom-tool.example.com"
    }
]
```

### Environment Variables

Pass configuration to your container:

```python
environment_variables={
    "AZURE_AI_PROJECT_ENDPOINT": os.environ["AZURE_AI_PROJECT_ENDPOINT"],
    "MODEL_NAME": os.environ["MODEL_DEPLOYMENT_NAME"],
    "LOG_LEVEL": "INFO",
    "CUSTOM_CONFIG": "value"
}
```

**Best Practice:** Keep non-secret deployment names and a reviewed immutable image reference in configuration; secrets need the platform's actual protected injection mechanism. Arbitrary environment dictionaries do not establish Key Vault integration.

## Complete Example

```python
import os
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import (
    HostedAgentDefinition,
    ContainerConfiguration,
    ProtocolVersionRecord,
    AgentEndpointProtocol,
)

def create_hosted_agent():
    """Create a hosted agent with custom container image."""
    
    client = AIProjectClient(
        endpoint=os.environ["AZURE_AI_PROJECT_ENDPOINT"],
        credential=DefaultAzureCredential()
    )
    
    agent = client.agents.create_version(
        agent_name="data-processor-agent",
        definition=HostedAgentDefinition(
            protocol_versions=[
                ProtocolVersionRecord(
                    protocol=AgentEndpointProtocol.RESPONSES,
                    version="2.0.0"
                )
            ],
            container_configuration=ContainerConfiguration(image=os.environ["REVIEWED_CONTAINER_IMAGE"]),
            cpu="2",
            memory="4Gi",
            environment_variables={
                "AZURE_AI_PROJECT_ENDPOINT": os.environ["AZURE_AI_PROJECT_ENDPOINT"],
                "MODEL_NAME": os.environ["MODEL_DEPLOYMENT_NAME"],
                "MAX_RETRIES": "3"
            }
        )
    )
    
    print(f"Created hosted agent: {agent.name}")
    print(f"Version: {agent.version}")
    # Poll get_version status with a deadline before treating deployment as active.
    
    return agent

if __name__ == "__main__":
    create_hosted_agent()
```

## Async Pattern

```python
import os
from azure.identity.aio import DefaultAzureCredential
from azure.ai.projects.aio import AIProjectClient
from azure.ai.projects.models import (
    HostedAgentDefinition,
    ContainerConfiguration,
    ProtocolVersionRecord,
    AgentEndpointProtocol,
)

async def create_hosted_agent_async():
    """Create a hosted agent asynchronously."""
    
    async with DefaultAzureCredential() as credential:
        async with AIProjectClient(
            endpoint=os.environ["AZURE_AI_PROJECT_ENDPOINT"],
            credential=credential
        ) as client:
            agent = await client.agents.create_version(
                agent_name="async-agent",
                definition=HostedAgentDefinition(
                    protocol_versions=[
                        ProtocolVersionRecord(
                            protocol=AgentEndpointProtocol.RESPONSES,
                            version="2.0.0"
                        )
                    ],
                    container_configuration=ContainerConfiguration(image=os.environ["REVIEWED_CONTAINER_IMAGE"]),
                    cpu="1",
                    memory="2Gi"
                )
            )
            return agent
```

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `ImagePullBackOff` | ACR pull permission denied | Verify registry permission mode and scoped reader role for the project identity |
| `InvalidContainerImage` | Image not found | Verify image path and tag exist in ACR |
| `CapabilityHostNotFound` | No capability host configured | Create account-level capability host |
| `ProtocolVersionNotSupported` | Invalid protocol version | Use `AgentEndpointProtocol.RESPONSES` with version `"2.0.0"` |

## Best Practices

1. **Version Your Images** - Use specific tags, not `latest` in production
2. **Minimal Resources** - Start with minimum CPU/memory, scale up as needed
3. **Environment Variables** - Use for all configuration, never hardcode
4. **Error Handling** - Wrap agent creation in try/except blocks
5. **Cleanup** - Delete unused agent versions to free resources

## Reference Links

- [Azure AI Projects SDK](https://pypi.org/project/azure-ai-projects/)
- [Hosted Agents Documentation](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/deploy-hosted-agent?pivots=python)
- [Azure Container Registry](https://learn.microsoft.com/azure/container-registry/)

## When to Use
Use for reviewing or creating an explicitly requested container-based Foundry hosted
agent. First confirm image digest, subscription/tenant, region, service availability,
permissions and cost scope. Creating agents, granting roles and deleting versions are
cloud writes; do them only within the user's authorization.

## Review example
Given a pinned container image and test project, check SDK model fields and registry
pull access, then prepare the create request. Provision only if authorized and record
the exact returned version and observed health. Do not delete unrelated versions as
routine cleanup. Expected result is a version-specific receipt, not an assumed deploy.

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
