# Sultan Mauritius — Website Change Implementation Plan

Source: `Sultan_Website_Feedback_Updated_SEO.pdf` (client feedback, 2026-09).
Scope: `sultan-mauritius-scaffold` (Next.js storefront) + `../studio` (Sanity CMS,
content only, no code change).

Legend: **[code]** = requires a code change/deploy. **[content]** = business
fills it in via Sanity Studio, no deploy needed. **[design]** = needs a new
asset from whoever owns the brand files before dev can wire it up.

---

## 1. Homepage — "Mauritius" under the logo

**[code]** `src/app/[locale]/(storefront)/StorefrontNav.tsx:58-60`

The nav renders `logo_white.svg` as an `<Image>`, no room for a second line
today. Add a small `<span>Mauritius</span>` under/beside the wordmark inside
the `styles.logo` link, styled in `StorefrontNav.module.css` (letter-spaced
caps, small size, same as the existing kicker treatment elsewhere). No new
SVG needed — do it in CSS/HTML rather than baking text into the logo file,
so it doesn't have to be redrawn if the tagline ever changes.

Effort: small.

---

## 2. Shop page — Units vs Packs sections

**[code]** `src/app/[locale]/(storefront)/products/page.tsx`

Today the shop page only lists single-bottle products — packs are folded
into each bottle's own variant picker and explicitly excluded from the grid:

```ts
// line 44
const singles = allProducts.filter((p) => p.packCount === 1);
```

To match the brief (units and packs both visible on one page, in two
clearly labeled, jump-to sections):

1. Split `allProducts` into `units = allProducts.filter(p => p.packCount === 1)`
   and `packs = allProducts.filter(p => p.packCount > 1)`.
2. Keep the existing Sparkling/Still + size/flavor filtering logic, but run
   it against each group separately (or apply it only to `units`, and list
   `packs` unfiltered underneath — packs are just 6-pack/24-case SKUs, a
   short list, filtering may be unnecessary there).
3. Render two `<section id="units">` / `<section id="packs">` blocks, each
   with its own `styles.grid` of `ProductCard`s, instead of one flat grid.
4. Add two jump-link buttons near the top of the page (`<a href="#units">`,
   `<a href="#packs">`), styled as pill buttons in `page.module.css`,
   positioned near the existing Sparkling/Still lane buttons. Plain anchor
   links + `scroll-behavior: smooth` on the container is enough — no JS
   scroll library needed.
5. Update `messages/en.json` / `messages/fr.json` under `products.*` with
   `unitsLabel` / `packsLabel` strings (e.g. "Units" / "Packs").

Note: `ProductCard`/`productVariants` (`src/lib/catalog.ts:47`) already
groups a bottle with its pack siblings for the "choose an option" picker on
each card — that logic is unrelated to this page-level split and does not
need to change. Packs shown in the new "Packs" section can still open their
own variant picker if a pack itself comes in more than one size.

Effort: medium (page layout change, no schema/data change — `packCount` and
product `type` already exist on every `Product` row).

---

## 3. Shop page — "Mauritian Favorites" section

**[code + content]** `src/app/[locale]/(storefront)/products/page.tsx`

No `isFeatured`/`isBestseller` flag exists on `Product` today (the homepage's
"Featured" section, `page.tsx:54-61`, uses a hardcoded `FEATURED_SKUS` array
— the same pattern works here). Two options:

- **Cheapest**: reuse the same hardcoded-SKU-array pattern (a short constant
  list of SKUs picked by the business), rendered as a `styles.favorites`
  section above or below the Units/Packs split, titled via a new
  `products.favoritesTitle` message key ("Mauritian Favorites" /
  "Most Loved in Mauritius").
- **If the list will change often**: add `isFeaturedMU Boolean @default(false)`
  to `Product` in `prisma/schema.prisma`, expose a toggle in
  `src/app/admin/inventory/StockAdjuster.tsx`, and filter on it instead of a
  hardcoded array. Only worth it if the business wants to change this list
  without a code deploy — start with the hardcoded array, add the DB column
  later if that becomes a real pain point.

Effort: small (hardcoded list) to medium (DB-backed toggle).

---

## 4. About page / homepage — clarify "Uludağ" in the origin timeline

**[content, mostly already correct] + [code, one stat tile]**

