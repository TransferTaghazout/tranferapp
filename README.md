# Atlas Coast Travel — Tourist Reservation & Finance

A mobile-first operations app for airport transfers, private transfers, activities, and tours. **Google Sheets is the database.** All reads and writes happen on the server. Credentials never go to the browser.

## 1. Project structure

```text
src/
  app/
    (app)/                 Authenticated screens
      page.tsx             Today dashboard
      calendar/            Monthly calendar + day list
      reservations/        List, create, details, edit
      finance/             Period totals + service breakdown
      services/            Catalog with default price/cost
      customers/           Guest history
      search/              Global search
      more/                Settings, Sheets setup, demo seed
    actions/               Server actions (Sheets + auth)
    login/                 Admin login
    manifest.ts            PWA manifest
  components/
    layout/                Bottom nav, side nav, FAB
    reservations/          Cards, form, table, actions
    calendar/
    services/
    setup/
    ui/                    shadcn-style primitives
  lib/
    sheets/                Google Sheets service layer
    types.ts
    validations.ts         Zod schemas
    money.ts               Single profit = price - cost
    dates.ts               Africa/Casablanca helpers
    auth.ts
  middleware.ts            Session gate
scripts/
  setup-sheets.ts          Create tabs + headers
  seed-demo.ts             DEMO-tagged sample bookings
```

## 2. Google Sheets setup

1. Open [Google Sheets](https://sheets.google.com) and create a spreadsheet named **Tourism Reservation Manager**.
2. Copy the spreadsheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
3. Share the spreadsheet with the service-account email as **Editor**.
4. After the app is running and you are signed in, open **More → Prepare Google Sheets tabs**.  
   That creates these tabs if they are missing:

| Tab | Purpose |
| --- | --- |
| Reservations | Bookings (source of truth for Today, Calendar, Finance) |
| Services | Catalog + default price/cost |
| Customers | Auto-updated guest history |
| Finance | Ledger row per reservation |
| Settings | Business name, MAD, Africa/Casablanca, WhatsApp code |

You can also run:

```bash
npm run setup-sheets
```

## 3. Google Cloud API setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Enable **Google Sheets API**.
4. Open **IAM & Admin → Service Accounts**.
5. Create a service account (no console login needed).
6. Open the account → **Keys → Add key → JSON**.
7. From the JSON file, copy:
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → `GOOGLE_PRIVATE_KEY` (keep the `\n` characters)
8. Share the spreadsheet with that `client_email`.

Never put the JSON file in `public/` or commit it.

## 4. Environment variables

Copy `.env.example` to `.env.local`:

```env
ADMIN_EMAIL=admin@atlascoast.travel
ADMIN_PASSWORD=change-this-password
AUTH_SECRET=replace-with-a-long-random-secret

GOOGLE_SHEETS_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=

ALLOW_DEMO_SEED=true
```

| Variable | Used for |
| --- | --- |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Dashboard login |
| `AUTH_SECRET` | Signed httpOnly session cookie |
| `GOOGLE_SHEETS_ID` | Target spreadsheet |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Server-side Sheets auth |
| `GOOGLE_PRIVATE_KEY` | Server-side Sheets auth |
| `ALLOW_DEMO_SEED` | Allow DEMO rows (`false` in production if you want) |

`GOOGLE_PRIVATE_KEY` can stay on one line with escaped newlines:

```env
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

## 5. Local development

Requires Node.js 20.9+.

```bash
npm install
cp .env.example .env.local
# fill in auth + Sheets values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in, then:

1. **More → Prepare Google Sheets tabs**
2. **More → Load demo reservations** (optional, tagged `DEMO`)

```bash
npm run setup-sheets
npm run seed
```

Default timezone is **Africa/Casablanca**. Currency displays as **DH** (MAD).

## 6. Production deployment (Vercel)

1. Push the repo to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. Add every environment variable from `.env.local` (including the full private key).
4. Deploy.
5. Open the live URL, sign in, prepare the Sheets tabs, then add the site to the phone home screen (Share → Add to Home Screen).

The app is a PWA: standalone display, theme color, icons, and a service worker.

Use a long random `AUTH_SECRET` in production. Do not reuse the demo password.

## 7. Testing checklist

- [ ] Login rejects a wrong password
- [ ] Unauthenticated visits redirect to `/login`
- [ ] Prepare Sheets creates the five tabs
- [ ] Demo seed writes rows with `Booking Source = DEMO`
- [ ] **+ New Reservation** saves to Google Sheets
- [ ] Selecting a service fills price, cost, and description
- [ ] Profit = Price − Cost (empty cost treated as 0)
- [ ] Today shows only today’s services, sorted by time
- [ ] Calendar shows a green dot on booked dates
- [ ] Tapping a date lists that day’s bookings + totals
- [ ] Reservations search/filters (Today, Tomorrow, Week, Month)
- [ ] Edit, mark completed, cancel, delete (with confirm)
- [ ] WhatsApp and Call deep links open the guest number
- [ ] Repeat phone number shows customer history
- [ ] Finance today / week / month / custom range
- [ ] Finance by type and by service
- [ ] Services page adds a catalog item used by the form
- [ ] Settings persist in the Settings tab
- [ ] Missing Sheets credentials show a friendly banner
- [ ] Mobile 375–414, tablet 768, desktop 1024+ with no horizontal scroll
- [ ] Add to Home Screen works on iPhone/Android

## Field workflow

```text
Open app → Today → tap + → Date / Time / Service / Guest / Price / Cost
→ Save → Google Sheets updates → profit calculated
→ booking appears on Today → calendar dot → finance totals
```
