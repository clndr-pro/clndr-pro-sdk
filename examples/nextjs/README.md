# clndr-sdk Next.js example

```bash
cp .env.example .env.local  # fill in keys
cd ../..                    # back to the workspace root
npm install
npm run build -w @clndr/sdk -w @clndr/react
cd examples/nextjs
npm run dev
```

- `/book` — guest-facing booking page rendered by `<BookingInline>` using
  the **publishable** key from the `ClndrProvider`.
- `/api/bookings` — server-side route that lists the owner's bookings using
  the **secret** key.
