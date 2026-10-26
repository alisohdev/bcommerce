# BC-ADR-007 Database migrations

Status: PROPOSED

Date: 2026-10-26

Approval: PostgreSQL, Drizzle, independent databases, and explicit compatibility policies are accepted. These mechanics are not approved.

Historical reference: Review-001/ADR-007. This record does not adopt an earlier Rust/Axum ADR.

## Context

Clients upgrade independently. A safe application rollback requires compatibility with schema and data written by the new application. Expand-only changes can still break older constraints, writers, readers, or workers.

## Proposed decision

Evaluate the historically observed stable candidate pair, drizzle-orm 0.45.4 and drizzle-kit 0.31.11, with a selected PostgreSQL driver. Pin a tested pair rather than requiring v1 or relational queries v2. The [source record](../architecture/sources-and-history.md#version-observations) preserves registry observations without treating them as installed versions.

The engine owns commerce and identity tables. Client extensions use client_ext with a separate journal. Separate migration privileges enforce ownership. Application roles do not own schema objects or run startup DDL. Better Auth schema changes flow through the reviewed engine migration process.

Run reviewed, immutable migrations as a separate job. Hold a session advisory lock on a dedicated physical connection for the whole job. Prevent parallel work if that session is lost. Do not acquire a lock on one pooled connection and migrate through unrelated sessions.

Record ordered migrations, checksums, completed prerequisites, and schema compatibility. Validate actual journal behavior in the selected release. The inspected ORM 0.45.4 migrator uses a highest-timestamp comparison and a transaction; it is not an arbitrary missing-gap repair mechanism.

| Compatibility combination | Required purpose |
| --- | --- |
| New app and completed new schema | Normal upgrade. |
| Old app and new schema after new-app writes | Application rollback. |
| Old app and permitted partial expansion | Migration failure recovery. |

New app on old schema is optional if migrations precede activation. Readiness checks require prerequisites and supported schema compatibility. An old app's guard must permit its tested rollback state.

Delay contraction until backfills complete and the rollback floor, old workers, retained payloads, and client adapters no longer require the removed representation. Put concurrent indexes and exceptional nontransactional work in explicit resumable phases when first needed. Detect and repair invalid objects rather than assuming IF NOT EXISTS is sufficient.

## Alternatives and consequences

Boot-time migration by every process risks competing writers. Automatic down migrations and snapshot restore can destroy later writes. Explicit phases add release work but make failure states reviewable. Session locks do not enforce themselves against tools that bypass the migration process.

## Unresolved decisions

[TECH-02](../architecture/open-decisions.md#technical-and-environment-blockers) blocks persistence acceptance. OPEN-05 determines downtime, support window, and recovery commitments. Patch migration restrictions are proposed in BC-ADR-008.

## Acceptance criteria

Test competing jobs, lock-session loss, immutable history, fresh/repeated migration, transactional failure, new writes followed by old-image rollback, and permitted partial states. Before exceptional DDL, prove its recovery on restored data. Database restore also requires payment reconciliation.

## Evidence and related records

[Pinned Drizzle migrator](https://github.com/drizzle-team/drizzle-orm/blob/0.45.4/drizzle-orm/src/pg-core/dialect.ts), [PostgreSQL advisory locks](https://www.postgresql.org/docs/current/explicit-locking.html), [concurrent indexes](https://www.postgresql.org/docs/current/sql-createindex.html#SQL-CREATEINDEX-CONCURRENTLY).

Related records are [BC-ADR-004](BC-ADR-004-transactional-outbox.md), [BC-ADR-008](BC-ADR-008-repositories-and-releases.md), and [BC-ADR-011](BC-ADR-011-operations-and-recovery.md).
