# Billing Automation Implementation Playbook

## Scope and prerequisites

Design a billing lifecycle and verify it in the provider's sandbox. This guide contains pure planning examples, not a payment SDK or runnable BillingEngine. Confirm the actual processor, SDK version, account, currency, collection permission, calendar/time zone, cancellation terms, tax jurisdiction and notification destination. Never upload customer records or make a live charge while testing. Verify current provider documentation before implementing provider calls.

## Subscription lifecycle

Model trial, active, past_due, paused and canceled states plus scheduled cancellation at period end. Keep provider subscription/invoice identifiers, service period boundaries, current event version, attempt status and immutable ledger entries. Use provider billing-cycle anchors; months and years are calendar intervals, not fixed 30/365-day durations. Test February, leap years, month ends, daylight-saving transitions, short trials and cancel/resume changes.

## Invoice and charge reconciliation

1. Lock or transactionally claim the subscription-period obligation using a unique database constraint.
2. Generate or retrieve exactly one invoice for that obligation. Use integer minor units or Decimal with the currency's actual exponent; avoid binary floats and assumed cents for every currency.
3. Persist the provider operation identity and idempotency key before submitting an authorized charge.
4. Retry a transport timeout with the same operation key and reconcile provider status first. A timeout is unknown, not a decline; do not generate a new charge to resolve uncertainty.
5. Verify webhook signatures, event/account binding and deduplicate event IDs. Out-of-order events cannot overwrite newer paid/refunded state.
6. Advance the service period only after the confirmed settlement/state rule. Reconcile the ledger against provider invoices, refunds and disputes.

The following pure helper derives an operation key from trusted identifiers. Database uniqueness and provider idempotency still need integration tests; the helper itself does not process payments.

```python
import hashlib
import json

def billing_operation_key(tenant_id, invoice_id, operation="collect"):
    if not tenant_id or not invoice_id or operation not in {"collect", "refund"}:
        raise ValueError("Require tenant, invoice and supported operation")
    payload = json.dumps([tenant_id, invoice_id, operation], separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()
```

## Dunning

Choose a policy compatible with provider retry rules, customer consent and local obligations. Treat decline categories separately from transport ambiguity. Bound attempts and total duration; suppress duplicate reminders, reconcile recovery, and preserve service-access/cancellation decisions for review. Sending notices and changing access are real side effects requiring authorized targets. Never cancel a subscription simply because a generic retry counter expired.

## Proration

Use provider-calculated proration where available and reconcile it with the contract. For a deliberately agreed linear-time illustration, validate the interval and use Decimal. Taxes, discounts, currency rounding and credits remain separate inputs; this is not a claim that all providers use this policy.

```python
from decimal import Decimal, ROUND_HALF_UP

def linear_proration(old_amount, new_amount, period_start, period_end, change_date,
                     quantum=Decimal("0.01")):
    total = Decimal(str((period_end - period_start).total_seconds()))
    remaining = Decimal(str((period_end - change_date).total_seconds()))
    if total <= 0 or not period_start <= change_date <= period_end or quantum <= 0:
        raise ValueError("Invalid period or rounding quantum")
    old = Decimal(str(old_amount))
    new = Decimal(str(new_amount))
    if not old.is_finite() or not new.is_finite() or old < 0 or new < 0:
        raise ValueError("Require finite nonnegative amounts")
    return ((new - old) * remaining / total).quantize(quantum, rounding=ROUND_HALF_UP)
```

## Tax

Unknown jurisdiction, taxability, registration, exemption or rate means unresolved assessment, not zero tax. Consult an authorized current tax system or qualified adviser for the actual place/date of supply and product. Never derive tax from country alone or use example rates as legal facts.

```python
from decimal import Decimal

def assessed_tax(amount, verified_rate):
    if verified_rate is None:
        raise ValueError("Tax assessment required; unknown is not zero")
    amount, rate = Decimal(str(amount)), Decimal(str(verified_rate))
    if not amount.is_finite() or not rate.is_finite() or amount < 0 or rate < 0:
        raise ValueError("Invalid tax inputs")
    return amount * rate  # Currency-specific rounding is a separate verified policy.
```

## Usage-based billing

Deduplicate usage event IDs per tenant and meter, preserve event-time and ingestion-time, choose a documented late-event policy, and reconcile period boundaries. Distinguish graduated tiers from volume tiers and model the final unlimited tier explicitly. Test zero/negative/out-of-order usage, exact boundaries and corrections. Never mark an invoice paid from a locally calculated amount alone.

## Invoice outputs

Required draft fields: issuer and customer references, unique invoice ID, currency, service period, line quantity/unit amount, subtotal, assessed tax, discounts/credits, total, due date and current status. Applicable invoice requirements need qualified local review. Escape customer-controlled text in HTML and use a real PDF renderer tested against the approved template; no unimplemented renderer is supplied here.

## Acceptance examples

In a sandbox with inert customer data: replay the same event twice; retry after an ambiguous timeout; deliver settlement webhooks out of order; reject an unknown tax rate; test leap/month ends and zero-duration proration; cancel/resume at a boundary; refund using an independent refund operation key. Require one provider obligation and matching ledger entries. Pure arithmetic tests do not establish live billing or tax correctness.

## Limitations

No external billing-cycle, dunning, tax, invoice or state-machine file is promised. The local guide above is complete planning guidance; actual SDK calls, durable storage, credentials, legal policy and communication integrations belong to the target project.
