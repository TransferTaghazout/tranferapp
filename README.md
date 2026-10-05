# Atlas Coast Travel — Tourist Reservation & Finance

Mobile-first operations app for airport transfers, activities and tours. PostgreSQL is the database. All reads and writes happen on the server.

## Environment

Copy `.env.example` to `.env.local`. Admin login is `ahmadabidar` / `Taghazout@1998`.

On EasyPanel, do **not** use Postgres Internal Hostname. Copy the Postgres **External host/IP** and port, then set:

```env
DATABASE_URL=postgres://ahmad:ahmad123@EXTERNAL_IP:PORT/transferapp?sslmode=disable
```

Tables (`drivers`, `reservations`, `customers`, `services`, `settings`) are created automatically on first successful connection. You can also tap **More → Prepare database**.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

## Production (EasyPanel)

1. Push this repo to GitHub.
2. Set `DATABASE_URL` on the **app** service (External IP + port).
3. Redeploy. Health check: `/api/health`.
