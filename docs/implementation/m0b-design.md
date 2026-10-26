# M0b foundation design

The orchestrator authorized the technical foundation after reviewing M0a at fd05aea9c3dd74e44990573074b89808196e0d0e. Documentation corrections are recorded in commit f743b45. [Implementation gates](../architecture/implementation-gates.md) define the permitted scope.

## Exploration and selection

Two native GPT-6.1 Sol architect candidates at max reasoning proposed distinct structures. Candidate A kept database infrastructure inside apps/api and used packages/api-client as the independent generated consumer. Candidate B added a packages/infrastructure workspace shared by runtime readiness and the migration CLI.

A separate native GPT-6.1 Sol cross-judge preferred A. Its rubric covered scope economy, ownership depth, verifiable evidence, migration safety, and consumer independence. Both candidates proposed the same physical-session migration safety. The added infrastructure package did not improve that guarantee for this foundation.

The selected design uses two workspaces. It incorporates B's separate contract fixture application and discriminated readiness results. It rejects a production fixture toggle and an extra infrastructure package. All candidate and judge lanes used the configured native model, so this comparison provides independent sessions rather than model-family diversity.

## Foundation shape

The API workspace owns its runtime application, health endpoints, database connection, migration lifecycle, and isolated TypeBox contract fixture application. The runtime app exposes no commerce behavior and performs no startup DDL.

The client workspace consumes only an emitted OpenAPI artifact and generated types. A small typed fetch constructor enables a real HTTP proof. It imports no Elysia App type or engine internals.

The migration operation owns one dedicated physical PostgreSQL session from lock acquisition through journal validation, Drizzle execution, final validation, and cleanup. It does not reconnect or transfer the lock to another session. Committed migration history must match an ordered checksum prefix of the bundle.

Readiness distinguishes unavailable PostgreSQL from missing schema prerequisites. Synthetic migration and contract fixtures establish infrastructure behavior only. An integer-shaped string does not approve a commerce monetary policy.

## Throughput checkpoint

- Blocking first steps are documentation corrections and executing actual pinned tool binaries before claiming native support.
- Independent workstreams are completed design exploration and parent documentation/evidence work alongside one code owner.
- Shared mutable state is separated into the parent branch for documentation and an isolated implementation worktree. Commits are integrated after review.
- The smallest safe decomposition is one implementation owner because root tooling, generated contracts, database tests, Docker, and CI share one dependency baseline. Parent verification remains independent.

## Boundaries retained

Better Auth isolation, independent Astro integration, restore drills, extended consumer compatibility, old-image rollback matrices, and pre-production soak remain outside M0b. Commerce implementation gates remain closed. Foundation experiments do not accept every part of the 12 proposed ADRs.

Executed results, actual versions, and remaining blockers belong in the M0b verification report. A design proposal alone is not evidence that any command or test passed.
