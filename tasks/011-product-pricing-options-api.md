# Task 011: DB 기반 Product 가격·옵션 Read API

## Status

Implemented in the dedicated `product-pricing-options-api` worktree. Commit and push are intentionally not included in this task.

The original task specification was read from committed revision `956cdb5` because this task file was not present on the `product-database` base branch. No uncommitted frontend work was copied.

## Goal

Keep the existing Product Read API contract and add catalog pricing and option-group information. The API must preserve the distinction between confirmed values and brochure or demo references.

## Current State

- `ProductRepository` reads the base Product fields from PostgreSQL through `PrismaProductRepository`.
- `StaticProductRepository` remains available as a test double.
- Product endpoints remain `GET /api/products` and `GET /api/products/:productId`.
- PostgreSQL does not contain price, stock, option selection, or sales-policy fields.

## Scope and Non-goals

This implementation adds `pricing` and `optionGroups` to the existing list and detail responses. It does not add stock, `stockQuantity`, sold-out state, option price deltas, option selection persistence, Cart, Quote, Order, Payment, authentication, Web API integration, UI changes, or deployment configuration.

## API contract

Existing fields remain unchanged. The additive fields are:

```ts
type ProductPricing =
  | {
      mode: "QUOTE_REFERENCE";
      currency: "KRW";
      amountFrom: number;
      displayLabel: string;
      source: "BROCHURE_REFERENCE";
      authoritative: false;
    }
  | {
      mode: "DEMO";
      currency: "KRW";
      amount: number;
      displayLabel: string;
      source: "DEMO";
      authoritative: false;
    };

type ProductOptionGroup = {
  id: string;
  label: string;
  selection: "single" | "multiple";
  source: "BROCHURE";
  options: readonly { id: string; label: string }[];
};
```

NITRO uses the brochure reference `도입·1년 운영비 2,000만 원부터` with `amountFrom: 20_000_000` and `authoritative: false`. Thermal Imaging uses the demo value 5,000,000 KRW, and Chlorophyll Fluorescence uses the demo value 7,000,000 KRW. These values are not checkout prices.

NITRO exposes brochure option groups for Depth imaging, irrigation, and additional options. The response contains no option-specific additional price.

Unknown Products retain the existing 404 response shape. Repository and metadata failures become a generic 500 response through `ProductService`; SQL, credentials, and stack traces are not returned.

## Data ownership and module boundary

The data flow is:

```text
PostgreSQL schema
  -> PrismaProductRepository: base Product read model
  -> ProductService: catalog metadata enrichment and error boundary
  -> ProductController: HTTP response contract
```

`apps/api/src/product/product.catalog.ts` owns the currently confirmed brochure and demo reference metadata. It is intentionally separate from the PostgreSQL schema and seed because the project has no confirmed authoritative price, inventory, option pricing, or sales policy. A future source-of-truth decision can replace this metadata adapter without changing the HTTP controller.

`HealthModule` remains an independent sibling of `ProductModule`, and `GET /health` does not require a successful Product database query.

## Changed files

- `apps/api/src/product/product.types.ts`: separates the repository base model from the enriched API read model and defines pricing and option types.
- `apps/api/src/product/product.repository.ts`: makes the repository port return only the base Product model.
- `apps/api/src/product/static-product.repository.ts`: keeps the static adapter as a test double.
- `apps/api/src/product/prisma-product.repository.ts`: maps Prisma rows to the base model only.
- `apps/api/src/product/product.catalog.ts`: adds explicit brochure and demo metadata.
- `apps/api/src/product/product.service.ts`: enriches responses and sanitizes repository or metadata failures.
- Product unit, controller, and HTTP tests: cover additive fields, 404 behavior, no-stock boundary, and error sanitization.
- `apps/api/README.md`: documents the Product API and local database prerequisites.

## Unchanged files and excluded work

The Prisma schema, migration, seed, generated client, Web data, Web routes, UI components, Cart, Customer, Order, Payment, Docker, deployment settings, credentials, and lockfile are not changed by this task.

## Verification plan and results

Completed:

- API lint: passed.
- API TypeScript typecheck: passed.
- API unit and HTTP test suite: 6 files, 18 tests passed.

Remaining before task completion:

- API build.
- Real HTTP requests against a PostgreSQL-backed application, including list, detail, 404, and health.
- PostgreSQL repository integration test after the metadata boundary is applied.
- `git diff`, `git diff --check`, and final `git status` review.

## Follow-up

- Replace the Web static Product data with API data in a separate Web task.
- Decide whether brochure metadata should later become a database-owned catalog projection.
- Add authoritative price, stock, and sales-policy decisions only after domain evidence and a separate task or ADR.

## ADR classification

The following remain long-term Proposed ADR candidates: the PostgreSQL source-of-truth transition point, schema and migration ownership, the database module and repository boundary, API/Web data ownership, and the test database strategy. This task records the initial Product field mapping and repository placement; those details do not require a separate ADR unless they become shared conventions.

## Problems Encountered

The first pnpm command attempted a normal install and was blocked by pnpm build approval for `@prisma/engines` and `prisma`. `pnpm install --ignore-scripts` restored the already-resolved dependency tree for local checks. This is an environment approval issue, not a Product API compatibility result, and is not considered a permanent solution.
