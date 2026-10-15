---
name: audit-logging
description: Implement centralized audit logging and SIEM integration. Configure log
  retention and security monitoring. Use when implementing audit trail requirements.
category: security
risk: safe
source: https://github.com/BagelHole/DevOps-Security-Agent-Skills
source_repo: BagelHole/DevOps-Security-Agent-Skills
source_type: community
date_added: '2026-09-20'
license: MIT
license_source: https://github.com/BagelHole/DevOps-Security-Agent-Skills/blob/main/LICENSE
compatibility: Linux infrastructure examples require the matching logging services and
  authorized administrator access. Application examples require a writable approved log destination.
metadata:
  author: devops-skills
  version: '1.0'
---

# Audit Logging

Implement comprehensive audit logging for compliance, security monitoring, and forensic analysis across infrastructure and applications.

## When to Use

- Setting up centralized logging for compliance frameworks (SOC 2, HIPAA, PCI DSS)
- Implementing security event monitoring and alerting
- Building audit trails for regulatory requirements
- Configuring log retention and integrity-protected storage
- Integrating application logs with SIEM platforms

## Log Categories

```yaml
audit_events:
  authentication:
    - Login attempts (success and failure)
    - MFA enrollment and verification events
    - Session creation, renewal, and termination
    - Password changes and resets
    - API key and token generation

  authorization:
    - Access grants and denials
    - Permission changes and role assignments
    - Privilege escalation events
    - Resource sharing modifications
    - Policy evaluation results

  data_access:
    - Read operations on sensitive data
    - Write and update operations
    - Delete and purge operations
    - Bulk export and download events
    - Data classification changes

  administrative:
    - Configuration changes
    - User and group management
    - System startup and shutdown
    - Backup and restore operations
    - Network and firewall rule changes

  system:
    - Service health state changes
    - Resource provisioning and deprovisioning
    - Certificate and key rotation events
    - Scheduled job execution results
    - Integration and webhook events
```

## Rsyslog Configuration for Centralized Logging

```bash
# /etc/rsyslog.d/50-audit.conf

# Load imfile module to read application logs
module(load="imfile")

# Forward auth logs
input(type="imfile"
  File="/var/log/auth.log"
  Tag="auth"
  Severity="info"
  Facility="auth"
)

# Forward application audit logs
input(type="imfile"
  File="/var/log/app/audit.log"
  Tag="app-audit"
  Severity="info"
  Facility="local0"
)

# Structured JSON template
template(name="json-audit" type="list") {
  constant(value="{")
  constant(value="\"@timestamp\":\"")    property(name="timereported" dateFormat="rfc3339")
  constant(value="\",\"host\":\"")       property(name="hostname")
  constant(value="\",\"severity\":\"")   property(name="syslogseverity-text")
  constant(value="\",\"facility\":\"")   property(name="syslogfacility-text")
  constant(value="\",\"tag\":\"")        property(name="syslogtag" format="json")
  constant(value="\",\"message\":\"")    property(name="msg" format="json")
  constant(value="\"}\n")
}

# Forward to central syslog server over TLS
action(
  type="omfwd"
  target="syslog.internal.example.com"
  port="6514"
  protocol="tcp"
  StreamDriver="gtls"
  StreamDriverMode="1"
  StreamDriverAuthMode="x509/name"
  template="json-audit"
  queue.type="LinkedList"
  queue.size="50000"
  queue.filename="fwd_audit"
  queue.saveonshutdown="on"
  action.resumeRetryCount="-1"
)
```

## Journald Configuration for Persistent Logging

```ini
# /etc/systemd/journald.conf
[Journal]
Storage=persistent
Compress=yes
Seal=yes
SplitMode=uid
MaxRetentionSec=365d
MaxFileSec=30d
SystemMaxUse=10G
SystemKeepFree=2G
ForwardToSyslog=yes
```

