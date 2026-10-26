# Better Commerce

Better Commerce is a reusable commerce engine with independent client deployments and databases.

M0a architecture documentation is approved at baseline fd05aea9c3dd74e44990573074b89808196e0d0e in the [canonical repository](https://github.com/alisohdev/bcommerce). The orchestrator has authorized the M0b technical foundation. Commerce business behavior and M0c integration remain separately gated.

Start with the [architecture documentation](docs/architecture/README.md), the [decision register](docs/architecture/decision-register.md), and the [ADR index](docs/adr/README.md).

The locked stack is Bun, Elysia, TypeBox, Better Auth, Drizzle, PostgreSQL, custom Astro storefronts with optional React islands, and a React + Vite dashboard. Engineering uses `bun lint`, `bun fmt`, `bun check`, and strict TypeScript.

M0b implementation and verification stay within the [foundation scope](docs/architecture/implementation-gates.md). Payment, checkout, inventory, and M0c have separate implementation gates.

Use the [M0b setup and commands](docs/implementation/m0b-usage.md) to run the technical foundation. The [verification record](docs/implementation/m0b-verification.md) lists executed checks, exact tool versions, and known limits. The API serves health endpoints; contract routes live only in a separate test fixture application.
