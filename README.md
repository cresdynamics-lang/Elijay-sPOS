# Elijays POS

Multi-shop point-of-sale for **Elijays** — two stores (dynamic shop list), same product catalog with **per-shop pricing**, inventory, sales checkout, and admin dashboard.

**Default login:** `admin@elijays.co.ke` / `Elijays.Admin1`  
**Cashiers:** `cashier1@elijays.co.ke` / `Cashier123` (Shop One), `cashier2@elijays.co.ke` / `Cashier123` (Shop Two)

## Features

- **POS terminal** (`/pos`) — category browse, cart, cash/M-Pesa/card checkout
- **Per-shop prices** — `shop_product_prices` table; list API uses store price when `shop_id` is set
- **Two shops** seeded by default (add more via Admin → Stores)
- Full admin: inventory, sales, revenue, finance, expenses, users

## Stack

Go (Gin) + PostgreSQL + Next.js

## Quick start

```bash
# Database (uses elijays_pos / elijays:elijays_dev)
make dev-db
make migrate

# API
cd backend && cp .env.example .env && go run ./cmd/server

# Web
cd frontend && npm install && cp .env.local.example .env.local 2>/dev/null || true
echo 'NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1' > frontend/.env.local
npm run dev
```

Open http://localhost:3000 — use **POS** in the sidebar for checkout.

## Project layout

```
pos-elijays/
├── backend/
├── frontend/
├── docker-compose.yml
└── Makefile
```

Forked from Prince Esquire POS with Elijays branding and shop-specific pricing.
