# BC-ADR-004 Transactional outbox

Status: PROPOSED

Date: 2026-10-26

Approval: None for these mechanics. LOCK-08 accepts the PostgreSQL outbox direction only.

Historical reference: Review-001/ADR-004. This record does not adopt an earlier Rust/Axum ADR.

## Context

A local commit and an external request cannot share a PostgreSQL transaction. A crash can lose an effect or repeat it after remote success. Locks held during network calls waste database capacity and still do not remove that ambiguity.

## Proposed decision

Insert the business change and a stable outbox effect identity in the same transaction. Start with one worker process from the engine release. Use short claims with FOR UPDATE SKIP LOCKED, a persisted lease token, expiry, attempt count, and next eligible time.

Commit the claim before sending. Complete or reschedule only if the token still matches. Expired claims are recoverable. A stale worker cannot acknowledge a new claim, but its already-sent remote request can still complete.

Use bounded exponential backoff with jitter, error classification, alerts, and an operator replay path. Keep the same effect identity on replay. Record payload versions and retain compatible handlers during the rollback window. Per-order effects that require ordering need an explicit aggregate sequence or predecessor condition. Queue scan order alone does not provide it.

Define an external guarantee for every effect. Financial operations need documented provider idempotency or a reconciliation path. If neither can establish a safe retry, stop automatic retries and escalate while preserving the obligation. Notification duplication may be acceptable under an approved policy. Dead-letter state preserves unresolved work and does not mean the business obligation is complete.

## Alternatives and consequences

In-memory dispatch loses work on crashes. A separate queue adds infrastructure without solving the remote-success/acknowledgement gap. PostgreSQL keeps the business commit atomic but requires leases, retention, monitoring, and provider-specific recovery. No universal exactly-once claim is made.

## Unresolved decisions

Effect-specific retry limits, ordering, retention, and escalation need approval before use. [OPEN-01](../architecture/open-decisions.md#open-01-gateway-selection-and-semantics) blocks financial guarantees. OPEN-05 covers operational commitments.

## Acceptance criteria

Crash before and after claim commit, before send, after remote success, before acknowledgement, during expiry, and during stale completion. Assert no lost durable obligations and only the documented external duplication. Prove old workers understand retained payloads.

## Evidence and related records

PostgreSQL documents SKIP LOCKED for queue-like consumers. ZarinPal reversal has eligibility restrictions, so its existence does not prove repeat-call safety. [Queue locking](https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE), [reversal](https://www.zarinpal.com/docs/sdk/nodejs/method/reverse)

Related records are [BC-ADR-002](BC-ADR-002-payments-and-orders.md), [BC-ADR-007](BC-ADR-007-database-migrations.md), and [BC-ADR-011](BC-ADR-011-operations-and-recovery.md).
