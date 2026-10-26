# Architecture decision register

Recorded on 2026-10-26 during M0a. The [authority and history record](sources-and-history.md) defines the inputs. The [status definitions](README.md#decision-status) apply throughout this documentation.

## Repository and authorization baseline

Canonical repository: [alisohdev/bcommerce](https://github.com/alisohdev/bcommerce).

The orchestrator reviewed and approved M0a at commit [fd05aea9c3dd74e44990573074b89808196e0d0e](https://github.com/alisohdev/bcommerce/commit/fd05aea9c3dd74e44990573074b89808196e0d0e). Local HEAD matched that commit before M0b changes. The original M0a workspace lacked Git metadata; that historical observation remains valid for the earlier stage.

| Identifier | Status | Record | Authority |
| --- | --- | --- | --- |
| ENV-01 | ACCEPTED | Resolved by the canonical GitHub repository and reviewed commit above. Git status and history are now available. | Orchestrator M0a sign-off. |
| GATE-M0B | ACCEPTED | M0b technical foundation is authorized after the documentation corrections. M0c and commerce implementation remain closed. | User's M0a sign-off and M0b authorization on 2026-10-26. |

## Accepted baseline

The previous reconciliation called these choices LOCKED. Their status here is ACCEPTED, preserving that authority without treating any draft ADR as approved.

| Identifier | Status | Decision | Approval source |
| --- | --- | --- | --- |
| LOCK-01 | ACCEPTED | Bun runtime, Elysia backend, TypeBox validation, Better Auth authentication, Drizzle ORM, and PostgreSQL database. | User's locked technology brief and clarification. |
| LOCK-02 | ACCEPTED | Fully custom Astro storefronts with optional React islands. Shared dashboard uses React + Vite. | User's locked technology brief and clarification. |
| LOCK-03 | ACCEPTED | One reusable commerce engine in a shared modular monolith. Each client has a separate deployment and database. | User's architecture direction and clarification. |
| LOCK-04 | ACCEPTED | Customer authentication is optional. SMS OTP is an available optional method, not a universal checkout prerequisite. | User's architecture direction and clarification. |
| LOCK-05 | ACCEPTED | OpenAPI contracts and independent storefronts consuming a thin generated API client. | User's architecture direction and clarification. |
| LOCK-06 | ACCEPTED | `bun lint`, `bun fmt`, `bun check`, and strict TypeScript. | User's locked tooling instructions. |
| LOCK-07 | ACCEPTED | No theme engine, microservices, runtime plugin loader, or general-purpose plugin framework. | User's architecture direction and clarification. |
| LOCK-08 | ACCEPTED | PostgreSQL-backed outbox direction and explicit release and migration compatibility policies. Implementation details remain proposed. | Initial accepted direction, read together with the later clarification. |

## Proposed ADRs and historical aliases

No approval has been recorded for the full decisions below. M0a authorization permits documenting them.

| Identifier | Status | Decision | Historical source alias |
| --- | --- | --- | --- |
| [BC-ADR-001](../adr/BC-ADR-001-money-and-rounding.md) | PROPOSED | Money, rounding, discounts, and gateway units. | Review-001/ADR-001 |
| [BC-ADR-002](../adr/BC-ADR-002-payments-and-orders.md) | PROPOSED | Payment attempts, order progression, and financial recovery. | Review-001/ADR-002 |
| [BC-ADR-003](../adr/BC-ADR-003-inventory-reservations.md) | PROPOSED | Atomic reservations, expiry, and late payments. | Review-001/ADR-003 |
| [BC-ADR-004](../adr/BC-ADR-004-transactional-outbox.md) | PROPOSED | Outbox processing and external side effects. | Review-001/ADR-004 |
| [BC-ADR-005](../adr/BC-ADR-005-identity-and-ownership.md) | PROPOSED | Authentication isolation, guests, and browser topology. | Review-001/ADR-005 |
| [BC-ADR-006](../adr/BC-ADR-006-api-contracts-and-client.md) | PROPOSED | API versioning and thin client. | Review-001/ADR-006 |
| [BC-ADR-007](../adr/BC-ADR-007-database-migrations.md) | PROPOSED | Database ownership and migration compatibility. | Review-001/ADR-007 |
| [BC-ADR-008](../adr/BC-ADR-008-repositories-and-releases.md) | PROPOSED | Repositories and independent client releases. | Review-001/ADR-008 |
| [BC-ADR-009](../adr/BC-ADR-009-client-customization.md) | PROPOSED | Configuration and build-time adapters. | Review-001/ADR-009 |
| [BC-ADR-010](../adr/BC-ADR-010-engineering-toolchain.md) | PROPOSED | Toolchain pins, strict checking, and Astro gaps. | Review-001/ADR-010 |
| [BC-ADR-011](../adr/BC-ADR-011-operations-and-recovery.md) | PROPOSED | Operations, monitoring, and restore. | Review-001/ADR-011 |
| [BC-ADR-012](../adr/BC-ADR-012-sms-abuse-and-recovery.md) | PROPOSED | SMS budgets and identity recovery. | Review-001/ADR-012 |

## Unresolved blockers

Each row identifies a blocked gate. Details and decision owners live in [open decisions](open-decisions.md).

| Identifier | Status | Missing decision or evidence | Blocks |
| --- | --- | --- | --- |
| OPEN-01 | UNRESOLVED | Initial gateways and merchant-specific capability evidence. | Payment implementation and activation for each gateway. |
| OPEN-02 | UNRESOLVED | Rounding, coupon ordering, tax policy, and refund allocation. | Pricing and checkout implementation. |
| OPEN-03 | UNRESOLVED | Reservation duration, extensions, and late-payment business response. | Inventory reservation and checkout implementation. |
| OPEN-04 | UNRESOLVED | Staff roles, auth methods, recovery policy, and admin topology. | Production identity implementation and activation. |
| OPEN-05 | UNRESOLVED | Hosting connectivity, support window, downtime, retention, RPO, and RTO. | Production deployment and operating commitments. |
| OPEN-06 | UNRESOLVED | Backend customization ownership and first-client requirements. | Client adapter implementation, not a config-only M0b. |
| TECH-04 | UNRESOLVED | Pinned Bun compatibility with the chosen Astro rendering mode. | M0c independent storefront integration acceptance. |

## Verified foundation evidence

These technical proof records satisfy local M0b checks and remain PROPOSED for orchestrator review. They do not accept an entire commerce ADR or close M0c and pre-production gates. The [verification report](../implementation/m0b-verification.md) records executed commands and limitations.

| Identifier | Status | Verified scope | Remaining later work |
| --- | --- | --- | --- |
| TECH-01 | PROPOSED | Integrity-pinned stable Bun 1.4.4 and separate native lint canary, strict source checking, browser-only client checking, meaningful negative fixtures, and formatting proof on Windows and Linux. | Orchestrator M0b review, then Astro-specific tooling and complete integration source coverage in M0c. |
| TECH-02 | PROPOSED | Drizzle ORM 0.45.4, Kit 0.31.11, pg 8.23.1, real PostgreSQL 17.7 migration/session/history/failure proofs, and explicit CLI migration. | Orchestrator M0b review, then old-image rollback, extended compatibility, exceptional DDL, and recovery drills. |
| TECH-03 | PROPOSED | Deterministic fixture OpenAPI and generated client artifacts with real HTTP validation and cookie/error/union proofs. | Orchestrator M0b review, then independent Astro consumer and extended retained-consumer compatibility. |

## Identifier policy

BC-ADR-001 through BC-ADR-012 are allocated by this register for the new architecture. Future ADRs take the next unused BC-ADR number after checking the register and directory. Never recycle an allocated identifier.

Claude's Review 001 proposed generic ADR-001 through ADR-012. Those names are namespaced above as source aliases. They were never approved project ADR identifiers.

The original conversational ADR-003, optional customer authentication, is preserved as historical alias Conversation/ADR-003 of ACCEPTED LOCK-04. It is not Review-001/ADR-003 and does not change BC-ADR-003, which remains the proposed inventory reservation record. The orchestrator explicitly supplied this historical mapping at M0a sign-off.

Earlier Rust/Axum Better Commerce ADRs are historical work outside this architecture. Their contents and identifiers are not imported, renumbered, or represented as accepted here. Any future imported historical document must retain its original namespace and provenance.
