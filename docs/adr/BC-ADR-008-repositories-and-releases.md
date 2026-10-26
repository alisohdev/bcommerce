# BC-ADR-008 Repositories and releases

Status: PROPOSED

Date: 2026-10-26

Approval: One reusable modular monolith and separate client deployments/databases are accepted. Exact boundaries and releases are unapproved.

Historical reference: Review-001/ADR-008. This record does not adopt an earlier Rust/Axum ADR.

## Context

Independent storefronts need engine security fixes without losing client design freedom. Backend forks and source-type dependencies would spread correctness across client repositories.

## Proposed decision

Use one engine repository for API, worker, migration entry point, shared dashboard, contracts, and documentation. Keep commerce modules in folders with public entry points and enforceable import boundaries. Start with Bun workspaces for demonstrated application boundaries, without package-per-module infrastructure.

Each client repository owns its custom Astro storefront, generated contract client, validated configuration, deployment pins, smoke tests, and any necessary trusted adapter source. [Client deployments](../architecture/client-deployments.md) defines the proposed ownership map.

Release engine API and worker images, migration artifacts, dashboard assets, OpenAPI, compatibility metadata, and provenance as an immutable set. Identify application, API major, schema compatibility, worker payload versions, and adapter compatibility separately. Clients pin image digests rather than mutable tags.

Propose support for the current and previous minor engine lines. Prefer migration-free patches. An exceptional additive patch migration needs explicit compatibility and rollback evidence. No destructive patch migration is proposed. Exact support duration and emergency exceptions remain open.

For each client, test the candidate with restored data, supported consumers, and client smoke tests. Verify backups, run migrations, activate after readiness, and observe before the next client. Roll back the image only to a tested compatible state. Config-only clients reuse standard images. Compiled adapter clients rebuild and test against each patched release.

## Alternatives and consequences

A single repository containing every custom storefront couples independent work. Per-client engine forks multiply fixes. Separate client repositories add release coordination and require a deployed-version inventory. An engine patch normally preserves the storefront contract, but some security changes require coordinated consumer work.

## Unresolved decisions

[OPEN-05](../architecture/open-decisions.md#open-05-hosting-and-operating-commitments) covers support duration, downtime, and deprecation. OPEN-06 covers adapter ownership. ENV-01 must establish the intended Git history before Git-based review evidence is possible.

## Acceptance criteria

Build reproducible immutable artifacts, verify the manifest against its contents, run each supported consumer baseline, and demonstrate independent upgrades and old-image rollback after new writes. Track adapter rebuilds and prevent missing worker/dashboard compatibility.

## Related records

[BC-ADR-006](BC-ADR-006-api-contracts-and-client.md), [BC-ADR-007](BC-ADR-007-database-migrations.md), [BC-ADR-009](BC-ADR-009-client-customization.md), and [BC-ADR-011](BC-ADR-011-operations-and-recovery.md).
