# Open Travel

A travel & tourism SaaS platform connecting **travelers**, **agencies**, and **administrators**.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Firebase** authentication (Google + email) with JWT session cookies
- **Express.js** + **MongoDB** (native `mongodb` driver) backend — no ORM, no SQL
- **Tailwind CSS v4** + **shadcn/ui** (base-nova preset, Base UI)

## Architecture

Two processes talk to each other:

1. **Next.js** (`npm run build` + `npm run start`, port 3000) — the UI. Server
   components and server actions fetch data from the Express API.
2. **Express** (`npm run server`, port 4000) — the backend. Talks straight to
   MongoDB using the native driver. No ORM, no query language, no schemas —
   just JavaScript objects and `db.collection("name").find(...)`.

The Next.js server authenticates the user (Firebase session cookie) and
forwards the verified user id + role to Express via headers. Every API request
must also carry `x-internal-key`, which must equal `INTERNAL_API_KEY` in `.env`
(this is check #2 and bounces anything that isn't our own Next.js server).

## Getting started

```bash
npm install
npm run seed            # reseeds MongoDB (demo users, categories, tours, services, bookings)
npm run server          # starts the Express backend on http://localhost:4000
npm run dev             # http://localhost:3000 (or: npm run build && npm run start)
```

`.env` needs (see `.env.example`):

```bash
DATABASE_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority
AUTH_SECRET=<random base64>
API_URL=http://localhost:4000
INTERNAL_API_KEY=<any long random string>
```

### Google sign-in (Firebase)

The "Continue with Google" button uses Firebase Authentication
(`signInWithPopup`) and then bridges the verified identity into the normal
session via `POST /api/auth/firebase/session`.

1. Create a Firebase project at https://console.firebase.google.com and enable
   the **Google** provider under *Authentication → Sign-in method*.
2. Freeze the web-app config (Project settings → General) into `.env`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456:web:abcd
```

3. Add the service account so the server can verify ID tokens
   (Project settings → **Service accounts** → Generate new private key).
   Put the JSON either as a single-line `FIREBASE_SERVICE_ACCOUNT` in `.env`
   or save it to disk and set `GOOGLE_APPLICATION_CREDENTIALS=/path/to/file.json`.

4. In Google Cloud Console (APIs & Services → Credentials), open the OAuth
   client Firebase created and add `http://localhost:3000` (and your domain)
   to **Authorized JavaScript origins** for the popup to work.

Google sign-ins create a `CUSTOMER` account automatically. Choose **Agency**
in the register form if you want an agency account instead. The button shows
a friendly error if Firebase isn't configured yet.

### Demo accounts

| Role     | Email                    | Password |
| -------- | ------------------------ | -------- |
| Admin    | `admin@opentravel.com`   | password123 |
| Agency   | `agency@opentravel.com`  | password123 |
| Customer | `customer@opentravel.com`| password123 |

The seeded demo accounts are linked to Firebase, so sign in with the matching
email/password in Firebase (or use the Google provider with those emails).

## Roles & routing

| Route                         | Access                                              |
| ----------------------------- | --------------------------------------------------- |
| `/`, `/tours`, `/tours/[slug]`| Public                                              |
| `/login`, `/register`         | Public (signed-in users are bounced to their hub)   |
| `/dashboard/customer`         | `CUSTOMER` users                                    |
| `/dashboard/agency`           | `AGENCY` users                                      |
| `/dashboard/agency/services`  | `AGENCY` users (create/edit/publish/delete services)|
| `/dashboard/admin`            | `ADMIN` users                                       |

Role enforcement lives in `src/proxy.ts` (`src/auth.config.ts#callbacks.authorized`)
and is re-checked inside every dashboard page and Express route (defense in depth).

## Project structure

```
server/
  index.js           # Express app (cors-free, server-to-server only)
  db.js              # MongoDB connection + _id → id serializer
  helpers.js         # input validation + internal-key / role middleware
  routes/            # public, session, agency, customer, admin
  seed.js            # demo data (plain mongodb driver)
src/
  auth.ts            # NextAuth session (JWT, session transport only)
  proxy.ts           # Next.js 16 Proxy — role redirects
  lib/
    api.ts           # server-side client for the Express backend
    constants.ts     # role/status constants
  components/        # UI components + app components (nav, cards, badges)
  app/
    (public)/        # landing, tour browse & detail
    (auth)/          # login / register
    api/auth/        # Firebase session bridge
    dashboard/       # customer / agency / admin dashboards
```

## Backend API (Express)

| Method | Path                        | Access   | Purpose                        |
| ------ | --------------------------- | -------- | ------------------------------ |
| GET    | `/api/health`               | public   | liveness check                 |
| GET    | `/api/home`                 | public   | featured tours + categories    |
| GET    | `/api/tours`                | public   | all published tours            |
| GET    | `/api/tours/:slug`          | public   | tour detail                    |
| POST   | `/api/users/upsert`         | internal | login bridge (find-or-create)  |
| POST   | `/api/users/ensure-profile` | internal | create role profile            |
| GET    | `/api/agency/profile`       | AGENCY   | current agency profile         |
| GET    | `/api/agency/dashboard`     | AGENCY   | agency + services + bookings   |
| GET    | `/api/agency/services`      | AGENCY   | list services (filter by type) |
| GET    | `/api/agency/services/:id`  | AGENCY   | one service (ownership-checked)|
| POST   | `/api/agency/services`      | AGENCY   | create service (always draft)  |
| PUT    | `/api/agency/services/:id`  | AGENCY   | update own service             |
| DELETE | `/api/agency/services/:id`  | AGENCY   | delete own service (no bookings)|
| POST   | `/api/agency/services/:id/publish`   | AGENCY   | publish (needs approval)   |
| POST   | `/api/agency/services/:id/unpublish` | AGENCY   | return to draft             |
| GET    | `/api/customer/dashboard`   | CUSTOMER | customer bookings               |
| GET    | `/api/admin/dashboard`      | ADMIN    | platform stats + moderations    |

Every request other than `/api/health` must include `x-internal-key: <INTERNAL_API_KEY>`;
role-scoped routes also require `x-user-id` and `x-user-role` (set by `src/lib/api.ts`).

## Data model

MongoDB collections created by `npm run seed`:

- `users`, `agencies`, `customer_profiles`
- `categories`, `tours`, `services` (HOTEL | TRANSPORTATION | PACKAGE)
- `bookings`, `payments`, `reviews`

Role/status fields are plain strings constrained by constants in
`src/lib/constants.ts` (e.g. `SERVICE_TYPE`, `AGENCY_APPROVAL_STATUS`).

## Useful scripts

```bash
npm run dev          # Next.js dev server (port 3000)
npm run server       # Express backend (port 4000)
npm run dev:server   # Express backend with auto-restart (node --watch)
npm run build        # production build (Turbopack)
npm run start        # serve production build
npm run lint         # eslint
npm run seed         # reseed MongoDB demo data
```

## Notes for this machine

- `.env` is git-ignored; `.env.example` is committed.
- Start the Express backend first — the Next.js pages call it at request time.
- `npm run dev` is not usable on this machine; use `npm run build` + `npm run start`.