# BC-ADR-011 Operations and recovery

Status: PROPOSED

Date: 2026-10-26

Approval: Separate client deployments and databases are accepted. Operating commitments and implementation are not approved.

Historical reference: Review-001/ADR-011. This record does not adopt an earlier Rust/Axum ADR.

## Context

Commerce must recover both database state and external obligations. Backup completion alone does not demonstrate restoration. Restoring an old database can forget a payment or replay an effect already performed externally.

## Proposed decision

Provide structured logs with request/order/attempt/effect correlation, liveness, prerequisite-aware readiness, worker heartbeat, and actionable alerts. Monitor unresolved payments and compensation, oldest outbox work, repeated failures, migrations, backup age and restore results, disk, memory, pool pressure, and SMS budgets. Keep credentials, OTPs, ownership capabilities, full card details, and unnecessary personal data out of logs.

Separate runtime and migration privileges. Keep PostgreSQL private, secrets outside frontend builds, and media on persistent storage. Back up database, required media, deployment manifests, and recoverable secrets through controlled encrypted procedures. Keep off-site copies with approved retention and access.

Use logical backups as appropriate. If PITR is required, pair a compatible physical base backup with all necessary archived WAL. A pg_dump plus WAL is not a physical PITR chain. Verify media/database consistency and encryption-key availability in restore drills.

Restore into isolation. Inspect and reconcile payments, external operations, and outbox work before re-enabling sends. Do not automatically replay financial effects from an old snapshot. Keep a procedure for obligations created after the restore point and effects already delivered.

Build immutable artifacts outside production and validate actual registry, gateway, SMS, backup, and alert reachability. Choose services from evidence, without assuming Iran-based or overseas availability. A dedicated metrics platform or named error tracker is not mandated.

## Alternatives and consequences

Nightly dumps alone may fit an approved data-loss allowance but cannot promise a smaller RPO. PITR reduces recovery-point loss at additional operational cost. Local-only backups share the host's failure boundary. Recovery drills require time, safe data handling, and an accountable operator.

## Unresolved decisions

[OPEN-05](../architecture/open-decisions.md#open-05-hosting-and-operating-commitments) blocks production commitments. Set hosting, downtime, retention, RPO, RTO, restore cadence, and alert ownership. OPEN-03 defines compensation escalation. No numeric service objective is approved.

## Acceptance criteria

Restore data and media to isolation, measure recovery against approved targets, prove missing-key and stale-backup alerts, and reconcile sample external operations. Inject database, worker, gateway, disk, and delivery failures. Verify secrets do not appear in logs or client artifacts.

## Evidence and related records

[PostgreSQL PITR](https://www.postgresql.org/docs/current/continuous-archiving.html) documents physical base backups and WAL recovery.

Related records are [BC-ADR-002](BC-ADR-002-payments-and-orders.md), [BC-ADR-004](BC-ADR-004-transactional-outbox.md), [BC-ADR-007](BC-ADR-007-database-migrations.md), and [BC-ADR-012](BC-ADR-012-sms-abuse-and-recovery.md).
