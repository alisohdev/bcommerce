# Proposed module boundaries

Status: PROPOSED. LOCK-03 accepts a modular monolith but does not approve these exact modules. [BC-ADR-008](../adr/BC-ADR-008-repositories-and-releases.md) covers packaging.

## Ownership map

| Module | Owns | Does not own |
| --- | --- | --- |
| Catalog | Products, variants, descriptive attributes, and published product data. | Availability or the final checkout total. |
| Pricing | Base prices, discount calculation, allocation, tax calculation under an approved policy, and quote versions. | Stock holds or gateway units. |
| Carts | Mutable customer or guest purchase intentions. | Guaranteed prices, stock holds, or payment facts. |
| Checkout | Quote acceptance, idempotent checkout orchestration, and coordinated reservation. | Provider-specific interpretation or stock counters. |
| Orders | Immutable commercial snapshots and order progression. | Credential storage or mutable catalog truth. |
| Inventory | Stock counters, reservations, allocation, release, expiry, and adjustments. | Financial confirmation. |
| Payments | Attempts, operation intent, provider receipts, reconciliation, and compensation obligations. | An independent decision that an order has stock. |
| Customers | Customer profile, saved addresses, and business ownership relationships. | Credentials or session cryptography. |
| Fulfillment | Shipment lifecycle and accepted shipping quote references. | Recalculation of historical prices. |
| Notifications | Templates and notification dispatch requirements. | Payment or inventory state transitions. |

Authentication, database access, outbox processing, clocks, logging, and provider adapters are supporting infrastructure. A folder split is not a separate deployable or separately versioned package.

## Public interfaces and transactions

Other modules import a module's public entry point. They do not query its tables or import its internal repository. An automated import rule must check relative paths and path aliases. Cycle detection is part of boundary validation.

Checkout coordinates transaction-scoped public operations. A unit of work can include reservations, an order snapshot, idempotency records, and outbox insertion. Its participants use the same transaction and do not commit independently. Modules document a common lock order across the rows they touch.

Payment network calls take place between short local transactions. No database lock is held while waiting on a gateway, SMS provider, or user. Result application uses conditional transitions and durable evidence.

## Boundary contracts

TypeBox DTOs describe public inputs and outputs independently of Drizzle tables. External input is parsed at its boundary. Internal functions use domain values and explicit outcomes.

Pricing hands an immutable quote to checkout. Orders preserve the accepted quote as history. Inventory hands back an allocation outcome. Payments hand back verified evidence or uncertainty, rather than a browser-derived success boolean.

Reservation-on-checkout, exact public signatures, table layout, and supported custom adapters remain subject to the associated [ADR drafts](../adr/README.md). This map is not permission to begin commerce implementation.
