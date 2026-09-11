# Sultan Mauritius

E-commerce site for Sultan Mauritius, local distributor of Sultan mineral
water (sourced from Uludağ, Turkey; family business since the 1960s, in
Mauritius since March 2021). Two product lines:

- **Sparkling**: flavored mineral water in 200ml glass bottles, 11
  flavors: Lemon, Apple, Mandarin, Sade (plain/unflavored), Gazoz (mixed
  fruit), Mango & Pineapple, C-Extra (lemon + vitamin C), Mojito (mint &
  lemon), Black Mulberry & Blackcurrant, Berry & Hibiscus, Watermelon
  Strawberry. Confirmed against the customer's official product photos
  (`../reference/Customer upload/Carbonated`), which print "200ml" and
  "6x200 ml" on the labels — an earlier version of this file said 330ml,
  that was wrong.
- **Still**: plain spring water in PET bottles, 250ml/500ml/1.5L plus a
  "Prime" line at 400ml/800ml; 0.25L is called out in the catalogue as the
  format Mauritians favor for gatherings/events.

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
- Plain CSS Modules per component/page, no Tailwind, no UI kit — **except
  `/admin`**, which additionally loads Tailwind v4 + shadcn/ui + bklit's
  chart components (`src/app/admin/admin-tailwind.css`, `components.json`),
  scoped there on purpose: the admin layout is a separate Next.js root
  layout (its own `<html>`), so Tailwind's reset/utilities never reach the
  storefront. Add shadcn/bklit components with `npx shadcn@latest add
  <name>` — they land in `src/components/ui/` or `src/components/charts/`.
  **Known issue:** bklit's `AreaChart`/`BarChart` (`src/components/charts/
  area-chart.tsx`, `bar-chart.tsx`) hang the browser tab after a few
  seconds when actually rendered with data, reproduced in both dev and a
  production build, isolated to shared code (both chart types hang
  independently) rather than one component — likely a missing memoization
  in the animation/domain-tweening state machine that never lets a phase
  transition settle. Not fixed as of 2026-09-11; don't wire either into a
  live page until root-caused. The rest of the library (installed
  dependencies, `src/lib/utils.ts`'s `cn`, `src/components/ui/button.tsx`)
  is unaffected.
- Fonts: Sora (`--font-display`, headings) + Inter (`--font-body`), loaded
  via `next/font/google` in `src/app/fonts.ts` and used by both root
  layouts (storefront and admin are independent Next.js root layouts, see
  below).
- No test runner configured.
- `resend` for transactional email (order status, invoice sends);
  `@react-pdf/renderer` for server-side invoice PDF generation (no headless
  browser).

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
src/app/admin/                      internal: dashboard (real stat cards +
                                     sparklines via src/lib/admin-stats.ts),
                                     inventory (list + per-product detail
                                     with stock movement history, status
                                     toggle), orders (list + per-order
                                     detail with full customer info),
                                     customers (searchable list, links to
                                     their filtered orders), invoices (list
                                     with Draft/Sent/Paid filter + per-
                                     invoice detail: edit due date/amount
                                     paid/status, Send invoice, Download
                                     PDF). Top bar has a quick-jump search
                                     (src/app/actions/admin-search.ts):
                                     a number jumps straight to that order,
                                     anything else searches customers.
src/app/actions/                    "use server" actions (orders.ts,
                                     inquiries.ts, invoices.tsx): the only
                                     place that writes Order/ContactInquiry/
                                     Invoice
src/app/api/admin/invoices/[id]/pdf/route.tsx
                                     admin-only PDF download for an invoice,
                                     rendered server-side via
                                     @react-pdf/renderer (src/lib/pdf/
                                     invoice-pdf.tsx) — no headless browser
src/components/                     Button, Card, Badge, ProductCard,
                                     InquiryForm, each with a sibling
                                     .module.css
src/lib/                            prisma client, auth stub, pricing, cart
                                     context, MUR currency formatting,
                                     catalog-i18n (French flavor/name lookup),
                                     email.ts (Resend), pdf/ (invoice PDF)
src/i18n/                           next-intl routing, navigation, and
                                     request config
messages/en.json, messages/fr.json  UI copy, keyed by page/component
                                     namespace
src/middleware.ts                   next-intl locale routing AND: rate
                                     limiting (general + a tighter bucket
                                     for POST/server-action/API traffic,
                                     keyed off Vercel's trusted req.ip) AND
                                     the Content-Security-Policy header for
                                     every response. Admin/api/studio paths
                                     skip next-intl but still get both.
prisma/schema.prisma                source of truth for the data model
prisma/seed.js                      plain CommonJS seed (no ts-node), run
                                     directly with `node prisma/seed.js` —
                                     it's an upsert, safe to re-run, and is
                                     the only thing that pushes a changed
                                     Product.imageUrl mapping into the DB
docs/security-checklist.md          project-specific security audit
                                     (severity-tiered, P0-P3), built from
                                     the reusable template at
                                     ~/.claude/rules/ecc/common/
                                     security-checklist.md — update it as
                                     findings are fixed or new ones land
```

