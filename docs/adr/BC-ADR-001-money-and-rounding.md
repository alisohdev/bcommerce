# BC-ADR-001 Money and rounding

Status: PROPOSED

Date: 2026-10-26

Approval: None recorded. M0a authorizes documentation only.

Historical reference: Review-001/ADR-001. This record does not adopt an earlier Rust/Axum ADR.

## Context

Discounts, refunds, display units, and gateways need exact amounts. Floating-point arithmetic and implicit rial/toman conversion can change the amount charged. Integer IRR does not require divisibility by ten.

## Proposed decision

Store canonical integer IRR in PostgreSQL bigint. Use exact application bigint arithmetic, branded domain values, and explicit storage bounds. Separate signed adjustments from nonnegative charges. Propose decimal-string API amounts with explicit IRR currency. Validate syntax, range, and currency at boundaries.

Propose half-up rounding to one rial for percentage discounts on an extended line. Allocate order-level discounts by largest remainders with a stable line-ID tie-breaker. Never allocate beyond an eligible line's amount. Preserve allocations and policy versions for partial refunds rather than recalculating old prices.

Freeze unit prices, quantities, discounts, taxes, shipping, payable total, and pricing-policy version in the accepted order snapshot. Attempts refer to its immutable payable amount. An accepted unexpired snapshot is not silently repriced because catalog prices change. Quote invalidation and expiry rules need approval.

Gateway adapters use explicit documented units and checked numeric serialization. Send IRR directly where supported. If a gateway requires whole toman and a total cannot be represented, reject that method or show an approved adjustment before confirmation. Never silently truncate.

## Alternatives and consequences

Exact decimal arithmetic is viable but adds representation and scale rules. Safe-integer numeric API amounts are smaller but impose a permanent upper bound. Decimal strings need deliberate client parsing and OpenAPI fixtures. Toman display may require a fractional display or a rial fallback.

## Unresolved decisions

[OPEN-02](../architecture/open-decisions.md#open-02-pricing-and-refund-policies) covers rounding approval, stacking order, tax basis, display, and refund allocation. Gateway bounds require OPEN-01. These policies have no approved default.

## Acceptance criteria

Test non-multiples of ten, rounding ties, zero and maximum values, intermediate overflow bounds, capped discounts, deterministic residues, partial refunds summing to the original allocation, and factor-of-ten conversion errors. Prove API serialization through the generated client.

## Evidence and related records

ZarinPal documents explicit IRR and IRT request units. This does not establish another provider's units. [Request documentation](https://www.zarinpal.com/docs/sdk/nodejs/method/request)

Related records are [BC-ADR-002](BC-ADR-002-payments-and-orders.md) and [BC-ADR-006](BC-ADR-006-api-contracts-and-client.md). Status is indexed in the [register](../architecture/decision-register.md).
