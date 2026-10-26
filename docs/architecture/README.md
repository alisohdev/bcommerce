# Architecture documentation

This directory and [the ADR directory](../adr/README.md) are the authoritative record for the new Bun/Elysia Better Commerce architecture. Authority means that decision status and provenance are recorded here. It does not make a proposal an approved decision.

## Current authorization

The orchestrator approved M0a documentation at canonical commit fd05aea9c3dd74e44990573074b89808196e0d0e on 2026-10-26 and authorized M0b after three documentation corrections. The [register](decision-register.md#repository-and-authorization-baseline) records the repository, historical alias, and authority. Authorization covers the technical foundation, not every proposed ADR or any commerce implementation gate.

M0b verification results must be recorded separately. The original M0a validation report remains historical documentation evidence. M0c integration and pre-production hardening require separate gates in [implementation gates](implementation-gates.md).

## Read the architecture

| Document | Purpose |
| --- | --- |
| [Decision register](decision-register.md) | Accepted baseline, proposed ADRs, unresolved blockers, and historical aliases. |
| [System architecture](system-architecture.md) | Accepted system shape and proposed request and transaction flows. |
| [Module boundaries](module-boundaries.md) | Proposed ownership and cross-module transaction rules. |
| [Client deployments](client-deployments.md) | Proposed repository, deployment, and release boundaries. |
| [API contracts](api-contracts.md) | Contract ownership and proposed thin-client compatibility policy. |
| [Engineering quality](engineering-quality.md) | Locked tools and proposed validation standards. |
| [Implementation gates](implementation-gates.md) | M0b acceptance criteria and separate commerce gates. |
| [Open decisions](open-decisions.md) | Product Owner decisions and technical evidence still required. |
| [Review disposition](review-001-disposition.md) | Accept, modify, or reject assessment of Claude's findings. |
| [Sources and history](sources-and-history.md) | Authority order, historical evidence, and primary documentation. |
| [Documentation validation](documentation-validation.md) | M0a checks and workspace limitations. |

## Decision status

- `ACCEPTED` means the user explicitly locked the decision or an explicit approval record names it.
- `PROPOSED` means the recommendation is documented for review. Its presence is not implementation authorization.
- `UNRESOLVED` means a missing decision or evidence blocks the named gate. A blocker for payments need not block M0b.

Each ADR has a status, approval record, alternatives, consequences, open decisions, and acceptance criteria. All 12 initial ADRs are PROPOSED. Accepted constraints inside them derive from the register and do not promote the whole ADR.

Record future status changes in the register and the affected ADR together. Include the approval source and date. Keep historical aliases stable. Superseded decisions retain their records and point to a replacement rather than reusing an identifier.
