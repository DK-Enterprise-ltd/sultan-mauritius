# Sultan Mauritius — security checklist

Applied from the reusable template at
`~/.claude/rules/ecc/common/security-checklist.md` (itself merged from the
USR Dashboard project's audit and this account's global `security.md`
rules). Ordered most-pressing first.

This is a living checklist, not an incident report — nothing here is a
known active breach.

## How to read this

| Severity | Meaning |
| --- | --- |
| **P0** | Fix before the next commit / any deploy. |
| **P1** | Fix before production / any non-local hosting. |
| **P2** | Fix in the first hardening pass after launch. |
| **P3** | Hardening and defence-in-depth; schedule when convenient. |

Status: `[ ]` open · `[~]` in progress · `[x]` done.

---

## Summary table

| # | Severity | Issue | Primary files |
| --- | --- | --- | --- |
| 1 | **P1** | `next` is on the latest 14.2.x patch, but `npm audit` reports 2 critical + several high CVEs (DoS, cache poisoning, XSS via CSP nonces, RCE on specific configs) only fixed by jumping to Next 16 — a breaking major-version migration | `package.json`, App Router usage throughout |
| 2 | **P1** | `RESEND_API_KEY` missing from local env and not confirmed in production; sender is Resend's shared sandbox domain, which only delivers to the account owner | `src/lib/email.ts`, `.env.example` |
| 3 | ~~**P1**~~ `[x]` | `x-forwarded-for` (client-settable) trusted ahead of Vercel's own trusted `req.ip` for rate-limit keying | `src/middleware.ts` |
| 4 | ~~**P2**~~ `[x]` | Stock decrement has no atomic guard — concurrent orders on the last unit(s) of a product can both succeed, overselling stock | `src/app/actions/orders.ts` |
| 5 | ~~**P2**~~ `[x]` | No `Content-Security-Policy` header | `next.config.mjs`, `src/middleware.ts` |
| 6 | **P3** | No `npm audit` gate in CI | package scripts / CI config (none present yet) |
| 7 | **P3** | Admin session (`ADMIN_SESSION_SECRET`-signed cookie) has no revocation mechanism beyond rotating the secret (which logs out every session at once) | `src/lib/admin-session.ts` |
| 8 | **P3** | CSP `script-src` uses `'unsafe-inline'` rather than a per-request nonce | `src/middleware.ts` |

---

## P1

### 1. Next.js has known critical/high CVEs; latest fix requires a major-version migration

**Where:** `package.json` — `next@14.2.35`, already the newest patch release
on the 14.x line (checked against the npm registry).

**Why it matters:** `npm audit` reports 2 critical and several high-severity
advisories against the installed range, including cache poisoning, multiple
Denial-of-Service vectors in the App Router / Server Actions / Image
Optimization API, an XSS affecting apps using CSP nonces, and RCE advisories
that are scoped to self-hosted deployments (Windows-hosted servers; AVIF
handling in a self-run Image Optimization API) — Sultan runs on Vercel's
managed platform, which reduces exposure to those two specifically, but the
DoS/cache-poisoning/XSS-class advisories aren't host-specific and likely
still apply.

**Fix:**
- [ ] Plan a dedicated Next 15 → 16 migration, not a rushed inline bump.
      Next 15 made `cookies()`/`headers()` **async**, which touches
      `src/lib/auth.ts`, `src/lib/admin-session.ts` (indirectly, via the
      `cookies()` calls in `src/app/actions/admin-auth.ts`), and every
      admin page/action that reads the session cookie — a mechanical but
      repo-wide change that needs a real test pass, not just "the build
      compiles."
- [ ] Run `npx @next/codemod@canary upgrade latest` as a starting point,
      then manually verify every `cookies()`/`headers()` call site.
- [ ] Re-run `npm audit` after upgrading to confirm the advisories clear.
- [ ] Until the migration happens, this is a documented, accepted risk —
      not silently unnoticed.

**Effort:** 0.5–1.5 days depending on how much the codemod handles automatically.

### 2. Email delivery is unconfirmed / likely broken for real recipients

