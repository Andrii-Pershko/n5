# N5Deal Marketplace Prototype

[Українська](#українська) · [English](#english)

---

## Українська

Take-home прототип M&A-маркетплейсу для ліцензованих фінтех- і банківських активів. Орієнтир — [n5deal.com/all-listing](https://n5deal.com/all-listing), не копія 1:1.

Це продукт **discovery + конфіденційне intro**: buyer дивиться активи, seller дивиться мандати buyer’ів, platform manager може suspend-ити або **остаточно видалити** учасника. Угоду в додатку не закриваємо.

### Стек

| Додаток | Шлях | Стек |
|---|---|---|
| Web | `web/` | Next.js 16, React 19, TypeScript, Tailwind 4, Redux Toolkit, redux-persist |
| API | `api/` | NestJS 11, Prisma 7, **PostgreSQL** (адаптер `@prisma/adapter-pg`), JWT |
| DB | Docker `postgres` | PostgreSQL 16 |

Усе піднімається **однією командою** Compose: **web + api + postgres**. Це і є deployed version для рев’ю — `http://localhost:3301`.

Host-порти — третій стек на VPS: **3301 / 3302 / 3303**. Всередині мережі Compose лишаються 3000 / 4000 / 5432.

### Запуск

```bash
docker compose up --build
```

У фоні (без логів у терміналі): `docker compose up --build -d`

- Web: http://localhost:3301
- API: http://localhost:3302
- Postgres: localhost:3303 (`n5deal` / `n5deal` / db `n5deal`)

На VPS, якщо браузер відкриває не `localhost`, перезберіть з публічним хостом:

```bash
NEXT_PUBLIC_API_URL=http://YOUR_HOST:3302 \
WEB_ORIGIN=http://YOUR_HOST:3301 \
docker compose up --build -d
```

Перший старт робить `prisma migrate deploy` і seed. Повторний старт **не затирає** нових користувачів: seed пропускається, якщо в БД уже є users.

Скинути дані:

```bash
docker compose down -v
docker compose up --build
```

### Демо-акаунти

Пароль для seed-акаунтів: `demo`

| Роль | Email |
|---|---|
| Buyer | `buyer@n5deal.demo` |
| Seller | `seller@n5deal.demo` |
| Manager | `manager@n5deal.demo` |

Є **self-signup** для Buyer і Seller на `/register`. Вхід — `/signin` (форма або демо-роль). Manager через реєстрацію створити не можна.

Рекомендований сценарій рев’ю:

1. Увійти як Buyer → відкрити **ND-612** (Lithuania EMI) → надіслати inquiry. Подивитись smart-match проти збереженого мандата.
2. Увійти як Seller → **Buyers** → фільтри (категорія, юрисдикція, ліцензія, ticket) → зв’язатися з Horizon Capital.
3. Зареєструвати нового buyer/seller і оновити сторінку — сесія на місці.
4. Увійти як Manager → suspend seller → лістинг зникає з публічного каталогу. **Delete** прибирає учасника з БД (активи + inquiries cascade).
5. Перемикач **EN / UK** у хедері; після refresh мова лишається (redux-persist).

### Тести

```bash
cd api && npm test          # Jest: matching, auth signup, admin hard-delete, buyer filters
cd web && npm test          # Vitest: i18n
cd web && npx playwright install chromium && npm run test:e2e
# e2e: E2E_BASE_URL=http://localhost:3301 npm run test:e2e  (Docker web)
```

### Ключові технічні рішення

- **Стек навмисно розділений.** Next.js — UI. NestJS володіє auth, політиками й persistence.
- **Docker Compose** Web, API і PostgreSQL збираються разом; SQLite прибрано.
- **Prisma 7 + PostgreSQL** — реляційна модель з каскадним hard delete. У рантаймі потрібен драйвер-адаптер `PrismaPg`.
- **JWT у Redux persist** — через обмеження завдання («має бути redux + persist» і «стан живе після refresh»). У проді токен був би в httpOnly cookie.
- **Inquiry, не чат.** Контакт — збережене intro з match score. Ім’я seller на публічних картках — `Confidential`.
- **Smart Match детермінований.** Бали: юрисдикція 40 + категорія 25 + ліцензія 20 + ticket 15. Без LLM і API-ключа, покрито тестами в `api/src/matching`.
- **i18n EN/UK** у Redux (`locale` slice), не в URL.

### Припущення

- N5Deal — introducer, не регульований брокер. Немає платежів, NDA-кімнати й KYC.
- Ціни лише в EUR.
- Seed-дані навмисно більші за сторінку (активи, buyers, users, inquiries); списки пагінуються по 10.
- Manager suspend-ить користувача — публічний каталог ховає його опубліковані активи. Hard delete стирає рядок User і залежні записи.
- Self-signup не створює MANAGER.

### Які AI-інструменти використано

- Cursor (Grok 4.6) для скелета split-apps, адаптера Prisma 7, Nest-модулів, Docker і Next/Redux UI.
- Правила matching і валідації лістингу написані звичайним TypeScript, щоб їх можна було рев’юити.

### Що б доробив за більшого часу

- Audit log для manager і NDA-гейт.
- Повніший Playwright на три ролі (suspend → catalog hide).

Фазований скоуп — у `ROADMAP.md`. Правила для агента — у `.cursor/rules/`.

### Авторські права

Тестове завдання для **n5Bank**. Дизайн і розробка: **PershkoAndrii**. Усі права захищено. Див. `LICENSE`.

---

## English

Take-home prototype for an M&A marketplace focused on licensed fintech and banking assets. Inspired by [n5deal.com/all-listing](https://n5deal.com/all-listing), not a 1:1 clone.

This is a **discovery + confidential intro** product: buyers browse assets, sellers browse buyer mandates, a platform manager can suspend or **hard-delete** participants. Deals are not closed in-app.

### Stack

| App | Path | Stack |
|---|---|---|
| Web | `web/` | Next.js 16, React 19, TypeScript, Tailwind 4, Redux Toolkit, redux-persist |
| API | `api/` | NestJS 11, Prisma 7, **PostgreSQL** (`@prisma/adapter-pg`), JWT |
| DB | Docker `postgres` | PostgreSQL 16 |

The deployed version for review is **one command** — Docker Compose: **web + api + postgres** at `http://localhost:3301`.

Host ports are the third stack on the VPS: **3301 / 3302 / 3303**. Inside the Compose network the apps still listen on 3000 / 4000 / 5432.

### Launch

```bash
docker compose up --build
```

Detached (no logs in the terminal): `docker compose up --build -d`

- Web: http://localhost:3301
- API: http://localhost:3302
- Postgres: localhost:3303 (`n5deal` / `n5deal` / db `n5deal`)

On a VPS, if the browser does not use `localhost`, rebuild with the public host:

```bash
NEXT_PUBLIC_API_URL=http://YOUR_HOST:3302 \
WEB_ORIGIN=http://YOUR_HOST:3301 \
docker compose up --build -d
```

First boot runs migrations and the demo seed. Later boots **do not wipe** sign-ups: seed is skipped if users already exist.

Reset:

```bash
docker compose down -v
docker compose up --build
```

### Demo accounts

Password for seeded accounts: `demo`

| Role | Email |
|---|---|
| Buyer | `buyer@n5deal.demo` |
| Seller | `seller@n5deal.demo` |
| Manager | `manager@n5deal.demo` |

**Self-signup** is available for Buyer and Seller at `/register`. Sign-in is `/signin` (form or a demo role). Managers cannot self-register.

Suggested review path:

1. Enter as Buyer → open **ND-612** (Lithuania EMI) → send an inquiry. Note the smart-match score against the saved mandate.
2. Enter as Seller → **Buyers** → filter by category / jurisdiction / licence / ticket → contact Horizon Capital.
3. Register a new buyer or seller and refresh — the session stays (redux-persist).
4. Enter as Manager → suspend the seller → listing disappears from the public catalog. **Delete** removes the participant from Postgres (assets + inquiries cascade).
5. Toggle **EN / UK** in the header; language survives refresh.

### Tests

```bash
cd api && npm test          # Jest: matching, signup, hard-delete, buyer filters
cd web && npm test          # Vitest: i18n
cd web && npx playwright install chromium && npm run test:e2e
# e2e: E2E_BASE_URL=http://localhost:3301 npm run test:e2e  (Docker web)
```

### Key technical decisions

- **Split stack on purpose.** Next.js is the UI. NestJS owns auth, policy, and persistence.
- **Docker Compose is the deploy artefact.** Web, API, and PostgreSQL ship together. SQLite is gone.
- **Prisma 7 + PostgreSQL** for a real relational model with cascading hard delete. Runtime uses the `PrismaPg` driver adapter.
- **JWT in Redux persist** for the assignment constraint (“redux + persist must exist” and “state survives refresh”). For production this token would be an httpOnly cookie.
- **Inquiry, not chat.** Contact is a stored intro with a match score. Seller identity is `Confidential` on public cards.
- **Smart Match is deterministic.** Score = jurisdiction 40 + category 25 + licence 20 + ticket 15. No LLM, no API key, unit-tested in `api/src/matching`.
- **EN/UK i18n** lives in a persisted Redux `locale` slice, not in the URL.

### Assumptions

- N5Deal is an introducer, not a regulated broker. No payments, NDA room, or KYC in this prototype.
- Prices are EUR only.
- Seed data is intentionally larger than one page (assets, buyers, users, inquiries); lists paginate at 10.
- Manager suspends a user; the public catalog then hides that seller’s published assets. Hard delete removes the User row and dependents.
- Self-signup cannot create a MANAGER.

### AI tools used

- Cursor (Grok 4.6) to scaffold the split apps, Prisma 7 adapter setup, Nest modules, Docker, and the Next/Redux UI.
- Matching and listing-validation rules were specified and kept as plain TypeScript so they stay reviewable.

### What I would improve with more time

- Manager audit log and NDA gate before revealing a seller.
- A fuller Playwright path covering suspend → catalog hide.

See `ROADMAP.md` for the phased scope. Agent conventions live in `.cursor/rules/`.

### Copyright

Take-home assignment for **n5Bank**. Designed and developed by **PershkoAndrii**. All rights reserved. See `LICENSE`.

