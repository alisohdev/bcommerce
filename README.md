# Better Commerce

Better Commerce is a reusable commerce engine with independent client deployments and databases.

The project is at M0a, architecture documentation. Application implementation and dependency installation have not started.

Start with the [architecture documentation](docs/architecture/README.md), the [decision register](docs/architecture/decision-register.md), and the [ADR index](docs/adr/README.md).

The locked stack is Bun, Elysia, TypeBox, Better Auth, Drizzle, PostgreSQL, custom Astro storefronts with optional React islands, and a React + Vite dashboard. Engineering uses `bun lint`, `bun fmt`, `bun check`, and strict TypeScript.

M0b requires a separate orchestrator authorization. Payment, checkout, and inventory also have separate [implementation gates](docs/architecture/implementation-gates.md).