**Where:** `src/lib/email.ts` sends via Resend, `FROM = "Sultan Mauritius <onboarding@resend.dev>"`
(Resend's shared onboarding domain). `.env.example` never listed
`RESEND_API_KEY` at all, and this checkout has no `.env.local`.

**Why it matters:** Resend restricts the shared `onboarding@resend.dev`
sender to delivering only to the account owner's own verified email
address — every other recipient (i.e. every real customer) silently fails.
The send is wrapped in try/catch that only `console.error`s, so on a
serverless host nobody sees the failure unless they go looking at function
logs.

**Fix:**
- [x] Add `RESEND_API_KEY` (and an optional `EMAIL_FROM` override) to
      `.env.example` with explanatory comments.
- [x] Make the `FROM` address configurable via `EMAIL_FROM`, defaulting to
      the sandbox address only when unset, so verifying a domain in Resend
      is a config change, not a code change.
- [x] Skip the network call and log a clear one-time warning when
      `RESEND_API_KEY` is unset, instead of attempting a send that's
      guaranteed to fail.
- [ ] **You still need to, outside this codebase:** confirm
      `RESEND_API_KEY` is set in Vercel's production environment, verify a
      sending domain in the Resend dashboard, and send a real test order
      status email to a non-account-owner address to confirm delivery.

**Effort:** the code-side fix is done; the account-side verification is on you.

---

## P2 — done in this pass

### 3. `x-forwarded-for` trusted ahead of `req.ip`

**Where:** `src/middleware.ts` — `req.headers.get("x-forwarded-for")?.split(",")[0]` was read
before falling back to `req.ip`.

**Why it matters:** `x-forwarded-for` is attacker-settable. On Vercel,
`req.ip` is the platform's own trusted client-IP signal; preferring the
client-settable header first lets an attacker rotate a fake IP on every
request and bypass the per-IP rate limit on login/checkout/contact forms.

**Fix:** `req.ip` is now read first, falling back to `x-forwarded-for`
only when `req.ip` is unavailable (local dev without the Vercel edge).

### 4. Stock decrement race (oversell)

**Where:** `src/app/actions/orders.ts` `createOrder()` — stock was checked
once, then decremented unconditionally inside the transaction.

**Why it matters:** two concurrent orders for the last unit(s) of a
product could both pass the initial check and both decrement, taking
stock negative and overselling.

**Fix:** the decrement is now a conditional `updateMany` guarded by
`stockQuantity: { gte: quantity }`; a zero-row result rolls back the
transaction with a "not enough stock" error instead of allowing it through.

### 5. No CSP header

**Where:** `next.config.mjs` had `X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy`, `Permissions-Policy`, and HSTS, but no `Content-Security-Policy`.

**Fix:** `src/middleware.ts` now sets a CSP on every response, restricted to
`'self'` plus the specific third-party origins actually in use (Fontshare
for fonts, Sanity's CDN for images), with `object-src 'none'` and
`frame-ancestors 'none'`. `script-src` keeps `'unsafe-inline'` rather than a
per-request nonce for now — nonces need to reach both Next's own hydration
scripts and the static JSON-LD tag in `[locale]/layout.tsx`, which means
threading a header through `next-intl`'s own middleware response. That's
not something to get subtly wrong without a live browser to verify
hydration didn't break, so it's flagged below as a P3 follow-up to do
against a running deployment rather than guessed at here.

**Verification done in this pass:** `npm run build` compiles and typechecks
clean with the new middleware. **Not done:** a live browser check of the
CSP header against a running server — this checkout has no local
`DATABASE_URL`, so `npm run start` can't serve any DB-backed page. Before
trusting this in production, load the homepage, a product page, and
`/admin` in a real browser with devtools open and confirm zero CSP
violation messages in the console.

---

## P3 — defence-in-depth, not done in this pass

### 6. No dependency scanning gate

- [ ] Add `npm audit --audit-level=high` to CI, failing the build.
- [ ] Run the `security-reviewer` agent on any PR touching
      `src/app/actions/`, `src/app/api/`, or `src/middleware.ts`.

### 7. Admin session revocation

`src/lib/admin-session.ts` signs a 7-day cookie with `ADMIN_SESSION_SECRET`;
there's no per-session revocation, only "rotate the secret to invalidate
every session at once." Given it's a single shared admin login (not
per-user), this is an acceptable tradeoff — documented here rather than
fixed, so it's a deliberate decision instead of an oversight.

### 8. `script-src` CSP directive is `'unsafe-inline'`, not nonce-based

**Where:** `src/middleware.ts` `buildCsp()`.

**Why it matters:** `'unsafe-inline'` permits any inline `<script>`,
including one an XSS bug might inject. A per-request nonce would close
that gap, but implementing it correctly requires the nonce to reach both
Next's own framework-injected hydration scripts and the static JSON-LD
`<script>` in `src/app/[locale]/layout.tsx` — which means threading a
request header through `next-intl`'s `createMiddleware()` response, a
combination not verified against a live browser in this pass.

**Fix:**
- [ ] Against a running (not just built) deployment: generate a per-request
      nonce in `src/middleware.ts`, thread it into the request headers
      `next-intl`'s middleware sees, read it via `headers()` in both root
      layouts, and set it on the JSON-LD `<script nonce={nonce}>` tag.
- [ ] Confirm in a real browser (not just no build errors) that hydration
      still works and the JSON-LD block still renders, before removing
      `'unsafe-inline'` from `script-src`.

---

## Already in place (don't regress these)

- **AuthN on every admin entry point** — `isAdmin()` checked first in every
  `/admin/*` page and mutating Server Action.
- **Money-path discipline** — `createOrder` re-resolves unit prices from
  the live `Product` row server-side; never trusts client-supplied prices
  (see `CLAUDE.md`).
- **Timing-safe credential compare** — `loginAdmin` uses
  `crypto.timingSafeEqual`, not `===`, for both username and password.
- **HMAC-signed, expiring admin session cookie** with `httpOnly`, `secure`
  in production, `sameSite: lax`, scoped to `/admin`.
- **Rate limiting on every request**, with a tighter bucket for
  POST/server-action/API traffic (`src/middleware.ts`), including the
  admin login path.
- **Input validation** on every public Server Action (`cleanStr`,
  `isValidEmail`) before data touches the DB.
- **No SQL injection surface** — Prisma parameterizes everything; no raw
  queries anywhere in the codebase.
- **Sanity webhook signature verification** via `next-sanity/webhook`
  before any synced content is trusted.
- **Secrets** — `.env*.local` is gitignored; no secrets found hardcoded in
  source.
- **Security headers** already present pre-audit: `nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, HSTS.

## Pre-deploy checklist

- [ ] `RESEND_API_KEY` set in Vercel production env; sending domain
      verified in Resend; test email delivered to a real external inbox.
- [x] Rate limiter backend matches the real deployment topology (single
      Vercel deployment per environment; document the tradeoff if that
      changes).
- [x] Trusted client-IP source (`req.ip`) used ahead of `x-forwarded-for`.
- [x] Security headers live, including CSP.
- [ ] `npm audit` clean at `high`.
