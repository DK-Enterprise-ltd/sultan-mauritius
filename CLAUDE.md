# Sultan Mauritius

E-commerce site for Sultan Mauritius, local distributor of Sultan mineral
water (sourced from Uludağ, Turkey; family business since the 1960s, in
Mauritius since March 2021). Two product lines:

- **Sparkling**: flavored mineral water in glass bottles (330ml locally;
  the global catalogue also runs 0.20L PET in ~11 flavors).
- **Still**: plain spring water in PET bottles (500ml, 1.5L; 0.25L is
  called out in the catalogue as the format Mauritians favor for
  gatherings/events).

Sells both **B2C** (individuals) and **B2B** (restaurants, supermarkets,
wholesale) with separate pricing. No online payment: bank transfer or
cash on delivery only.

The site is bilingual (English default, French at `/fr`), styled as a
premium, minimalist brand distinct from the Turkish parent site
(sultanicecek.com.tr): warm paper canvas, restrained accent color, real
product photography, no glossy gradient hero blocks.

## Style

No em dashes anywhere: not in UI copy, not in code comments, not in
responses. Use a period, comma, or colon instead.

## Stack

- Next.js 14 (App Router), React 18, TypeScript
- next-intl for i18n; locale routing lives under `src/app/[locale]/`
- Prisma 7 + `@prisma/adapter-pg` against Postgres. Connection string is
  **not** in `schema.prisma` (Prisma 7 style); it lives in
  `prisma.config.ts` (CLI) and is passed to `PrismaPg` in `src/lib/prisma.ts`
  (runtime), both reading `DATABASE_URL`.
- Plain CSS Modules per component/page, no Tailwind, no UI kit.
- Fonts: Sora (`--font-display`, headings) + Inter (`--font-body`), loaded
  via `next/font/google` in `src/app/fonts.ts` and used by both root
  layouts (storefront and admin are independent Next.js root layouts, see
  below).
- No test runner configured.

## Structure

```
src/app/[locale]/layout.tsx        true root layout for the storefront:
                                     <html lang={locale}>, fonts, next-intl
                                     provider. generateStaticParams for en/fr.
src/app/[locale]/(storefront)/      customer-facing site: nav, home, products,
                                     cart, checkout, order confirmation,
                                     wholesale, contact
src/app/admin/layout.tsx           separate root layout (its own <html>),
                                     English-only, not locale-prefixed,
                                     excluded from the i18n middleware
src/app/admin/                      internal: dashboard, inventory, orders,
                                     invoices
src/app/actions/                    "use server" actions (orders.ts,
                                     inquiries.ts): the only place that
                                     writes Order/ContactInquiry
src/components/                     Button, Card, Badge, ProductCard,
                                     InquiryForm, each with a sibling
                                     .module.css
src/lib/                            prisma client, auth stub, pricing, cart
                                     context, MUR currency formatting,
                                     catalog-i18n (French flavor/name lookup)
src/i18n/                           next-intl routing, navigation, and
                                     request config
messages/en.json, messages/fr.json  UI copy, keyed by page/component
                                     namespace
src/middleware.ts                   next-intl locale middleware; matcher
                                     excludes /admin, /api, static assets
prisma/schema.prisma                source of truth for the data model
prisma/seed.js                      plain CommonJS seed (no ts-node), run
                                     directly with `node prisma/seed.js`
```

## Conventions worth preserving

- **Money path discipline**: `createOrder` (`src/app/actions/orders.ts`)
  never trusts client-supplied prices. It re-resolves unit price from the
  live `Product` row server-side and snapshots it onto `OrderItem` at order
  time. Keep this pattern for any new checkout/pricing code.
- **B2B/B2C pricing** goes through `resolvePrice()` (`src/lib/pricing.ts`):
  wholesale price if the viewer is B2B *and* the product has one set,
  retail otherwise. Don't compute price inline elsewhere.
- **Viewer/auth is stubbed** (`src/lib/auth.ts`): `isAdmin()` always
  returns `true`, and B2B detection is a `sultan_b2b=1` cookie toggle,
  both marked `TODO(real-auth)`. Swap these two functions for real session
  lookups when auth is built; don't scatter new auth checks elsewhere.
- **Cart is client-only**: React context + localStorage
  (`src/lib/cart-context.tsx`), no server cart. Stock/availability is only
  authoritative at order-creation time.
- Money uses Prisma `Decimal` end-to-end (`formatMur` in `src/lib/format.ts`
  handles Decimal/number/string); avoid floating-point math on prices.
- CSS Modules, not Tailwind. New components should follow the existing
  `Component.tsx` + `Component.module.css` pairing.
