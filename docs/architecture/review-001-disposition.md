# Disposition of Independent Architecture Review 001

This is the authoritative assessment of the [archived review](reviews/001-claude-architecture-review.md). Accepting a finding means accepting its diagnosis or recommendation for the proposal. It does not promote a PROPOSED ADR to ACCEPTED or authorize implementation.

## Numbered findings

| Finding | Disposition | Reconciliation | Draft ADR |
| --- | --- | --- | --- |
| P0-1 | MODIFY | Persist attempts and operation intents. Call providers outside transactions. Unknown is not unpaid. Inquiry and reversal are capabilities rather than universally required methods. | BC-ADR-002 |
| P0-2 | MODIFY | Guard stock updates and reserve whole carts atomically. Add retry safety, expiry races, and late-payment recovery. | BC-ADR-003 |
| P1-1 | MODIFY | Pin tooling and validate checker parity. Reject automatic Oxlint substitution and the arbitrary three-month rule. | BC-ADR-010 |
| P1-2 | MODIFY | Add Astro-specific checking and formatting. Prove rule coverage. Do not describe formatting/type checks as complete template linting. | BC-ADR-010 |
| P1-3 | ACCEPT | Thin generated client and immutable OpenAPI release artifact. Eden is optional for the dashboard. | BC-ADR-006 |
| P1-4 | MODIFY | Evaluate one versus two auth instances. Enforce staff/customer authorization and guest ownership. Same-origin cookies do not secure custom routes automatically. | BC-ADR-005 |
| P1-5 | MODIFY | Persist limits and budgets. Reject mandatory proof-of-work and discarded SMS promises. Define delivery and recovery. | BC-ADR-012 |
| P1-6 | MODIFY | Exact integer IRR, frozen prices, explicit units. Reject a universal multiple-of-ten constraint. Decimal-string wire amounts remain proposed. | BC-ADR-001 |
| P1-7 | MODIFY | No mandatory Drizzle v1/RQV2. Pin a tested pair and prove rollback with old app on new schema after new writes. | BC-ADR-007 |
| P1-8 | MODIFY | Same-transaction outbox insertion, durable leases, retry recovery, and effect-specific idempotency. No universal idempotent reversal. | BC-ADR-004 |
| P2-1 | MODIFY | Validate Astro on pinned Bun. No automatic Node default. Require demonstrated evidence and approval for an exception. | BC-ADR-010 |
| P2-2 | ACCEPT | Public DTOs stay independent of database tables. | BC-ADR-006 |
| P2-3 | ACCEPT | Folder modules, public entry points, and enforceable import boundaries. Exact modules remain proposed. | BC-ADR-008 |
| P2-4 | MODIFY | Build immutable artifacts outside production and test reachability. Do not select hosting or monitoring services from assumptions. | BC-ADR-011 |
| P2-5 | ACCEPT | Proposed representative pre-production soak, not proof of a current defect. | BC-ADR-010 |

## P3 and other recommendations

| Recommendation | Disposition | Reconciliation |
| --- | --- | --- |
| P3, Eden checking cost | ACCEPT, deferred | Measure when dashboard scale warrants it. |
| P3, publish SDK at fourth client | REJECT automatic threshold | Publish only for demonstrated distribution or maintenance requirements. |
| P3, docs UI staging-only | ACCEPT with restricted-access option | Restrict interactive docs. Release the contract separately. |
| FROM engine image establishes extension architecture | REJECT as sufficient | Require source/build artifacts, composition contract, and compatibility evidence. |
| Late payment becomes voided_late by withholding verify | REJECT | Retain financial evidence and compensation obligation until authoritatively resolved. |
| Universal automatic return of unverified payments | REJECT | Provider and merchant terms require evidence. Expiry is not a refund receipt. |
| Every shipping quote is pure | MODIFY | External quotes may require network access. The engine validates and freezes the accepted quote. |
| Expand-only guarantees rollback | REJECT as a guarantee | Test old readers, writers, and workers against new schema, data, and payloads. |
| App N on schema N-1 proves rollback | REJECT as a guarantee | Rollback requires previous app on new schema after new-app writes, plus permitted partial states. |
| Nightly logical dump plus WAL establishes PITR | MODIFY | PITR requires a physical base backup plus required WAL. |
| Engine patches never require client rebuild | MODIFY | Preserve compatible contracts normally. Compiled adapters and some security repairs require coordinated rebuilds. |
| Four adapters, storage driver, or one owner-admin now | PROPOSED | Create only demonstrated adapters. Staff-role scope needs Product Owner approval. |
| Multiple SDKs and package-per-module infrastructure | DEFER | No present requirement. The accepted monolith and thin-client direction remain. |

## Adversarial scenario mapping

| Review scenario | Required treatment |
| --- | --- |
| Two customers buy last item | BC-ADR-003 atomic reservation and real PostgreSQL concurrency tests. |
| Late success after expiry | BC-ADR-002 and BC-ADR-003 evidence, stock reacquisition, and compensation. |
| Patch across clients | BC-ADR-008 independent rollout and adapter rebuild tracking. |
| Old storefront client | BC-ADR-006 retained consumer contract tests. |
| Partial migration | BC-ADR-007 explicit partial-state recovery and tested rollback. |
| OTP abuse | BC-ADR-012 concurrent budget and verification tests. |
| Worker crash | BC-ADR-004 claim, lease, request, acknowledgement, and replay matrix. |

Claude's M0 readiness section did not authorize project work. Current authority is [M0a only](README.md#current-authorization). The review's release sequence is replaced by the proposed compatibility and release ADRs. Product Owner questions are preserved in [OPEN-01 through OPEN-06](open-decisions.md).
