# Architecture decision records

All 12 initial commerce ADRs have status PROPOSED. The [decision register](../architecture/decision-register.md) is the status index and records accepted constraints separately.

| Identifier | Status | Record |
| --- | --- | --- |
| BC-ADR-001 | PROPOSED | [Money and rounding](BC-ADR-001-money-and-rounding.md) |
| BC-ADR-002 | PROPOSED | [Payments and orders](BC-ADR-002-payments-and-orders.md) |
| BC-ADR-003 | PROPOSED | [Inventory reservations](BC-ADR-003-inventory-reservations.md) |
| BC-ADR-004 | PROPOSED | [Transactional outbox](BC-ADR-004-transactional-outbox.md) |
| BC-ADR-005 | PROPOSED | [Identity and ownership](BC-ADR-005-identity-and-ownership.md) |
| BC-ADR-006 | PROPOSED | [API contracts and client](BC-ADR-006-api-contracts-and-client.md) |
| BC-ADR-007 | PROPOSED | [Database migrations](BC-ADR-007-database-migrations.md) |
| BC-ADR-008 | PROPOSED | [Repositories and releases](BC-ADR-008-repositories-and-releases.md) |
| BC-ADR-009 | PROPOSED | [Client customization](BC-ADR-009-client-customization.md) |
| BC-ADR-010 | PROPOSED | [Engineering toolchain](BC-ADR-010-engineering-toolchain.md) |
| BC-ADR-011 | PROPOSED | [Operations and recovery](BC-ADR-011-operations-and-recovery.md) |
| BC-ADR-012 | PROPOSED | [SMS abuse and recovery](BC-ADR-012-sms-abuse-and-recovery.md) |

Each source alias retains Claude's suggested number under the Review-001 namespace. These records allocate BC-ADR identifiers for the new Bun/Elysia architecture. Earlier Rust/Axum records are not adopted. See the [identifier policy](../architecture/decision-register.md#identifier-policy).

An acceptance requires an explicit approval record with date and scope. If only part of a draft is accepted, record that scope precisely and leave unresolved business policy visible. Documentation creation and successful documentation checks do not accept a technical proposal.
