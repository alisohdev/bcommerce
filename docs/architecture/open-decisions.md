# Open decisions and blockers

All identifiers here have status UNRESOLVED. Each blocks only the stated gate. Product decisions have no silently approved defaults. Technical experiments can resolve evidence questions after the relevant work is authorized.

## OPEN-01 Gateway selection and semantics

Owners are the Product Owner for commercial selection and the Technical Lead for evidence. Blocks payment implementation and production activation for each gateway.

Select initial gateways and merchant accounts. Record versioned official documentation, credentials and eligibility requirements, units and limits, callback forms, verification outcomes, creation retry behavior, inquiry availability, deadlines, reversal/refund conditions, and recovery procedures. Obtain sandbox evidence and a controlled live validation plan where sandbox behavior is insufficient. Do not generalize one provider's behavior to another.

## OPEN-02 Pricing and refund policies

Owner is the Product Owner with appropriate tax/accounting input. Blocks pricing and checkout implementation.

Approve discount rounding scope and tie behavior, coupon stacking and application order, tax basis and rounding, shipping discounts, amount limits, fractional-toman display, and partial-refund allocation. BC-ADR-001 proposes half-up line discounts and largest-remainder allocation but does not approve them.

## OPEN-03 Reservations and late payments

Owner is the Product Owner, with feasibility evidence from the Technical Lead. Blocks reservation and checkout implementation.

Approve hold duration, extension eligibility and limits, stock adjustment rules, overselling/backorder policy, late-payment stock reacquisition, customer communication, and the owner and escalation deadline for compensation. Reversal availability cannot determine a universal policy.

## OPEN-04 Identity and administration

Owner is the Product Owner for roles, methods, and recovery. The orchestrator approves the technical isolation design. Blocks production identity implementation and the ownership-dependent checkout flow.

Choose required staff permissions, staff MFA and provisioning, enabled customer methods, supported phone regions, guest recovery/claim behavior, phone-change recovery, and staff/customer account linking rules. Decide the admin origin and one versus two Better Auth instances after the trade-off and experiment. SMS remains optional.

## OPEN-05 Hosting and operating commitments

Owner is the Product Owner for service commitments and the Technical Lead for delivery evidence. Blocks production deployment commitments.

Choose hosting location, provider reachability, image delivery, acceptable downtime, supported release duration, contract deprecation windows, backup/media retention, recovery-point objective, recovery-time objective, monitoring reachability, and alert ownership. Do not promise zero data loss or safe restore without external financial reconciliation.

## OPEN-06 Client backend customization

Owner is the Product Owner for ownership and initial requirements. Blocks custom adapter implementation, not a configuration-only M0b.

Confirm whether all backend customization is trusted first-party code and whether a first client needs it. An in-process adapter is privileged application code. Untrusted third-party execution requires a different isolation assessment and does not fit a safe extension contract merely because an image is derived from another image.

## Technical and environment blockers

| Identifier | Owner | Evidence required | Blocked gate |
| --- | --- | --- | --- |
| TECH-01 | Technical Lead | Exact Bun runtime/build versions, immutable lint revision/checksum, selected checker, rule fixtures, and Astro tool pins. | M0b toolchain acceptance. |
| TECH-02 | Technical Lead | Exact ORM/Kit/driver pair, journal semantics, lock behavior, failure recovery, and tested rollback combination. | M0b persistence acceptance. |
| TECH-03 | Technical Lead | Complete emitted contract and generated client fixture results under pinned tooling. | M0b contract acceptance. |
| TECH-04 | Technical Lead | Astro rendering mode and adapter behavior under pinned Bun. Explicit evidence before any runtime exception. | M0b storefront acceptance. |
| ENV-01 | Orchestrator | Select or initialize the intended Git repository and preserve the M0a files. Current workspace has no .git. | Git history, commit, and diff review evidence. |
| GATE-M0B | Orchestrator | Explicit authorization after M0a review, identifying the permitted work and accepted technical proposals. | Starting M0b. |

The 12 ADRs remain PROPOSED while the register's unresolved entries describe their concrete blockers. Resolving one entry does not approve an entire ADR automatically.
