# Shopify Data Ingestion

A **Node.js + Express** backend with a **React/Vite** dashboard for ingesting Shopify data (Customers, Products, Orders, Carts, Checkouts) into a **multi-tenant PostgreSQL** database via **Prisma ORM**.

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 13
- (Optional) Redis (Upstash or local)
- A Shopify store + API credentials

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/shopify-data-ingestion.git
   cd shopify-data-ingestion
   ```

2. **Install dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` in backend and frontend.
   - Fill in `DATABASE_URL`, `REDIS_URL` (optional), `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `WEBHOOK_SECRET`.

4. **Run database migrations:**
   ```bash
   cd backend
   npx prisma migrate dev
   ```

5. **Start the backend and frontend:**
   ```bash
   # Backend
   cd backend
   npm run dev

   # Frontend
   cd ../frontend
   npm run dev
   ```

6. **Expose a public URL for Shopify webhooks:**
   Use [ngrok](https://ngrok.com/) or deploy to Render/Vercel.

---

## 🗺️ Architecture Diagram

```
Shopify Webhooks (Customers, Products, Orders, Carts, Checkouts)
          |
          v
   Express Backend (HMAC verification, tenant resolution)
          |
          v
      Prisma ORM
          |
          v
  PostgreSQL Database
          |
          v
  Redis (cache/rate limits)

Frontend (React + Vite) <----> API Endpoints (customers, products, orders, insights)
```

---

## 🔗 API Endpoints

| Type        | Endpoint                         | Description |
|-------------|----------------------------------|-------------|
| **Webhooks** | POST /webhooks/customers         | Handle customer events |
|             | POST /webhooks/products          | Handle product events |
|             | POST /webhooks/orders            | Handle order events |
|             | POST /webhooks/carts             | Handle cart events |
|             | POST /webhooks/checkouts         | Handle checkout events |
| **Bulk Ingestion** | POST /ingest/customers     | Bulk insert/upsert customers |
|             | POST /ingest/products            | Bulk insert/upsert products |
|             | POST /ingest/orders              | Bulk insert/upsert orders |
| **Tenant Management** | POST /tenants/register  | Register new tenant |
|             | POST /tenants/login              | Tenant login (JWT) |
| **Dashboard APIs** | GET /api/customers         | List customers |
|             | GET /api/products                | List products |
|             | GET /api/orders                  | List orders |
|             | GET /api/insights                | Revenue, top customers |

---

## 🗄️ Database Schema (Prisma Models)

| Model     | Key Fields                             | Notes |
|-----------|----------------------------------------|-------|
| tenants   | id, store_url, webhook_secret, email, name | Metadata per tenant |
| customers | id, tenant_id, shopify_id, name, email | Customers per tenant |
| products  | id, tenant_id, shopify_id, title, price | Products per tenant |
| orders    | id, tenant_id, shopify_id, status, total_price | Orders per tenant |
| carts     | id, tenant_id, shopify_id, status      | Cart lifecycle |
| checkouts | id, tenant_id, shopify_id, status      | Checkout lifecycle |

---

## ⚠️ Known Limitations & Assumptions

### Multi-Tenancy
- Tenant isolation via `tenant_id` column (simpler but less scalable than schema-per-tenant).
- Prototype assumes a limited number of tenants.

### Shopify Integration
- Ingests Customers, Orders, Products, Carts, and Checkouts only.
- Bulk ingestion via Shopify APIs not implemented.
- Assumes webhook delivery is reliable (no retry/backoff yet).

### Authentication
- Basic email/password authentication.
- No role-based access control (RBAC) or OAuth.

### Data Quality & Sync
- Shopify is the source of truth.
- No manual resync APIs for missed events.

### Cron Jobs / Scheduling
- Uses `node-cron` for abandoned cart/checkout detection.
- Cutoff time fixed (5 minutes) and not configurable per tenant.

### Dashboard / Insights
- Displays totals and top 5 customers.
- Limited date filtering.
- No advanced analytics (e.g., CLV, segmentation).

### Deployment
- Runs on Render/Vercel free tier (for demos).
- No CI/CD pipelines.
- Environment variables stored in `.env` files.

### Monitoring & Logging
- Only basic console logging.
- No centralized monitoring or alerting.

---

## 📌 Roadmap

- Add webhook retry & queue (RabbitMQ/Kafka).
- Improve tenant isolation (schema-per-tenant or DB-per-tenant).
- Add full sync jobs to handle missed events.
- Harden security (RBAC, secret storage).
- Add monitoring, alerts, and CI/CD.


---

MIT License © 2025