- **Product data itself is not translated in the database.** Names and
  flavors (e.g. "Watermelon Strawberry") come from `prisma/seed.js` in
  English; `src/lib/catalog-i18n.ts` holds a small static French lookup
  table for the known SKUs. Add a `nameFr`/`flavorFr` schema column only
  if the lineup grows past a couple dozen entries.
- `ponytail:` comments mark deliberate shortcuts (stubbed auth, plain
  CommonJS seed, localStorage cart, the flat i18n lookup); read them
  before "fixing" the thing they're attached to.

## Brand

- Palette (`src/app/globals.css`): warm paper canvas (`--paper`, `--ink`),
  navy `#1b2a4a`, sky `#4fb8d6`, teal `#1b9aae`, sun `#e8963a` as accents.
  Display face Cabinet Grotesk / body face Satoshi, loaded from Fontshare
  in `src/app/[locale]/layout.tsx`'s `<head>`, with Sora/Inter (`src/app/
  fonts.ts`) as the offline fallback chain feeding the same CSS variables.
- All site imagery — logo, product bottle/flavour photography, hero and
  story shots — is the exact asset set from `../Sultan Mauritius Website
  Design/uploads/` (the Claude Design canvas this site's look is ported
  from), copied verbatim into `public/uploads/` under its original
  filenames. Reference `prisma/seed.js` for which file backs which SKU.
  Don't reorganize this into a second `public/images/` tree; it was
  consolidated into one folder on purpose. `../reference/` (one level up,
  outside this Next.js project) holds the wider unedited photo library
  this set was drawn from.
- Product catalogue PDF (repo root, one level up) is Sultan's global/Turkey
  brand catalogue. Useful for brand story and flavor range, but the local
  Mauritius SKU lineup actually sold is `prisma/seed.js`. Some catalogue
  pages carry a leftover "Grignoti" watermark from the source template;
  ignore it, it isn't part of the Sultan brand.

## Sanity CMS

Editorial content (things a non-developer should be able to change without
a deploy) is authored in a standalone Sanity Studio and synced one-way into
Postgres, which is what the site actually renders from — a Sanity outage
never breaks a page load, and it keeps `createOrder`'s money-path discipline
intact (price/stock stay Prisma-only, Sanity never touches them).

```
../studio/                          standalone Sanity Studio (its own app,
                                     sibling to this folder). Run: cd ../studio
                                     && npm run dev (localhost:3333)
../studio/schemaTypes/              stockist, productCopy (by SKU), homeContent
                                     (singleton, id "homeContent")
src/app/api/sanity/*/route.ts       one webhook route per document type;
                                     verifies SANITY_WEBHOOK_SECRET via
                                     next-sanity/webhook, then upserts into
                                     Postgres (src/lib/sanity-sync.ts)
prisma/schema.prisma                Stockist, ProductCopy, SiteContent models
                                     (see the "CMS content" section) — the
                                     tables pages actually query
src/lib/site-content.ts             pick(): Sanity-synced copy wins, falls
                                     back to messages/*.json if a field was
                                     never authored in Studio
scripts/sanity-seed-content.js      one-off: pushed the site's existing copy
                                     into Sanity as starting content (already run)
scripts/sanity-backfill.js          one-off: re-pull all Sanity content into
                                     Postgres by hand (webhook down/missed events)
```

**Sanity project:** `ftdxoig2` / dataset `production`. Credentials live in
`.env.local` (`SANITY_API_KEY`, `SANITY_PROJECT_ID`, `SANITY_DATASET`,
`SANITY_WEBHOOK_SECRET`).

**Webhook setup (manual, one-time, needs a public URL):** in Sanity Manage
(`npx sanity manage` from `../studio`) → API → Webhooks, create one webhook
per document type, each POSTing to the matching route below, with the same
`SANITY_WEBHOOK_SECRET` value as `.env.local`:

| Filter | URL | Projection |
|---|---|---|
| `_type == "stockist"` | `/api/sanity/stockist` | `{_id, name, region, town, address, phone, mapUrl, isActive}` |
| `_type == "productCopy"` | `/api/sanity/product-copy` | `{_id, sku, tasteNote, tasteNoteFr, bestServedNote, bestServedNoteFr, specNote, specNoteFr}` |
| `_type == "homeContent"` | `/api/sanity/home-content` | `{...}` |

Until these are created (or while developing against `localhost`, which
Sanity can't reach), edits made in Studio don't reach the site — run
`node scripts/sanity-backfill.js` after editing to sync by hand.

Stockists start empty (no fabricated data); the business fills the region/
town/address for each shop directly in Studio.

## Running locally

```
npm run dev              # needs DATABASE_URL in .env.local
node prisma/seed.js      # seed sample products/customers/orders
```

Storefront: http://localhost:3000/en or /fr. Admin (unprefixed, English
only): http://localhost:3000/admin.