The 3-step "timeline" the feedback refers to is the homepage's origin
section (`src/app/[locale]/(storefront)/page.tsx:220-236`, driven by
`ORIGIN_STEPS` + `home.origin1Title/Body` … `origin3Title/Body` in
`messages/en.json:43-49`). Checked against the PDF: `origin1Body` already
reads "...foothills of Uludağ, **Turkey**..." — Turkey is already explicit
there, no change needed.

The genuinely unclear item is the About page's legacy stat grid
(`about/page.tsx:26-31`, sourced from `home.legacyStat2Value` /
`legacyStat2Label`, Sanity-editable via `homeContent.legacyStat2Value/Fr`):

```
legacyStat2Value: "Uludağ"
legacyStat2Label: "Sourced from Turkey"
```

Rendered as a large stat number ("Uludağ") with a small caption underneath —
a visitor unfamiliar with the name sees "Uludağ" in big text before the
"Turkey" caption registers. Fix: swap the value/label so the visible bold
figure is unambiguous, e.g. `legacyStat2Value: "Turkey"` /
`legacyStat2Label: "Sourced from Uludağ"`. This is a content-only change —
edit directly in Sanity Studio (Home page → Stat 2), no deploy required. If
Studio hasn't been populated for this field yet, it falls back to
`messages/en.json:26-27` / `messages/fr.json`, which should get the same
edit for consistency.

Effort: content edit, near-zero engineering.

---

## 5. About page / homepage — "across the island" → "across Mauritius"

**[content, mostly]** Exact strings, `messages/en.json`:

| Key | Current | Change to |
|---|---|---|
| `home.legacyBody` (also Sanity `homeContent.legacyBody`) | "...family gatherings across the island." | "...family gatherings across Mauritius." |
| `home.origin3Body` | "...taken up for gatherings and events across the island." | "...across Mauritius." |
| `home.socialTitle` | "On the island, in the wild" | "In Mauritius, in the wild" (or keep "island" here if it's meant as a stylistic aside — flag for the client's call) |
| `home.mauritiusTitle` (About page, `mauritiusTitle`) | "...a place on the island's tables." | "...a place on Mauritius's tables." |
| `stockists.intro` | "...supermarkets, restaurants, and mini shops across the island." | "...across Mauritius." (matches PDF §7 wording exactly) |

Also apply the PDF's suggested `legacyBody` rewrite (PDF §5): the March 2021
date, "first order of sparkling mineral water", and "restaurant tables,
market shelves and family gatherings across Mauritius" are already present
in `legacyBody` almost verbatim — just needs the "across the island" tail
fixed as above, no larger rewrite required.

`legacyBody`, `mauritiusTitle`-adjacent fields, and `socialTitle` are all
Sanity-editable (`homeContent` doctype) — prefer editing there over the
messages JSON so the change survives without a deploy; update
`messages/en.json`/`fr.json` too as the fallback of record.

`origin3Body` and `stockists.intro` are **not** currently in the
`homeContent` Sanity schema — they're messages-only, so this half of the
change requires a code deploy (editing the JSON files and redeploying), or
extending `src/sanity/schemaTypes/homeContent.ts` / `../studio/schemaTypes/
homeContent.ts` with those two fields first if the client wants ongoing
editorial control over them.

Effort: small.

---

## 6. New About section — "Sultan in Mauritius" (local distribution/story)

**[code]** `src/app/[locale]/(storefront)/about/page.tsx`

A section already exists at this position (`styles.mauritius`,
`about/page.tsx:102-113`) with kicker/title/body + one image
(`mauritiusKicker`/`mauritiusTitle`/`mauritiusBody`) — it's the natural home
for this content rather than a net-new band. Extend its copy (via
`about.mauritiusBody` in `messages/*.json`, not currently in the Sanity
schema — add fields to `homeContent` or a new `aboutContent` singleton if
editorial control is wanted here) to cover the four beats from the PDF:

- Efficient local distribution / stock management across Mauritius.
- Careful glass-bottle handling.
- 100% Mauritian labor.
- Bridge between Turkish culture and Mauritius, told through people, not
  logistics jargon.

If the body copy gets long, add 3-4 short stat/point tiles under it
(mirroring the `statGrid` pattern already used in the `legacy` section just
above on the same page, `about/page.tsx:61-68`) rather than one dense
paragraph — reuses an existing, already-styled component pattern instead of
inventing a new layout.

