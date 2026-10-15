---
name: cis-benchmarks
description: Audit and remediate CIS benchmark violations.
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

# CIS Benchmarks

Assess a selected benchmark/version against explicitly authorized systems. Scanner output is partial evidence, not certification; verify applicability, documented exceptions and operational impact before remediation.

## When to Use This Skill

Use this skill when:
- Assessing security compliance
- Implementing security baselines
- Meeting regulatory requirements
- Hardening systems to standards

## Assessment Tools

### OpenSCAP

```bash
# Install
apt install openscap-scanner scap-security-guide

# Confirm installed content matches the actual OS and required benchmark/version.
SCAP_FILE="<approved-installed-datastream.xml>"
oscap info "$SCAP_FILE"
PROFILE_ID="<exact-CIS-profile-listed-by-oscap-info>"
# Run the selected assessment only after scope and report-location approval.
oscap xccdf eval \
  --profile "$PROFILE_ID" \
  --results results.xml \
  --report report.html \
  "$SCAP_FILE"
```

### Lynis

```bash
# Install
apt install lynis

# Run audit
lynis audit system

# Generate report
lynis audit system --report-file "$PRIVATE_AUDIT_DIR/lynis-report.dat"
```

### InSpec

```ruby
# cis-profile/controls/ssh.rb
control 'cis-ssh-1' do
  impact 1.0
  title 'Ensure SSH root login is disabled'
  
  describe sshd_config do
    its('PermitRootLogin') { should eq 'no' }
  end
end

control 'cis-ssh-2' do
  impact 0.7
  title 'Ensure SSH password authentication is disabled'
  
  describe sshd_config do
    its('PasswordAuthentication') { should eq 'no' }
  end
end
```

```bash
# Run InSpec
inspec exec cis-profile -t ssh://user@target
```

### Kubernetes CIS

```bash
# kube-bench
docker run --rm -v /etc:/etc:ro -v /var:/var:ro \
  aquasec/kube-bench@sha256:<reviewed-image-digest> run --targets node

# Check specific sections
kube-bench --help
# Select role/sections supported by the reviewed version and actual cluster; do not assume master is a current target name.
```

## Remediation Workflow

```yaml
workflow:
  1_scan:
    - Run automated assessment
    - Generate baseline report
    
  2_analyze:
    - Review findings
    - Identify false positives
    - Prioritize by risk
    
  3_remediate:
    - Apply fixes
    - Document exceptions
    - Verify changes
    
  4_validate:
    - Re-run assessment
    - Confirm remediation
    - Generate compliance report
```

## Best Practices

- Baseline before hardening
- Document exceptions
- Automate assessments
- Track compliance over time
- Regular re-assessment
- Version control configurations

## Related Skills

- linux-hardening (`linux-hardening`) - Linux security
- vulnerability-scanning (`vulnerability-scanning`) - Security scanning

## Limitations

- An OpenSCAP/Lynis assessment may require privileges and read sensitive host configuration; approve the exact host, profile, privileges, private outputs and limits first. Do not enable auto-remediation or mount all host paths without reviewing necessity. A generic Lynis audit is not a complete CIS benchmark.
- Benchmark/profile identifiers and installed SCAP content vary; use [OpenSCAP’s documented info/eval flow](https://static.open-scap.org/openscap-1.4.1/oscap_user_manual.html). Test changes and preserve rollback/access before hardening production.
- Docs-only import: upstream scripts and templates not bundled.

### Example

```bash
# Read-only first: inventory before any active step.
command -v oscap
oscap --version
```

> Adapted from [BagelHole/DevOps-Security-Agent-Skills](https://github.com/BagelHole/DevOps-Security-Agent-Skills) (MIT); frontmatter, When to Use/Limitations, and safety boundaries added for upstream compliance. Docs-only import: helper scripts and templates not bundled.