```bash
# Query journald for audit events
journalctl _TRANSPORT=audit --since "24 hours ago" --output json-pretty

# Filter by specific audit types
journalctl _AUDIT_TYPE=1112 --since today  # user login events
journalctl _AUDIT_TYPE=1100 --since today  # user auth events

# Export for offline analysis
journalctl --since "7 days ago" --output export > /backup/journal-export.bin
```

## Application Logging with Structured JSON

```python
import logging
import json
import hashlib
from datetime import datetime, timezone
from functools import wraps

class AuditLogger:
    def __init__(self, service_name, log_path, logger_name="audit"):
        self.service = service_name
        self.logger = logging.getLogger(logger_name)
        handler = logging.FileHandler(log_path)
        handler.setFormatter(logging.Formatter("%(message)s"))
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)
        self._prev_hash = None

    def log_event(self, event_type, user, resource, action, result,
                  metadata=None, source_ip=None):
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "service": self.service,
            "event_type": event_type,
            "user": user,
            "resource": resource,
            "action": action,
            "result": result,
            "source_ip": source_ip,
            "metadata": metadata or {},
        }
        # Chain hash for tamper detection
        raw = json.dumps(log_entry, sort_keys=True)
        log_entry["prev_hash"] = self._prev_hash
        log_entry["hash"] = hashlib.sha256(
            f"{self._prev_hash}:{raw}".encode()
        ).hexdigest()
        self._prev_hash = log_entry["hash"]
        self.logger.info(json.dumps(log_entry))

    def log_auth(self, user, action, success, source_ip=None, mfa=False):
        self.log_event(
            event_type="authentication",
            user=user,
            resource="auth-service",
            action=action,
            result="success" if success else "failure",
            metadata={"mfa_used": mfa},
            source_ip=source_ip,
        )

    def log_data_access(self, user, resource, operation, record_count=0,
                        source_ip=None):
        self.log_event(
            event_type="data_access",
            user=user,
            resource=resource,
            action=operation,
            result="success",
            metadata={"record_count": record_count},
            source_ip=source_ip,
        )


def audit_trail(audit_logger, resource_name):
    """Decorator to automatically audit function calls."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            user = kwargs.get("current_user", "system")
            try:
                result = func(*args, **kwargs)
                audit_logger.log_event(
                    event_type="operation",
                    user=user,
                    resource=resource_name,
                    action=func.__name__,
                    result="success",
                )
                return result
            except Exception as e:
                audit_logger.log_event(
                    event_type="operation",
                    user=user,
                    resource=resource_name,
                    action=func.__name__,
                    result="failure",
                    metadata={"error_code": "operation_failed"},
                )
                raise
        return wrapper
    return decorator
```

## Fluentd / Fluent Bit Log Aggregation

```yaml
# fluent-bit.conf - lightweight agent on each node
[SERVICE]
    Flush         5
    Daemon        Off
    Log_Level     info
    Parsers_File  parsers.conf

[INPUT]
    Name          tail
    Path          /var/log/app/audit.log
    Parser        json
    Tag           audit.app
    Refresh_Interval 5
    Rotate_Wait   30

[INPUT]
    Name          systemd
    Tag           audit.system
    Systemd_Filter _TRANSPORT=audit

[FILTER]
    Name          modify
    Match         audit.*
    Add           cluster ${CLUSTER_NAME}
    Add           node ${NODE_NAME}

[OUTPUT]
    Name          es
    Match         audit.*
    Host          elasticsearch.internal.example.com
    Port          9200
    Index         audit-logs
    Type          _doc
    tls           On
    tls.verify    On
    Retry_Limit   5

[OUTPUT]
    Name          s3
    Match         audit.*
    region        us-east-1
    bucket        audit-logs-archive
    total_file_size 50M
    upload_timeout  10m
    s3_key_format  /logs/%Y/%m/%d/$TAG/%H_%M_%S.gz
    compression    gzip
```

## Elasticsearch Index Lifecycle for Retention

