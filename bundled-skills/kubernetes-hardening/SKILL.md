---
name: kubernetes-hardening
description: Implement Kubernetes security contexts, Pod Security Standards, and network
  policies.
category: security
risk: critical
source: https://github.com/BagelHole/DevOps-Security-Agent-Skills
source_repo: BagelHole/DevOps-Security-Agent-Skills
source_type: community
date_added: '2026-09-20'
license: MIT
license_source: https://github.com/BagelHole/DevOps-Security-Agent-Skills/blob/main/LICENSE
compatibility: Requires the relevant security tooling (scanners, vault CLIs) and an
  authorized scope for any active assessment. Docs-only; helper scripts and templates
  not bundled.
metadata:
  author: devops-skills
  version: '1.0'
---

# Kubernetes Hardening

Secure Kubernetes clusters and workloads.

## When to Use This Skill

Use this skill when:
- Hardening Kubernetes clusters
- Implementing Pod Security Standards
- Configuring network policies
- Meeting security compliance

## Scope and validation

Confirm the exact cluster/namespace/version and authorized writes before applying policies. Examples are fragments: validate the reviewed image, namespace, service accounts, labels and required runtime storage. Pin the policy version to the target Kubernetes release where supported. Restricted admission controls new/updated pods; it does not retroactively fix running workloads or establish compliance.

## Pod Security Standards

```yaml
# Namespace with restricted policy
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

## Security Context

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
  labels:
    app: web
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    runAsGroup: 1000
    fsGroup: 1000
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: app
    image: registry.example.invalid/myapp:REVIEWED_IMMUTABLE_TAG
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop: ["ALL"]
```

## Network Policies

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-web
spec:
  podSelector:
    matchLabels:
      app: web
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - port: 8080
```

## RBAC

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: app-reader
rules:
- apiGroups: [""]
  resources: ["pods", "services"]
  verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: app-reader-binding
subjects:
- kind: ServiceAccount
  name: myapp
roleRef:
  kind: Role
  name: app-reader
  apiGroup: rbac.authorization.k8s.io
```

## Best Practices

- Enable Pod Security Standards
- Implement network policies
- Use RBAC with least privilege
- Enable audit logging
- Secure etcd with encryption
- Use service mesh for mTLS
- Regular security scanning

## Related Skills

- kubernetes-ops (`kubernetes-ops`) - K8s operations
- container-hardening (`container-hardening`) - Container security

## Limitations

- Apply guidance only within authorized scope; test destructive steps in non-production first.
- Docs-only import: upstream scripts and templates not bundled.

### Example

```bash
# Read-only first: inventory before any active step.
which <tool> && <tool> --help | head -n 20
```

> Adapted from [BagelHole/DevOps-Security-Agent-Skills](https://github.com/BagelHole/DevOps-Security-Agent-Skills) (MIT); frontmatter, When to Use/Limitations, and safety boundaries added for upstream compliance. Docs-only import: helper scripts and templates not bundled.

NetworkPolicy enforcement requires a supporting CNI. The default-deny example also blocks DNS and dependencies until narrowly scoped rules are added; same-namespace pod selectors do not authorize arbitrary namespaces. Test allowed and denied flows from the real source identities and preserve recovery access. `readOnlyRootFilesystem` may require bounded writable temporary volumes; do not disable it blindly after a startup error. [Kubernetes NetworkPolicy behavior](https://kubernetes.io/docs/concepts/services-networking/network-policies/).
