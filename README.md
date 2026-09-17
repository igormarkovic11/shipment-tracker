# Shipment Tracker

A web application for operations teams to track shipments from pickup to delivery and to immediately see what is running late.

Built with **Angular** (frontend), **Node.js + Express** (backend), and **PostgreSQL** via **Prisma ORM**.

---

## Prerequisites

- Node.js 22.x
- PostgreSQL 14+ (running on your machine)
- npm

---

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/igormarkovic11/shipment-tracker.git
cd shipment-tracker
```

### 2. Backend setup

```bash
cd backend
npm install
```

Copy the example environment file and fill in your database credentials:

```bash
cp .env.example .env
```

Open `.env` and set your values:
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/shipment_tracker"


> If your PostgreSQL runs on a non-default port (e.g. 5433), update the port accordingly.

Create the database (if it doesn't exist yet):

```bash
createdb shipment_tracker
```

Or create it manually through pgAdmin.

Run migrations:

```bash
npx prisma migrate dev
```

Seed the database with sample data:

```bash
npx tsx prisma/seed.ts
```

Start the backend server:

```bash
npm start
```

Backend runs on **http://localhost:3000**.

### 3. Frontend setup

```bash
cd ../frontend
npm install
ng serve
```

Frontend runs on **http://localhost:4200**.

> Both backend and frontend must be running at the same time. Use two separate terminal windows.

---

## API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shipments` | List shipments (supports `search`, `status`, `late`, `sortBy`, `order`, `page`, `pageSize`) |
| GET | `/api/shipments/:id` | Shipment detail with full event timeline |
| POST | `/api/shipments` | Create new shipment |
| POST | `/api/shipments/:id/events` | Record a transport event and advance status |
| GET | `/api/customers` | List all customers (used for create form dropdown) |

---

## Decisions

This section documents the choices made where the assignment was deliberately silent, and the trade-offs behind them.

### Q1 — What does it mean for a shipment to be "late"?

"Late" is **computed at query time**, not stored as a field. A shipment is late if `status != 'delivered'` and `promised_date < now()`. For delivered shipments, lateness is computed against the timestamp of the `delivered` event.

Storing a boolean `is_late` would go stale the moment midnight passes, a shipment that was on time yesterday becomes late today without anyone touching it. Computing it on the fly means the answer is always current. The trade-off is that sorting by `daysLate` requires an in-memory pass after the database query (documented under Q5).

Shipments in `lost`, `damaged`, or `refused` status are excluded from the late calculation, they have a more severe problem that deserves its own signal, not to be mixed with delivery delay.

### Q2 — Can a shipment's status move from any state to any other?

No. Status transitions follow a strict linear flow enforced on the server:

confirmed → picked_up → departed → arrived_at_hub → out_for_delivery → delivered


From any active state after `confirmed`, a shipment can also transition to `lost` or `damaged`. From `out_for_delivery` only, it can transition to `refused` (the only moment the customer physically encounters the package).

The transition map lives in `backend/src/utils/transitions.js` and is the single source of truth. The frontend mirrors it only for UX (disabling buttons), the server re-validates every transition and returns `409 Conflict` if the transition is not allowed. Business rules live on the server, not in the UI.

### Q3 — What is a single transport event?

Each status change is recorded as an append-only row in `shipment_events`. The table is the source of truth for history; `shipments.status` is a denormalized cache of the latest status kept for query performance (avoids a JOIN on every list render).

Events optionally carry a `note` field, the reason the event was recorded, tied to that specific moment in transit (e.g. "damaged at Novi Sad hub"). The note belongs to the event, not the shipment, because it describes a specific moment, not the shipment as a whole.

### Q4 — What happens when an event contradicts the current state?

The server rejects it with `409 Conflict` and a message describing the invalid transition (e.g. `"Cannot transition from 'delivered' to 'picked_up'"`). No event is created, no state is changed. The frontend displays the error message inline.

### Q5 — Where would this solution break first?

Two places:

1. **Late sorting and filtering** — because `daysLate` is computed in JavaScript, it cannot be pushed into the SQL `ORDER BY`. When `sortBy=daysLate` or `late=true` is requested, the backend fetches all matching rows, computes late info in memory, sorts/filters, then paginates. This works fine at current scale but would become slow with tens of thousands of shipments. The fix: add a `expected_delivery_date` column with a database index and sort directly in SQL.

2. **Pagination and in-memory late filter interaction** — when filtering by `late=true`, `total` reflects the count after in-memory filtering, not the database count. This is correct but means the database `count()` and the filtered count can diverge, which could surprise a consumer expecting consistent pagination metadata.

---

## What I deliberately left out

- **Authentication / user management** — explicitly out of scope per the assignment.
- **Return flow after delivery** — a customer returning a package after successful delivery is a separate domain concept (reverse logistics). It would be modeled as a separate `Return` entity linked to the original shipment, with its own state machine, rather than forcing a backwards path through `Shipment.status`. This felt out of scope for the initial version; `refused` covers the only in-transit rejection scenario.
- **Customer creation screen** — the assignment allows preloading customers. Seed data covers this; a create screen would be straightforward to add.

---

## What I would do in future

- Fix the Q5 late-sorting bottleneck: replace the in-memory sort with a raw SQL query using `EXTRACT(DAY FROM NOW() - promised_date)` as a computed expression directly in the `ORDER BY` clause, backed by a partial index on active shipments (`WHERE status NOT IN ('delivered', 'lost', 'damaged', 'refused')`). This keeps data real-time while pushing sort and pagination into the database where they belong.
- Return flow (`Return` entity with its own state machine)
- Email or webhook notification when a shipment becomes late
- Customer creation and management screen
- CSV export of the shipment list
- Unit tests