```json
{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_size": "50gb",
            "max_age": "1d"
          },
          "set_priority": { "priority": 100 }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "shrink": { "number_of_shards": 1 },
          "forcemerge": { "max_num_segments": 1 },
          "set_priority": { "priority": 50 }
        }
      },
      "cold": {
        "min_age": "30d",
        "actions": {
          "freeze": {},
          "set_priority": { "priority": 0 }
        }
      },
      "delete": {
        "min_age": "365d",
        "actions": { "delete": {} }
      }
    }
  }
}
```

## Retention and integrity requirements

Define a retention register with framework/version, applicable control, data type, purpose, jurisdiction, legal hold, owner, approved period and authoritative evidence. Do not apply a single framework duration to every log type; documentation-retention obligations and operational-log retention differ. Obtain qualified review of legal and contractual requirements before applying deletion or export policies. The 365-day infrastructure examples are capacity-policy illustrations, not minimum compliance requirements.

Checksums and the illustrative in-process hash chain detect some changes only when compared with a separately protected trusted checkpoint. They do not make storage immutable, survive restart without persistence, prevent a privileged actor rewriting both log and hashes, or establish regulatory compliance. Use independently protected append-only storage, authenticated checkpoints and restoration tests appropriate to the threat model.

For local verification, use a project-reviewed manifest with a fixed approved directory, reject traversal/symlinks and missing files, and report failures locally. Do not automatically regenerate the trusted baseline after failure. Uploading audit logs, enabling forwarding and sending webhook alerts require explicit destination/data authorization; no notification is sent by this guide itself.

## SIEM Integration Checklist

```yaml
siem_integration:
  log_sources:
    - [ ] Operating system auth logs (syslog, journald)
    - [ ] Application audit logs (structured JSON)
    - [ ] Cloud provider audit trails (CloudTrail, Activity Log, Audit Logs)
    - [ ] Database query and access logs
    - [ ] Network flow logs and firewall logs
    - [ ] Container and orchestrator logs (Kubernetes audit)
    - [ ] WAF and CDN access logs
    - [ ] VPN and remote access logs

  normalization:
    - [ ] Common event format (CEF) or OCSF schema
    - [ ] Consistent timestamp format (ISO 8601 / UTC)
    - [ ] Unified user identity fields
    - [ ] Standardized severity levels

  alerting_rules:
    - [ ] Multiple failed login attempts (brute force)
    - [ ] Login from unusual location or device
    - [ ] Privilege escalation events
    - [ ] Sensitive data bulk export
    - [ ] Administrative action outside change window
    - [ ] Service account anomalous activity
    - [ ] Log forwarding gap or interruption

  operational:
    - [ ] Log pipeline health monitoring
    - [ ] Storage capacity alerting
    - [ ] Retention policy enforcement verified
    - [ ] Backup of log archives confirmed
    - [ ] Access to log systems restricted and audited
```

## Best Practices

- Use structured logging (JSON) with consistent field names across all services
- Ship logs to a centralized platform with write-once storage for tamper protection
- Implement hash chaining or digital signatures for log integrity verification
- Define and enforce retention policies per compliance framework requirements
- Set up real-time alerting for high-severity security events
- Separate audit logs from application debug logs to reduce noise
- Never log sensitive data (passwords, tokens, PII) in audit entries
- Monitor the logging pipeline itself to detect gaps in coverage
- Regularly test log restoration from archives to verify recoverability
- Rotate and compress logs to manage storage while meeting retention windows

## Limitations

- Guidance and checklists only; not legal advice and not a substitute for a qualified auditor.
- Docs-only import: upstream templates and scripts not bundled.

### Example

```markdown
Map this skill's control checklist to our current evidence and list gaps.
```

> Adapted from [BagelHole/DevOps-Security-Agent-Skills](https://github.com/BagelHole/DevOps-Security-Agent-Skills) (MIT); frontmatter, When to Use/Limitations, and safety boundaries added for upstream compliance. Docs-only import: helper scripts and templates not bundled.