## Conventions worth preserving

- **Money path discipline**: `createOrder` (`src/app/actions/orders.ts`)
  never trusts client-supplied prices. It re-resolves unit price from the
  live `Product` row server-side and snapshots it onto `OrderItem` at order
  time. Keep this pattern for any new checkout/pricing code.
- **B2B/B2C pricing** goes through `resolvePrice()` (`src/lib/pricing.ts`):
  wholesale price if the viewer is B2B *and* the product has one set,
  retail otherwise. Don't compute price inline elsewhere.
- **Admin auth is real, single-login** (`src/lib/auth.ts` + `src/lib/
  admin-session.ts` + `src/app/actions/admin-auth.ts`): `isAdmin()` checks
  an HMAC-signed session cookie (`sultan_admin_session`), set by the
  `loginAdmin` server action after a timing-safe compare against
  `ADMIN_USERNAME`/`ADMIN_PASSWORD` (`.env.local`). One shared login, no
  user table — `/admin` renders `AdminLoginForm` in place of the dashboard
  when unauthenticated, rather than redirecting. The session cookie's
  `path` is `/` — it must cover both `/admin` and `/api/admin/...` (the PDF
  route, and any future admin API route), which don't share a path prefix
  other than `/`. Cookie `set()`/`delete()` calls must always use the same
  `path`, or `delete()` silently no-ops instead of logging anyone out.
  `/admin` is intentionally
  not linked from anywhere in the storefront (no nav/footer entry); it
  only exists as a path. **Customer-facing viewer/auth is still stubbed**:
  `getViewer()`'s B2B detection is a `sultan_b2b=1` cookie toggle, marked
  `TODO(real-auth)`. Swap that one for a real session lookup when customer
  accounts are built; don't scatter new auth checks elsewhere.
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
- **Invoice lifecycle**: `generateInvoiceForOrder` (`src/app/actions/
  invoices.tsx`) creates a `DRAFT` invoice, not a sent one — editable
  (due date, amount paid, status) via the form on `/admin/invoices/[id]`
  before anyone sees it. `sendInvoice` emails the customer the PDF via
  Resend and only then flips status to `ISSUED`; unlike order-status
  emails, a failed send is reported back to the admin instead of swallowed,
  since sending *is* the point of that action. `balanceDue` is always
  recomputed server-side from `order.total - amountPaid`, never taken from
  client input directly — same discipline as the money path in `orders.ts`.
- **Stock decrements are guarded, not just checked-then-written**:
  `createOrder` uses `product.updateMany({ where: { stockQuantity: { gte:
  quantity } } })` and rolls back the transaction on a zero-row result.
  Follow this pattern for any future code that decrements shared inventory
  — a plain read-then-`update` is a race under concurrent orders.
