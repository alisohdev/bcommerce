# Client repositories and deployments

Status: PROPOSED for exact layout, topology, and release mechanics. Independent client deployments and databases are ACCEPTED under LOCK-03.

## Repository boundaries

| Proposed location | Responsibility |
| --- | --- |
| Engine apps/api | Elysia composition, HTTP DTOs, internal commerce modules, and worker and migration entry points. |
| Engine apps/admin | Shared React + Vite dashboard. |
| Engine contract artifacts | Immutable OpenAPI exports, compatibility fixtures, and release metadata. |
| Engine docs/architecture and docs/adr | This architecture record and decision history. |
| Each client repository | Custom Astro storefront, generated client, validated config, deployment pins, and client smoke tests. |
| Optional client backend source | Trusted compiled adapters and independently journaled extension migrations. |

Only documentation exists at M0a. The proposed application directories above have not been created.

## Deployment boundaries

Each client has an API, worker, one-shot migration job, PostgreSQL database, storefront delivery, dashboard delivery, persistent media, secrets, and backup configuration. API and worker come from the same engine release. The migration job uses that release's reviewed migration artifacts. Admin assets stay aligned with their compatible engine release.

The public storefront and its API calls should be same-origin through a reverse proxy. A separate admin origin is under evaluation for protection against storefront script compromise. [BC-ADR-005](../adr/BC-ADR-005-identity-and-ownership.md) owns that decision. Cookie prefixes alone do not isolate scripts on one origin.

PostgreSQL remains private. Client secrets and databases are never shared. Production performs no dependency installation. CI produces immutable artifacts that can be delivered through a reachable registry or an inspected offline transfer.

Bun remains the runtime baseline. Validate the selected Astro rendering mode and adapter with pinned Bun. Static delivery is possible where product requirements permit it. Node is not an automatic fallback. Any runtime exception requires a demonstrated blocker and explicit approval.

## Release and rollback

A release manifest identifies engine version, image digests, dashboard assets, OpenAPI hash, API major, schema compatibility, migration prerequisites, worker payload versions, and any adapter compatibility version. Exact manifest representation remains proposed.

Config-only clients reuse the standard image. Clients with backend source rebuild from the pinned engine source or supported build artifact. Extending a runtime image does not provide a safe extension API.

Upgrade each client independently using restored staging data, its supported consumer contracts, its smoke suite, verified backups, migrations, readiness checks, and observation. Roll back applications only to combinations proven compatible with the new schema and new writes. A database restore is a recovery operation that also requires external payment reconciliation.

See [BC-ADR-007](../adr/BC-ADR-007-database-migrations.md), [BC-ADR-008](../adr/BC-ADR-008-repositories-and-releases.md), and [BC-ADR-011](../adr/BC-ADR-011-operations-and-recovery.md). Hosting location and recovery commitments remain [OPEN-05](open-decisions.md#open-05-hosting-and-operating-commitments).
