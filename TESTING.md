# Testing the SDK on a Next.js project

This guide walks through a complete local loop: run clndr.pro locally, wire
up the SDK in a brand-new Next.js app, exercise every public surface, and
verify the database.

---

## 0. Prerequisites

- Node.js 20+
- Docker Desktop (for local Supabase)
- Supabase CLI (`brew install supabase/tap/supabase` or see
  <https://supabase.com/docs/guides/local-development>)
- A Google Cloud project with the Calendar API enabled if you want to test
  Meet link generation (see `apps/clndr-pro/GOOGLE_CALENDAR_SETUP.md`)

---

## 1. Run clndr.pro locally

```bash
cd apps/clndr-pro
cp .env.example .env.local             # fill in Supabase + OAuth values
supabase start
supabase db reset                      # applies all migrations, including the new SDK ones
npm install
npm run dev                            # http://localhost:3000
```

Sign up, then visit **Settings → API Keys**. Create two keys:

- `clndr_sk_...` — **secret**, check all scopes. Copy to a scratch file.
- `clndr_pk_...` — **publishable**. Scopes are auto-limited to
  `booking_pages:read`, `booking_pages:slots`, `bookings:create`.

Create at least one active booking page (e.g. slug `30-min-intro`) so the SDK
has something to call. Note the **slug**.

---

## 2. Build the SDK packages

```bash
cd apps/clndr-sdk
npm install
npm run build --workspace @clndr-pro/sdk --workspace @clndr-pro/react
```

The workspace setup makes `@clndr-pro/sdk` and `@clndr-pro/react` resolvable by any
app inside `apps/clndr-sdk/`. For a project **outside** this repo, see
§ 3a (link) or § 3b (tarball).

---

## 3. Hook the SDK into a Next.js app

### 3a. Inside this repo — use the bundled example

```bash
cd apps/clndr-sdk/examples/nextjs
cp .env.example .env.local
# CLNDR_SECRET_KEY=clndr_sk_...
# NEXT_PUBLIC_CLNDR_PUBLISHABLE_KEY=clndr_pk_...
# NEXT_PUBLIC_CLNDR_BASE_URL=http://localhost:3000
npm run dev -- -p 3001                 # different port from clndr.pro itself
```

Open <http://localhost:3001/book>.

### 3b. In a separate Next.js app — npm link

From a fresh project:

```bash
npx create-next-app@latest my-app --ts --app --no-tailwind
cd my-app

# link the built packages
npm link /path/to/apps/clndr-sdk/packages/sdk \
         /path/to/apps/clndr-sdk/packages/react

# Next.js needs to transpile the linked workspace packages
# (edit next.config.ts)
```

Add to `next.config.ts`:

```ts
const nextConfig = { transpilePackages: ['@clndr-pro/sdk', '@clndr-pro/react'] };
export default nextConfig;
```

Then follow the same env + provider setup as § 3a.

### 3c. Any project — pack tarballs

```bash
cd apps/clndr-sdk/packages/sdk   && npm pack
cd apps/clndr-sdk/packages/react && npm pack
# produces clndr-pro-sdk-0.1.3.tgz and clndr-pro-react-0.1.3.tgz
# install in the target app:
npm i /path/to/clndr-pro-sdk-0.1.3.tgz /path/to/clndr-pro-react-0.1.3.tgz
```

---

## 4. Wire the provider

```tsx
// app/provider.tsx
'use client';
import { ClndrProvider } from '@clndr-pro/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClndrProvider
      publishableKey={process.env.NEXT_PUBLIC_CLNDR_PUBLISHABLE_KEY!}
      baseUrl={process.env.NEXT_PUBLIC_CLNDR_BASE_URL /* omit for prod */}
    >
      {children}
    </ClndrProvider>
  );
}
```

```tsx
// app/layout.tsx
import { Providers } from './provider';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html><body><Providers>{children}</Providers></body></html>;
}
```

---

## 5. Test every surface

### 5.1 `<BookingInline>` — the one-liner

```tsx
// app/book/page.tsx
import { BookingInline } from '@clndr-pro/react';
export default function Page() {
  return <BookingInline slug="30-min-intro" />;
}
```

**Verify:**
- Page renders with title + duration.
- Picking a date loads slots (watch Network tab: `GET /api/v1/booking-pages/30-min-intro/slots?date=...` returns `200`).
- Picking a slot shows the name/email form.
- Submitting creates a booking (watch `POST /api/v1/bookings` → `201`).
- Back in clndr.pro, `/meetings` lists the new booking.

### 5.2 `<BookingModal>` — modal overlay

```tsx
'use client';
import { useState } from 'react';
import { BookingModal } from '@clndr-pro/react';

export default function Page() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Book</button>
      <BookingModal open={open} onOpenChange={setOpen} slug="30-min-intro" />
    </>
  );
}
```

**Verify:** Esc closes, click outside closes, successful booking auto-closes after ~2.5s.

### 5.3 Customization — Shadcn primitives

```tsx
import { BookingForm } from '@clndr-pro/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

<BookingForm
  slug="30-min-intro"
  components={{ Button, Input, Label, Card: Card as any }}
  classNames={{
    root: 'space-y-4',
    slotGrid: 'grid grid-cols-3 gap-2',
    buttonPrimary: 'w-full',
    buttonSecondary: 'w-full',
  }}
/>;
```

**Verify:** visible elements are your Shadcn components; Tailwind classes apply.

### 5.4 Hooks — build your own UI

```tsx
'use client';
import { useBookingPage, useAvailableSlots, useCreateBooking } from '@clndr-pro/react';
import { useState } from 'react';

export default function Custom() {
  const [date, setDate] = useState<Date | null>(null);
  const { data } = useBookingPage('30-min-intro');
  const { slots } = useAvailableSlots('30-min-intro', date);
  const { create, isLoading } = useCreateBooking();
  // ...
}
```

**Verify:** `useBookingPage` resolves, `useAvailableSlots` refetches on date change, `create()` throws a `ClndrError` on validation failure and includes `.status` + `.data`.

### 5.5 Server-side SDK — the admin surface

```ts
// app/api/bookings/route.ts
import { NextResponse } from 'next/server';
import { Clndr } from '@clndr-pro/sdk';

export async function GET() {
  const clndr = new Clndr({
    apiKey: process.env.CLNDR_SECRET_KEY!,
    baseUrl: process.env.CLNDR_BASE_URL /* omit for prod */,
  });
  return NextResponse.json(await clndr.bookings.list());
}
```

**Verify from terminal:**

```bash
curl http://localhost:3001/api/bookings | jq
# and directly:
curl -H "Authorization: Bearer clndr_sk_..." http://localhost:3000/api/v1/bookings | jq
```

### 5.6 Scope enforcement (negative tests)

- Use the **publishable** key to hit `GET /api/v1/bookings` → expect `403` with `"missing required scope(s): bookings:read"`.
- Use any key to POST a booking with a `bookingPageId` you don't own → expect `403`.
- Use a revoked or deleted key → expect `401 Invalid API key`.

### 5.7 Race condition / double booking

Open two terminals:

```bash
BODY='{"bookingPageId":"...","guestName":"A","guestEmail":"a@x.com","startTime":"...","endTime":"..."}'
# Tab 1
curl -X POST -H "Authorization: Bearer $KEY" -H "content-type: application/json" -d "$BODY" http://localhost:3000/api/v1/bookings &
# Tab 2
curl -X POST -H "Authorization: Bearer $KEY" -H "content-type: application/json" -d "$BODY" http://localhost:3000/api/v1/bookings &
```

Exactly one should return `201`; the other returns `400 This time slot is no longer available.`

### 5.8 Google Meet link end-to-end

Preconditions: the booking page has `auto_generate_meet_link = true` and the
owner has connected Google Calendar.

Create a booking via the SDK. In clndr.pro's DB:

```sql
SELECT id, google_meet_link, google_calendar_event_id, google_calendar_id
FROM meetings ORDER BY created_at DESC LIMIT 1;
```

All three columns should be populated. The Meet link should appear in the
guest confirmation email (check the Resend dashboard or your local inbox).

### 5.9 CORS sanity check

From any browser console on a third-party origin:

```js
fetch('http://localhost:3000/api/v1/booking-pages/30-min-intro', {
  headers: { Authorization: 'Bearer clndr_pk_...' }
}).then(r => r.json()).then(console.log);
```

Expect `200` with the booking-page payload and no CORS error.

---

## 6. Troubleshooting

| Symptom                                         | Likely cause / fix                                                                                                                                    |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ClndrError: Missing API key`                   | Provider missing `publishableKey`, or `.env.local` not loaded (restart `next dev`).                                                                   |
| `ClndrError: API key is missing required scope` | You're using a publishable key for an owner-only action. Either use the secret key on the server or add the scope (if it's allowed on the key type). |
| `TypeError: useClndr must be used inside <ClndrProvider>` | Component rendered server-side; add `'use client'` to the page/component. |
| CORS error in the browser                       | Base URL is incorrect (pointing to a different origin than you're calling). Check `NEXT_PUBLIC_CLNDR_BASE_URL`.                                       |
| Slot list empty                                 | Owner has no availability set, or the date is outside `max_days_ahead`.                                                                               |
| "Google Calendar not connected"                 | Owner hasn't OAuth'd. Visit `/calendar` in clndr.pro, click the connect banner.                                                                       |