- **Order status emails / invoice emails** go through `src/lib/email.ts`
  (Resend). Requires `RESEND_API_KEY`; without it, sends are skipped with a
  one-time console warning rather than attempted. `FROM` defaults to
  Resend's shared sandbox address, which **only delivers to the Resend
  account's own verified email** — set `EMAIL_FROM` once a sending domain
  is verified in Resend so switching senders is a config change, not code.

## Brand

- Palette (`src/app/globals.css`): warm paper canvas (`--paper`, `--ink`),
  navy `#1b2a4a`, sky `#4fb8d6`, teal `#1b9aae`, sun `#e8963a` as accents.
  Display face Cabinet Grotesk / body face Satoshi, loaded from Fontshare
  in `src/app/[locale]/layout.tsx`'s `<head>`, with Sora/Inter (`src/app/
  fonts.ts`) as the offline fallback chain feeding the same CSS variables.
- `public/uploads/` is the exact asset set from `../Sultan Mauritius
  Website Design/uploads/` (the Claude Design canvas this site's look is
  ported from) — story/lifestyle/catalogue-page shots, copied verbatim
  under their original filenames. Don't reorganize this into a second
  `public/images/` tree; it was consolidated into one folder on purpose.
- `public/Assets/Products/{Sparkling,Still,Packs}` is real Sultan product
  photography, not stock/placeholder images: sourced from `../reference/
  Customer upload/` (the customer's official uploads — Carbonated/water
  folders), picked and renamed per flavor/size (2026-09 pass). Reference
  `prisma/seed.js` for which file backs which SKU. `Packs/` holds 6-pack
  and 24-case shots (real shrink-wrap/carton photography) not tied to a
  specific Product row; nothing currently renders them, they're there for
  a future wholesale/case-size section.
- `public/Assets/Lifestyle/hero-desktop-picnic.jpg` and `hero-mobile-ice.jpg`
  (homepage hero, art-directed via `getImageProps` + `<picture>` in
  `page.tsx`) are agency photography from `../reference/Customer upload/
  Agency/`, not the Design canvas set.
- `../reference/` (one level up, outside this Next.js project) holds the
  wider unedited photo library all of the above was drawn from — treat it
  as source material, not something the site reads from directly.
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
                                     sibling to this folder, its own git repo).
                                     Run: cd ../studio && npm run dev
                                     (localhost:3333). Source of truth for the
                                     schema.
src/app/studio/[[...tool]]/         Studio embedded in this Next.js app too
                                     (deployed with the site, at /studio) via
                                     next-sanity's NextStudio — same project/
                                     dataset as ../studio. src/sanity/ holds
                                     its config + a COPY of the schema (see
                                     the ponytail comment in
                                     src/sanity/schemaTypes/index.ts): Vercel
                                     only builds this repo, not the sibling
                                     ../studio folder, so the schema can't be
                                     imported across the two — keep both in
                                     sync by hand when the content model
                                     changes. sanity.config.ts is marked
                                     'use client': without it, Next bundles
                                     the Studio's import chain under React
                                     Server Component conditions at build
                                     time and the build fails with
                                     "createContext is not a function".
../studio/schemaTypes/              stockist, productCopy (by SKU, incl. an
                                     optional photo override per SKU), and
                                     six page-copy singletons: homeContent,
                                     aboutContent, productsContent,
                                     wholesaleContent, stockistsContent,
                                     contactContent. Each singleton covers
                                     that page's marketing copy (kickers,
                                     titles, bodies, CTA labels) — not every
                                     UI string (button microcopy, filter chip
                                     labels, lab-measured water parameter
                                     values stay code-only). productsContent
                                     also carries `favoriteSkus`, the SKU
                                     list for the Shop page's "Mauritian
                                     Favorites" strip.
src/app/api/sanity/webhook/route.ts single combined webhook (this project's
                                     plan caps webhooks at 2); dispatches by
                                     `_type`: stockist/productCopy go to
                                     syncStockist/syncProductCopy, all six
                                     page-copy singletons go through the one
                                     generic syncSiteContent(key, doc) (see
                                     SITE_CONTENT_KEY_BY_TYPE in the route for
                                     the _type -> SiteContent.key map), all in
                                     src/lib/sanity-sync.ts, after verifying
                                     SANITY_WEBHOOK_SECRET via
                                     next-sanity/webhook. The older per-type
                                     routes (src/app/api/sanity/{stockist,
                                     product-copy,home-content}/route.ts)
                                     still work but are unused while on that
                                     plan.
prisma/schema.prisma                Stockist, ProductCopy (with imageUrl),
                                     SiteContent models (see the "CMS
                                     content" section) — the tables pages
                                     actually query
src/lib/site-content.ts             pick(): Sanity-synced copy wins, falls
                                     back to messages/*.json if a field was
                                     never authored in Studio. Every
                                     storefront page (home, about, products,
                                     wholesale, stockists, contact) fetches
                                     its own getSiteContent(key) and wraps it
                                     in a local c() = (k) => pick(...) helper
                                     — see page.tsx for the pattern.
src/lib/catalog.ts                  withCopyImage(): a Studio-set
                                     productCopy.imageUrl (by sku) overrides
                                     Product.imageUrl at the getActiveProducts
                                     / getProductById read boundary, so a
                                     photo swap in Studio doesn't need a
                                     deploy. Price/stock still never flow
                                     through Sanity — only the photo.
scripts/sanity-seed-content.js      one-off: pushed the site's existing copy
                                     into Sanity as starting content.
                                     seedHomeContent/seedProductCopy already
                                     ran — re-running them would overwrite
                                     any edits already made in Studio with
                                     the messages.json snapshot, so don't.
                                     seedAboutContent/seedWholesaleContent/
                                     seedContactContent/seedStockistsContent/
                                     seedProductsContent are new and safe to
                                     run once, before those documents exist.
scripts/sanity-backfill.js          one-off: re-pull all Sanity content into
                                     Postgres by hand (webhook down/missed events)
```

