# StockFlow

A warehouse inventory manager: track products, suppliers, and stock movements, with role-based access for who's allowed to change what.

Node/Express API backed by PostgreSQL, with a plain HTML/CSS/JS frontend served straight out of `public/`.

## Features

**Inventory**
- Products with SKU, price, and description
- Suppliers with contact info
- Stock in/out movements, with a full history log
- Dashboard with total products, total suppliers, and a low-stock alert list (anything below 10 units)

**Accounts & access**
- Three roles:
  - **staff** — view everything, can't create/edit/delete
  - **admin** — full CRUD on products, suppliers, stock movements; can view the user list
  - **super_admin** — everything admin can do, plus the only role that can promote staff to admin or demote admin back to staff
- A super_admin can't demote themselves, and the last remaining super_admin can't be demoted — the system won't let itself get locked out

## Getting started

```bash
npm install
```

Create a Postgres database, then set up your `.env` (a template is already in the repo):

```
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=stockflow
DB_USER=postgres
DB_PASSWORD=yourpassword

JWT_ACCESS_SECRET=some-long-random-string
JWT_ACCESS_EXPIRES_IN=1d

FRONTEND_ORIGIN=http://localhost:5000

RESET_TOKEN_EXPIRES_MIN=30



Load the schema:

```bash
psql -d stockflow -f db/schema.sql
```

(If you're upgrading an existing database instead of starting fresh, run the migrations in `db/migrations/` in order instead of `schema.sql` — they're additive and won't touch your data.)

Create your first login — this seeds a `super_admin` account so you actually have a way in:

```bash
npm run seed
```

By default that creates `admin@stockflow.local` / `ChangeMe123`. Override it with `SUPER_ADMIN_NAME`, `SUPER_ADMIN_EMAIL`, and `SUPER_ADMIN_PASSWORD` env vars if you want something else — **change the password after your first login either way.**

Optionally, throw in some sample products/suppliers/stock movements to play with:

```bash
npm run dummy-data
```

Start it up:

```bash
npm run dev      # with auto-reload
npm start        # without
```

Then open `http://localhost:5000` and log in.

## Project layout

```
controller/   request handlers
model/        SQL queries (pg)
router/       route definitions + who's allowed to hit them
middleware/   auth, validation, rate limiting, error handling
utils/        JWT signing, email sending
db/           schema.sql + migrations
public/       frontend (plain HTML/CSS/JS, no build step)
```

## A note on security

The `.env` in this repo has placeholder/example values (including a database password) committed for convenience in local dev — **do not deploy with these**. Generate a real `JWT_ACCESS_SECRET`, use a real database password, and keep `.env` out of version control in any environment that isn't your own machine.