Effort: small (copy + reuse of existing section/stat-grid pattern).

---

## 7. Stockists / Where to Buy

**[content only]** — the plumbing already matches the PDF's ask exactly:

- `Stockist` Sanity schema (`../studio/schemaTypes/stockist.ts`) already has
  shop name, region (North/Centre/West/East/South), town, address, phone,
  Google Maps link (`mapUrl`), active toggle.
- `stockists/page.tsx` already groups by region, shows name + town +
  Maps-linked address, in a clean scannable list.
- This is genuinely "pending the final client list" per the PDF — the
  business adds each stockist in Sanity Studio (`../studio`, or the embedded
  `/studio` route). No code change needed once the list exists.

The only code-adjacent item: `stockists.intro` wording fix, covered in
item 5 above ("across the island" → "across Mauritius", matches PDF's exact
suggested sentence).

Effort: none (dev) / ongoing (business, as stockists sign on).

---

## 8. Wholesale page — review the orange accent

**[code]** `src/app/[locale]/(storefront)/wholesale/page.module.css:21`

The page's `.kicker` is set to `var(--sultan-sun)` (orange, `#e8963a`).
Covered by the broader color-direction change in item 10 below — swap this
one usage to a purple/plum or teal accent once the new accent direction is
picked, rather than treating it as a one-off.

Effort: trivial once item 10's direction is decided.

---

## 9. Contact / Get in Touch

No PDF-mandated change (§9: "no major adjustment required"). No action.

---

## 10. Overall color direction — reduce orange, add purple/pink accents

**[design decision, then code]**

`src/app/globals.css:1-9` already defines the accent palette, including two
unused-in-practice options that fit the brief without inventing new colors:

```css
--sultan-sun: #e8963a;   /* orange — currently the workhorse accent */
--sultan-plum: #6e1746;  /* deep plum/purple — barely used today */
```

`--sultan-plum` currently only appears in one gradient
(`InquiryForm.module.css:83-88`). `--sultan-sun` is the default accent in 8
files (grep: nav active states, product filter chips/badges, wholesale
kicker, about page kicker, product-card pack badges — see the file list
below). Plan:

1. Confirm with the client which specific pops they want (plum alone, or a
   pink added to the palette too — the PDF says "purple and/or pink").
   If pink is wanted, add one new `--sultan-*` variable next to the existing
   six rather than reusing `--sultan-plum` for two different things.
2. Audit + swap `var(--sultan-sun)` → the chosen accent variable in:
   `products/page.module.css` (filter buttons, active states),
   `products/[id]/page.module.css` (pack selector), `about/page.module.css`
   (kicker), `wholesale/page.module.css` (kicker), `ProductCard.module.css`
   (pack badge), `admin/orders/page.module.css` (leave admin-only styling
   alone — not customer-facing, not in scope).
3. Keep orange as a minor accent (e.g. still used for the sparkling-line
   wash, `--wash-sparkling`) rather than removing it outright — the PDF
   asks to "reduce dominance", not eliminate it; sparkling/still already use
   distinct warm/cool washes as a deliberate line-differentiator
   (`globals.css:29-33`), don't undo that pairing.

This is a find-and-replace-style CSS change, not a redesign — no component
restructuring needed, just which CSS variable each existing rule points to.

Effort: small-medium (mechanical, but needs a design decision first —
recommend a quick swatch/mockup pass before touching every file).

---

## 11 & 12. SEO — local keyword placement + overall brand message

**[code, content]** Metadata is already centralized in `src/lib/seo.ts`
(`pageMetadata()`) and populated per-page from `messages/*.json`'s `meta.*`
block (`messages/en.json:211-227`) — the mechanism is in place, this is a
copy pass, not new plumbing.

