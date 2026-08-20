# N5Deal Marketplace Prototype — Roadmap

Product frame: this is a **discovery + intro** marketplace for licensed fintech / M&A assets. It is not a payments, KYC, or closing system.

Stack (locked):

- `web/` — Next.js 16 + TypeScript + Tailwind 4 + Redux Toolkit + redux-persist
- `api/` — NestJS 11 + Prisma 7 + **PostgreSQL**
- Deploy artefact — `docker compose` (web + api + postgres)

---

## Phase 0 — Foundation (done in this repo)

- [x] Split apps: `web/` and `api/`
- [x] Cursor rules so agents do not wander (`/.cursor/rules`)
- [x] Prisma schema: User, BuyerProfile, Asset, Inquiry
- [x] Nest modules: auth, assets, buyers, inquiries, admin
- [x] Redux persist: session + catalog filters + buyer desk filters + locale
- [x] Seeded demo users and N5Deal-like assets
- [x] Rule-based Smart Match (no LLM)
- [x] PostgreSQL instead of SQLite (`PrismaPg` adapter)
- [x] Docker Compose: web + api + postgres

---

## Phase 1 — Core demo flows (must work)

Happy path the reviewer should click:

1. Enter as **Buyer** → set/keep mandate → filter listings → open UK SEMI asset → **Inquire**
2. Enter as **Seller** → publish or view listing → browse buyers with filters → **Contact**
3. Enter as **Manager** → search users/assets → **Suspend** or **Delete** seller → listing disappears from catalog
4. Refresh the browser — session, filters, language, and data are still there

Status:

- [x] Demo login (three roles, password `demo`)
- [x] Self-signup (Buyer / Seller only)
- [x] Public listings + filters + detail
- [x] Buyer profile (investment mandate)
- [x] Seller publish asset
- [x] Seller buyer desk with structured search (q, category, country, licence, ticket)
- [x] Inquiry thread (not a chat)
- [x] Manager suspend/restore
- [x] Manager hard delete (cascade assets + inquiries)
- [x] Pagination (10 per page) on listings, buyers, inbox, admin lists

---

## Phase 2 — Product quality (huge plus)

- [x] Seller hidden on public cards (`Confidential`)
- [x] Match score + reasons on listings when buyer has a mandate
- [x] Smart listing warnings (jurisdiction / license / ticket sanity)
- [x] Visual language close to n5deal.com (light UI, blue/green/purple accents, Asset ID, Validated, TOP DEAL)
- [x] README with decisions, assumptions, AI usage, would-improve
- [x] Docker deployed version (localhost after `docker compose up`)

---

## Phase 3 — Plus items

- [x] EN/UK i18n (persisted locale)
- [x] Automated tests beyond matching (auth signup, hard delete, buyer filters, i18n, Playwright smoke)
- [x] Swap SQLite → Postgres
- [x] Public cloud host of the same Compose (Railway / Fly / VPS)

Still optional:

- [ ] Audit log for manager actions
- [ ] NDA gate before revealing seller identity

---

## Explicitly out of scope

Do not start these unless the assignment scope changes:

- Real payments / deal closing
- KYC / KYB
- Data rooms
- Websocket chat
- NextAuth / OAuth
- LLM matching that requires an API key
- Pixel-perfect clone of n5deal.com
