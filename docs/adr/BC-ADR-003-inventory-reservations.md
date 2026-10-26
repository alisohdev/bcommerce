# BC-ADR-003 Inventory reservations

Status: PROPOSED

Date: 2026-10-26

Approval: None recorded. M0a authorizes documentation only.

Historical reference: Review-001/ADR-003. This record does not adopt an earlier Rust/Axum ADR.

## Context

Read-then-decrement can oversell. Reservation expiry can race with payment confirmation. A released hold does not establish that the buyer was not charged.

## Proposed decision

Reserve when checkout accepts a quote. In one PostgreSQL transaction, validate positive quantities, acquire stock rows in a deterministic order, conditionally increase reserved only when on_hand minus reserved is sufficient, create reservation records, and preserve the accepted snapshot. Any failed line rolls back the whole operation.

Use non-null counters and constraints for nonnegative on_hand and reserved, with reserved no greater than on_hand. Reservations have stable identities, quantities, expiry, and a unique checkout/stock-line identity. Checkout and retry identity prevent a repeated request from reserving twice.

| Transition | Atomic effect |
| --- | --- |
| active to consumed | Decrement reserved and on_hand by the quantity once. |
| active to released | Decrement reserved once. |
| active to expired | Check database time and decrement reserved once. |
| expired or released to a new allocation | Make a new guarded reservation under the approved late-payment policy. Never silently reactivate consumed stock. |

Consumption, expiry, release, and stock adjustment share documented lock ordering and conditional transitions. Purchase decisions read PostgreSQL rather than a cache. READ COMMITTED is a candidate for this guarded-update design, not a guarantee for every future cross-row rule.

On confirmed late payment, consume a valid hold or atomically reacquire available stock if policy permits. If unavailable, retain the payment evidence and enter payment_exception with recovery owed. Gateway eligibility determines whether reversal, refund, or manual recovery can resolve it. Never mark a payment voided because its hold expired.

## Alternatives and consequences

Reserve-on-payment avoids abandoned holds but increases paid-without-stock cases. Reserving in the cart invites stock hoarding. Checkout holds require an expiry worker, bounded extensions, and reconciliation of counters against reservation records.

## Unresolved decisions

[OPEN-03](../architecture/open-decisions.md#open-03-reservations-and-late-payments) blocks duration, extension, backorder, adjustment, and late-payment policy. No timeout value is approved.

## Acceptance criteria

Run real PostgreSQL concurrency and multi-line rollback tests. Exercise expiry versus consumption and duplicate release. Stock of one must yield one winner under the [gate workload](../architecture/implementation-gates.md#separate-commerce-implementation-gates). Confirm that late payment with no stock produces a visible unresolved recovery obligation.

## Evidence and related records

PostgreSQL describes how updates reevaluate a condition after a competing update and how row locks coordinate writes. [Isolation](https://www.postgresql.org/docs/current/transaction-iso.html), [locking](https://www.postgresql.org/docs/current/explicit-locking.html)

Related records are [BC-ADR-002](BC-ADR-002-payments-and-orders.md) and [BC-ADR-004](BC-ADR-004-transactional-outbox.md).
