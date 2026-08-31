# Task 012: Product Web API integration

## Status

Implemented in the dedicated `product-web-api-integration` worktree. Commit and push are intentionally not included in this task. This task is based on Product pricing/options API commit `0d000dc`. The existing `frontend-develop` worktree has unrelated uncommitted changes and was not modified.

## Goal

Replace the Web application's static Product catalog source with the NestJS Product Read API while preserving the current routes, purchase-mode behavior, Product detail not-found page, and browser-only Cart boundary.

## Scope

- Fetch Product list data from `GET /api/products` in the Next.js server component path.
- Fetch Product detail data from `GET /api/products/:productId`.
- Map the flat API read model to the existing Web presentation model.
- Render API `pricing` and `optionGroups` in Product list/detail UI without treating reference or demo values as checkout prices.
- Provide safe Web error states when the API is unavailable.
- Pass API Product data to Cart display so the Web no longer owns a duplicate Product array.
- Preserve Cart storage as Product ID and quantity only.

## Non-goals

- No changes to NestJS API, Prisma schema, migration, seed, or database credentials.
- No price calculation, option selection persistence, option additional prices, stock, Cart API, Quote, Order, Payment, authentication, or Web API mutation.
- No UI redesign, image asset work, Vercel deployment, Docker, or runtime secret configuration.
- No changes to `frontend-develop`, `product-database`, or `main`.

## Data and runtime boundary

`API_BASE_URL` is a server-side environment variable for a deployed API. Local development defaults to `http://localhost:3001`. The Web fetch runs in Next.js server components with `cache: "no-store"` so the API remains the read source during this learning stage. The browser does not receive database credentials.

The API response keeps `pricing` and `optionGroups` as additive fields. `BROCHURE_REFERENCE` and `DEMO` values remain visibly non-authoritative. The Web does not infer price, stock, or sales policy from missing fields.

The client Cart continues to store only Product IDs and quantities. Product display and direct-purchase filtering use the API Product list passed from the server. The Cart remains a browser interaction and is not an authoritative order or inventory system.

## Changed files

The expected implementation files are:

- `apps/web/lib/product-types.ts`: Web-side API and view-model types.
- `apps/web/lib/product-api.ts`: server-side Product API fetch and response mapping.
- Product list/detail pages and presentation components: API data consumption.
- Cart page/view/storage/provider: remove dependency on the static Product array while preserving Product ID and quantity behavior.
- Product API and unavailable-state error UI.
- `apps/web/README.md` and this task record.

## Unchanged files

NestJS Product API, HealthModule, Prisma schema/migrations/seed, root dependency manifests, `frontend-develop`, `product-database`, `main`, and the existing Cart domain rules remain unchanged.

## Completion criteria

- `/products` renders the three Products from the NestJS API.
- `/products/nitro` renders API pricing and all three brochure option groups.
- Thermal and Chlorophyll demo values are labeled as non-authoritative.
- Unknown Product IDs still render the existing not-found page.
- API unavailability renders a safe Web error state without stack or credential details.
- `/cart` still supports the existing browser Product ID and quantity flow without static Product data.
- `GET /health` remains unchanged on the API side.
- Web lint, typecheck, build, and real HTTP checks against running API and Web processes pass.
- `git diff`, `git diff --check`, and final status contain only this task's changes.

## Follow-up

- Decide whether Web API fetch caching and revalidation should be tuned for production deployment.
- Add a shared contract package only when API and Web contract duplication becomes a demonstrated maintenance problem.
- Design an authoritative Cart and checkout vertical slice separately.

## Verification plan

- Run Web lint, typecheck, and build.
- Run the NestJS API against the existing temporary PostgreSQL database.
- Run Next.js and request `/products`, `/products/nitro`, an unknown Product route, and `/cart`.
- Confirm API-unavailable rendering with a non-listening API base URL.
- Review diff, diff check, and worktree status without committing unless separately approved.

## Verification results

- Web lint: passed.
- Web TypeScript typecheck: passed.
- Web production build: passed. Product, detail, and Cart routes are dynamic because they depend on the runtime API.
- Real HTTP with NestJS connected to the temporary PostgreSQL test database: `/products` 200, `/products/nitro` 200, `/products/chlorophyll-fluorescence` 200, `/products/unknown-product` 404, and `/cart` 200.
- Real HTTP content checks confirmed NITRO brochure reference pricing, all three option groups, Thermal demo pricing, Chlorophyll demo pricing, and the existing Cart shell.
- With the API process stopped, `/products` returned 200 with the safe `제품 정보를 불러오지 못했습니다` state and did not expose the API error text, URL, or stack details.
- The API process was built and run from this worktree; existing API and database worktrees were not modified.
- Final `git diff --check` passed, and the worktree contains only this task's Web and task-document changes. Commit remains pending separate approval.

## Problems Encountered

- The initial Next production build tried to prerender `/cart` without a running API. The Product, detail, and Cart pages were marked `dynamic = "force-dynamic"` so runtime API data is not baked into the build.
- Windows execution policy rejected one PowerShell inline environment-variable command. A process-local `cmd /c set` command was used for HTTP verification; no environment file or credential was written.
- Ports 3000 and 3001 were already occupied by other local processes. Verification used API port 3101 and Web port 3100, without stopping or modifying those unrelated processes.
- The original repository had no committed Web API integration task. This task was created from the agreed follow-up after Product pricing/options API commit `0d000dc`; no uncommitted frontend changes were copied.
