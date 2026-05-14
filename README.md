# KKSM Backend

Express + TypeScript REST API for Kovai Kongu Matrimony. Deployed on Vercel as a serverless function.

## Prerequisites

- Node 18
- PostgreSQL database
- AWS S3 bucket (`decenteralized-fiver-web3`, region `ap-southeast-2`)
- Firebase project (Admin SDK credentials JSON)
- Mailgun account

## Setup

```bash
npm install
cp .env.example .env   # fill in values — see Environment section
npx prisma migrate dev
npm run dev            # http://localhost:3010
```

## Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | nodemon dev server on port 3010 |
| `npm run build` | `prisma generate && tsc` → `dist/` |
| `npm run astart` | Run built output (`node dist/index.js`) |
| `npm test` | Vitest smoke tests (send-request → accept → phone-number flow) |
| `npm run lint` | ESLint on `src/` |
| `npm run debug` | Dev server with `DEBUG=express:*` |

## Prisma

```bash
npx prisma migrate dev        # apply / create migrations
npx prisma generate           # regenerate client after schema edits
npx prisma studio             # DB browser
npx ts-node prisma/seed.ts    # seed 25 fake profiles (Faker)
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `ACCESS_KEY_ID` | AWS IAM key for S3 |
| `SECRET_ACCESS_KEY` | AWS IAM secret for S3 |
| `MAILGUN_API_KEY` | Mailgun API key |
| `MAILGUN_DOMAIN` | Mailgun sending domain |
| `NODE_ENV` | `development` or `production` |
| `JWT_ACCESS_SECRET` | Legacy — not actively used |
| `JWT_REFRESH_SECRET` | Legacy — not actively used |
| `FIREBASE_ADMIN_CREDENTIALS` | Base64-encoded Firebase Admin SDK JSON (production only) |

In development, Firebase Admin credentials are read from `kksm05-firebase-adminsdk-*.json` in the project root.

## Architecture

### Auth
Auth is Firebase phone-number OTP — not the JWT/bcrypt code in the files (that is legacy, do not extend it).

1. Frontend does OTP via `signInWithPhoneNumber` → gets Firebase ID token.
2. Every request carries `Authorization: Bearer <firebase-id-token>`.
3. `authenticateToken` middleware calls `admin.auth().verifyIdToken()` → sets `req.user`.
4. After profile save, backend sets Firebase custom claims (`isRegistered`, `isProfileCompleted`) via `setUserClaims`.

### Request flow

```
route → validateRequest(zod) → authenticateToken → controller → service → prisma
```

Routers: `/api/v1/user`, `/api/v1/profile`. Search lives at `POST /api/v1/profile/regularsearch`.

### Identity model

`User.id` = Firebase UID (string). `Profile` has its own autoincrement int `id`. All contacts, shortlists, and notifications reference `Profile.id`, not `User.id`.

Most controllers: Firebase UID from `req.user.userId` → `getProfileByUserId(uid)` → int `Profile.id` → pass to services.

### Core relations (schema.prisma)

- `Contact` — directional request: `requested_by` / `requested_to` (Profile ids), `is_accepted`, `is_declined`, unique pair constraint.
- `Shortlist` — one profile bookmarks another.
- `Notification` — created in the same transaction as the action that triggered it.
- Phone numbers only returned by `postPhoneNumberService` if an accepted `Contact` row exists between the two profiles.

### Images

Client calls `GET /api/v1/profile/presignedurl?image=N` → backend returns a presigned S3 PUT URL and writes the key into `Profile.image_N` → client PUTs file directly to S3. Images served via CloudFront.

## Tests

```bash
npm test
```

Vitest, no DB required. Prisma and AWS SDK are mocked. Setup file (`src/__tests__/setup.ts`) sets dummy AWS env vars so the module-level credential check in `profileService.ts` passes.

Mock strategy: `vi.hoisted` for the Prisma mock (so it's available inside `vi.mock` factory), class mock for `S3Client`.

Covered: `postSendRequestService`, `postAcceptRequestService`, `postPhoneNumberService` (authorized + unauthorized paths).
