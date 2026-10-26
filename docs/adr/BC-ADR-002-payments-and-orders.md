# BC-ADR-002 Payments and orders

Status: PROPOSED

Date: 2026-10-26

Approval: None recorded. M0a authorizes documentation only.

Historical reference: Review-001/ADR-002. This record does not adopt an earlier Rust/Axum ADR.

## Context

A browser return is untrusted input. The provider may have accepted payment when the engine receives no result. Order fulfillment and financial outcome therefore need separate records and transitions.

## Proposed decision

Persist an attempt with immutable amount, currency, order snapshot, provider, merchant account, operation identity, and external references. Scope reference uniqueness by provider and merchant account. Preserve sanitized provider evidence and every successful receipt.

| Attempt transition | Guard and evidence |
| --- | --- |
| created to starting | Durable start intent and local idempotency record. |
| starting to awaiting_confirmation | Provider-created reference and approved redirect target persisted. |
| starting or awaiting_confirmation to reconciliation_required | Ambiguous response, timeout, crash recovery, or lost callback. |
| awaiting_confirmation or reconciliation_required to confirming | Durable operation intent and exclusive local operation ownership. |
| confirming to verified_paid | Authoritative provider confirmation for stored amount and identity. |
| confirming to reconciliation_required | Unknown result. A timeout cannot close the financial outcome. |
| non-final state to definitively_closed | Documented final provider evidence that the applicable attempt cannot produce an outstanding charge. |

Use the provider's terminology inside the adapter. verified_paid does not claim bank settlement or a universal card-capture operation. Callbacks only schedule reconciliation. Inquiry cannot replace a provider's required confirmation operation.

Persist intent, call the provider outside database transactions, and apply the result conditionally in a new transaction. Retry only under documented provider semantics. An unknown start result cannot justify blind re-creation. Do not run verification and compensation concurrently while either is unresolved.

An order progresses from awaiting_payment to confirmed only with sufficient verified payment and committed inventory allocation. Proposed later states are fulfilling, fulfilled, cancelled, and payment_exception. A late financial result can require an exception even after cancellation. Do not discard it to preserve a terminal order label.

Select one successful attempt for ordinary fulfillment atomically. A second success remains recorded and creates an overpayment obligation. Compensation has separate requested, unknown, confirmed, and manual_action states. Only authoritative recovery evidence closes it.

## Alternatives and consequences

One paid boolean or callback-driven order update loses uncertainty and double-payment evidence. Separate records require reconciliation, auditability, and an operator workflow. Optional inquiry, reversal, and refund capabilities need explicit per-provider contracts rather than mandatory fake methods.

## Unresolved decisions

[OPEN-01](../architecture/open-decisions.md#open-01-gateway-selection-and-semantics) blocks provider implementation. OPEN-03 defines late-payment policy. OPEN-04 governs operator permissions. No universal authority expiry or automatic-refund window is adopted.

## Acceptance criteria

Test forged and reordered returns, absent callbacks, provider success followed by local crash, ambiguous creation, repeated verification, two successful attempts, wrong amount/account/reference, late cancellation, and compensation uncertainty. Assert one fulfillment and retention of all financial obligations.

## Evidence and related records

ZarinPal distinguishes PAID from VERIFIED and prohibits using inquiry as verification. Its verification example uses the stored amount and distinguishes first/already verified results. [Inquiry](https://www.zarinpal.com/docs/paymentGateway/otherMethods/Inquiry), [verification](https://www.zarinpal.com/docs/sdk/nodejs/method/verify)

Related records are [BC-ADR-001](BC-ADR-001-money-and-rounding.md), [BC-ADR-003](BC-ADR-003-inventory-reservations.md), and [BC-ADR-004](BC-ADR-004-transactional-outbox.md).
