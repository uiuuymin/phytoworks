# Task: Header and home visual update

**Status:** Implemented, language switching pending

## Goal

Reorganize the Shop header into a small utility bar and a larger product-navigation row, add the requested About and Search entry points, and make the home hero identify NITRO through a real product image.

## Current

- The header placed the brand and utility links in one row and Products in a second row.
- There was no About or Search route.
- The home page used text and a CTA without a product image.
- The provided NITRO source image included a light background and a thin green line.

## Changes

- Added a top utility row with a visual `KR | EN` language selector placeholder, Search, Cart, Login, and separators.
- Enlarged the PhytoWorks wordmark and kept Products and About in the main navigation row below it.
- Added `/about` as a minimal company context page.
- The About CTA now links to the official PhytoWorks homepage at `https://phyto-works.com/ko`.
- Added `/search` using the static Product fixture as Demo data. It filters product name, category, and description through a GET query.
- Created `nitro-hero-cutout.png` from the provided photo with the background removed and used it as the home hero image.

## Boundaries

- **Demo:** Search reads `apps/web/data/products.ts`; it does not call the NestJS API.
- **TBD:** `KR | EN` is visual only. Full localization requires a locale and content strategy.
- No API endpoint, DB schema, migration, dependency, or credential was added.

## Verification

- Web lint: passed
- Web typecheck: passed
- Web production build: passed
- `git diff --check`: passed
- Manual responsive review at mobile, tablet, and desktop widths: pending