**Sanity project:** `ftdxoig2` ("Sultan Mauritius", DK Enterprise org) /
dataset `production`. Credentials live in `.env.local` (`SANITY_API_KEY`,
`SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_WEBHOOK_SECRET`, plus
`NEXT_PUBLIC_SANITY_PROJECT_ID`/`NEXT_PUBLIC_SANITY_DATASET` for the
embedded Studio, which runs in the browser). There was a second, unrelated
Sanity project (`w7su6qgi`, "Sultan Mauritius CMS") briefly set up under a
different org — `.env.local` pointed at it for a while, with its own working
webhook + CORS. That was never the project `../studio` or CLAUDE.md used, so
it's abandoned now; `ftdxoig2` is the one project going forward. If a
Sanity-related MCP tool ever reports "project not found" or an authorization
error for `ftdxoig2`, that's expected unless it's authenticated as an
account with access to the DK Enterprise org.

**Webhook setup (manual, one-time, needs a public URL):** in Sanity Manage
(`npx sanity manage` from `../studio`, or sanity.io/manage) → `ftdxoig2` →
API → Webhooks, create one webhook:

| Name | Filter | URL | HTTP method |
|---|---|---|---|
| Content sync | `_type in ["stockist", "productCopy", "homeContent", "aboutContent", "productsContent", "wholesaleContent", "stockistsContent", "contactContent"]` | `/api/sanity/webhook` | POST |

If the webhook was created before the five page-copy singletons existed
(aboutContent/productsContent/wholesaleContent/stockistsContent/
contactContent), its filter needs updating in Sanity Manage to the list
above, or edits to those pages in Studio won't reach the site.

No projection (send the whole document). Use the same secret as
`SANITY_WEBHOOK_SECRET` in `.env.local`. Also add the deployed site's origin
(`https://sultan-mauritius.vercel.app`) under API → CORS origins, with
credentials not required, so the embedded `/studio` route and the app's own
requests are allowed.

Until the webhook is created (or while developing against `localhost`, which
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

Order-status and invoice emails need `RESEND_API_KEY` in `.env.local` (see
`.env.example`) — without it, sends are skipped and logged, not attempted;
the rest of the app works fine either way.