Per-page keyword mapping (from the PDF's addendum table), applied to
existing `meta.*` keys:

| Page | `meta.*` key | Already good? | Change |
|---|---|---|---|
| Homepage | `homeTitle`, `homeDescription` | Has "Sultan Mauritius" implicitly via brand name; missing "Sultan drinks Mauritius" phrasing | Add "Sultan Mauritius" explicitly to title; work "Turkish beverages Mauritius" into description |
| Shop | `productsTitle`, `productsDescription` | Already has "sourced from Uludağ, Turkey" and implies Mauritius via delivery line | Front-load "buy Sultan drinks Mauritius" / "sparkling drinks Mauritius" in title |
| About | `aboutTitle`, `aboutDescription` | Generic "Our Story" title has no keywords | Retitle to include "Sultan Mauritius" / "Turkish brand Mauritius" |
| Wholesale | `wholesaleTitle`, `wholesaleDescription` | No "Mauritius" or "wholesale drinks" phrase | Add "wholesale drinks Mauritius" to title/description |
| Stockists | `stockistsTitle`, `stockistsDescription` | Already good — has "Mauritius", close to "where to buy Sultan Mauritius" | Minor: front-load "Where to Buy Sultan in Mauritius" |
| Contact | `contactTitle`, `contactDescription` | No "Mauritius" | Add "Sultan Mauritius" to title |

Also add the "Mauritian Favorites" section (item 3) its own `<h2>` using the
`mauritian favorites` / `popular drinks Mauritius` phrasing verbatim, since
headings carry more SEO weight than body copy.

**Structured data**: not currently implemented (no JSON-LD in `seo.ts` or
any page). The PDF's implementation notes mention "structured data/schema
where appropriate" — lowest-effort win here is `LocalBusiness` schema on the
Stockists page (once real stockist data exists) and `Product` schema on
product detail pages (`products/[id]/page.tsx`), added as a `<script
type="application/ld+json">` in each page — no new dependency needed, plain
JSON serialization is enough for this scale.

**Image alt text**: product images already use descriptive `alt={name}`
(`ProductCard.tsx:51`, `products/[id]/page.tsx:116`) — no change needed
there. Decorative/lifestyle images intentionally use `alt=""` throughout
(hero, origin steps, gallery, social grid) — correct per accessibility best
practice for purely decorative images, leave as-is; don't stuff keywords
into alt text that isn't genuinely describing the image (the PDF explicitly
warns against unnatural keyword stuffing).

**Keyword stuffing guard**: PDF explicitly says avoid it. Each `meta.*`
edit above should read as one natural sentence a person would write, not a
concatenation of the keyword table — the table is a checklist of concepts to
cover across the whole site, not a per-field template.

Effort: small (mostly `messages/*.json` string edits), medium if JSON-LD
structured data is included.

---

## Suggested order of work

1. Copy fixes (items 4, 5, 7-intro, 11/12 meta strings) — no risk, no design
   dependency, ships first.
2. Homepage "Mauritius" lockup (item 1) — small, self-contained.
3. Shop page Units/Packs split + Mauritian Favorites (items 2, 3) — the
   only real structural/layout work, do together since both touch
   `products/page.tsx`.
4. About page "Sultan in Mauritius" section expansion (item 6).
5. Color direction (items 8, 10) — do last, once the client has confirmed
   the plum/pink direction, so items 1-6 aren't re-touched by a later
   palette change.
6. Stockist list population (item 7) — ongoing, business-side, can happen
   in parallel with all of the above via Sanity Studio.

## Out of scope / no action needed

- Contact page (§9): already good per client.
- Wholesale page structure (§8): only the accent color changes, not layout.
- Stockist schema/page code (§7): already matches the brief; only content
  is missing.

## Developer checklist (from the PDF, mapped to sections above)

- [ ] Add "Mauritius" under the Sultan logo — §1
- [ ] Separate Shop products into Units and Packs — §2
- [ ] Add Units / Packs jump buttons on the same page — §2
- [ ] Add a Mauritian Favorites / Most Loved in Mauritius section — §3
- [ ] Clarify Turkey in the About/legacy stat — §4
- [ ] Replace "across the island" with "across Mauritius" — §5
- [ ] Expand the Sultan-in-Mauritius distribution/story section — §6
- [ ] Mention careful glass-bottle handling and 100% Mauritian labor — §6
- [ ] Complete the stockist/client list (business, via Sanity Studio) — §7
- [ ] Reduce orange, add subtle purple/pink accents — §10
- [ ] Increase natural Mauritius-focused SEO wording in `meta.*` — §11/12
- [ ] Keep the site clean, premium, emotional, locally rooted — ongoing tone check, not a single task
