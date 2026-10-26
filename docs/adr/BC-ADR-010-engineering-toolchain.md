# BC-ADR-010 Engineering toolchain

Status: PROPOSED

Date: 2026-10-26

Approval: Bun lint, format, check, and strict TypeScript are ACCEPTED under LOCK-06. Exact versions and supplementary checks are unapproved.

Historical reference: Review-001/ADR-010. This record does not adopt an earlier Rust/Axum ADR.

## Context

Commands must be present in pinned binaries and cover backend, React, and Astro sources. A named lint rule or successful transpilation is insufficient proof. The current workspace has no application or tool configuration.

## Proposed decision

Evaluate Bun 1.4.4 as the stable runtime/build baseline. Use an independently pinned immutable lint canary if stable Bun lacks lint. Record revision, checksums, and reproduction instructions before acceptance. Never replace Bun lint with Oxlint automatically or use a rolling canary in production.

Pin dependencies and images exactly and use frozen CI installs after M0b authorization. Verify builtin-command dispatch with --no-script where supported. Keep strict project configs and explicit includes for backend, worker, dashboard, storefront, tests, and tooling. Proposed flags and rule categories are in [engineering quality](../architecture/engineering-quality.md).

Initially compare bun check with a pinned matching TypeScript checker on representative project fixtures. Retire duplicate checking after recorded parity, not after an arbitrary duration. Use failing fixtures for promise handling, React hooks, and module import rules.

Add astro check and pinned Prettier/Astro formatting support for the documented coverage gaps. Document remaining Astro template lint gaps rather than claiming complete coverage. Validate the intended Astro rendering mode on Bun. Any alternate runtime needs a demonstrated blocker and explicit approval.

## Alternatives and consequences

Silently replacing tools violates the locked stack. Using a moving canary prevents reproducibility. A separate lint binary and Astro supplementation add maintenance but preserve production runtime stability and actual source coverage. A checker comparison is temporary validation, not a second permanent toolchain by default.

## Unresolved decisions

[TECH-01](../architecture/open-decisions.md#technical-and-environment-blockers) blocks toolchain acceptance. TECH-04 blocks storefront runtime acceptance. No exact lint canary is selected or installed. An authorized M0b experiment must resolve these facts before claiming completion.

## Acceptance criteria

Run the seeded and clean cases in the [M0b matrix](../architecture/implementation-gates.md#m0b-scope-after-separate-authorization). Check non-writing format mode, formatter idempotence, AST/template coverage, rule behavior, and actual binary identities. Before a live client, perform the separately proposed representative soak.

## Evidence and related records

Official sources document [Bun lint](https://bun.sh/docs/lint), [format](https://bun.sh/docs/format), [check](https://bun.sh/docs/runtime/check), and [Astro checking](https://docs.astro.build/en/guides/typescript/). Feature availability still needs verification against the selected binary.

Related record is [BC-ADR-006](BC-ADR-006-api-contracts-and-client.md).
