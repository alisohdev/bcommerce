# Engineering quality standards

LOCK-06 accepts Bun lint, format, and check commands with strict TypeScript. Exact versions, rule configuration, and compatibility checks remain PROPOSED under [BC-ADR-010](../adr/BC-ADR-010-engineering-toolchain.md). This document creates no executable configuration.

## Toolchain pins

Propose Bun 1.4.4 for runtime and build validation. The initial workspace inspection found Bun 1.4.2. Bun's current documentation describes a built-in checker and formatter and marks bun lint as canary-only. Use a separately pinned immutable lint binary if required. Never install a moving canary in production or silently replace Bun lint with Oxlint. [Bun 1.4.4](https://bun.sh/blog/bun-v1.4.4), [lint](https://bun.sh/docs/lint), [check](https://bun.sh/docs/runtime/check)

Record exact runtime, lint revision, package versions, checksums, and image digests before M0b acceptance. Use frozen installs in CI after M0b is authorized. Package candidates recorded during reconciliation are historical observations, not installed dependencies or validated pins.

Use `--no-script` for built-in commands where the selected binary supports it. Suggested later CI checks are `bun lint --no-script --type-aware --max-warnings 0`, `bun fmt --no-script --check`, and `bun check --no-script`. Verify flags against the pinned binaries before configuring CI.

## Type and boundary checks

Propose strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes, noImplicitOverride, noFallthroughCasesInSwitch, and verbatimModuleSyntax. Give backend, dashboard, storefront, worker, tests, and tools explicit file coverage and environment types.

Prove that no-floating-promises, no-misused-promises, React hook rules, and restricted internal imports actually fail seeded invalid fixtures. A configured rule name alone is insufficient. Avoid unchecked casts and explicit any at business boundaries. Validate external input once and use domain types internally.

Initially compare Bun checking against a pinned matching TypeScript checker on the project and targeted fixtures. Remove redundant checks after documented parity evidence. No arbitrary three-month deadline is approved.

## Astro coverage

Run astro check for Astro files. Add pinned Prettier and prettier-plugin-astro where Bun forwards formatting. Astro build alone does not type-check. Type checking and formatting do not establish full template lint coverage. Keep business logic in checked TypeScript and document any residual template rules. [Astro TypeScript](https://docs.astro.build/en/guides/typescript/), [Bun formatter](https://bun.sh/docs/format)

## Behavior and release evidence

Use focused unit tests for money and state transitions, real PostgreSQL integration tests for atomicity, provider contract fixtures, and client smoke tests. Test observable outcomes rather than implementation details. Separate authorization, payment recovery, and reservation concurrency jobs.

Require contract compatibility checks, reviewed migrations, dependency auditing, reproducible artifacts, and restore evidence. A successful build does not prove checkout correctness. The [gate matrix](implementation-gates.md) defines measurable criteria. M0a runs documentation checks only.
