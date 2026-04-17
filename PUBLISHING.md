# Publishing & deployment

Two separate pipelines:

1. **The SDK packages** (`@clndr-pro/sdk`, `@clndr-pro/react`) → GitHub + npm.
2. **The clndr.pro app itself** → a public URL so the SDK has an API to call.

---

## 1. Push the SDK to GitHub (`clndr-pro` org)

### 1.1 Create the repo on GitHub

On <https://github.com/organizations/clndr-pro/repositories/new>:

- **Name:** `clndr-sdk`
- **Visibility:** Public
- **Initialize:** nothing — don't add a README/license/gitignore (we already
  have them).

### 1.2 Push

From inside `apps/clndr-sdk/`:

```bash
git init
git add .
git commit -m "Initial commit — @clndr-pro/sdk and @clndr-pro/react v0.1.0"
git branch -M main
git remote add origin git@github.com:clndr-pro/clndr-sdk.git
git push -u origin main
```

### 1.3 Enable CI

The workflow at `.github/workflows/ci.yml` runs on every push — it will
appear under the repo's **Actions** tab once you push. No config needed.

### 1.4 Repo settings

On the repo's **Settings → General**:

- Description: `Official TypeScript SDK and React components for clndr.pro`
- Website: <https://clndr.pro>
- Topics: `scheduling`, `calendar`, `booking`, `react`, `sdk`, `shadcn`

On **Settings → Code security and analysis**: enable Dependabot alerts +
security updates.

---

## 2. Publish to npm (scoped `@clndr-pro/*`)

### 2.1 Claim the scope

```bash
npm login
# If @clndr-pro doesn't exist yet, creating the first public scoped package
# auto-creates it under your user scope. If you want it owned by an npm
# organization, first:
#   https://www.npmjs.com/org/create → create "clndr-pro" organization
# then add yourself / collaborators.
```

### 2.2 Manual publish (first release)

```bash
cd apps/clndr-sdk
npm ci
npm run build --workspace @clndr-pro/sdk --workspace @clndr-pro/react
npm publish --workspace @clndr-pro/sdk  --access public
npm publish --workspace @clndr-pro/react --access public
```

Verify:

- <https://www.npmjs.com/package/@clndr-pro/sdk>
- <https://www.npmjs.com/package/@clndr-pro/react>

### 2.3 Automated publish (subsequent releases)

The `.github/workflows/publish.yml` workflow publishes both packages when a
tag matching `v*` is pushed.

Set up once:

1. On <https://www.npmjs.com/settings/~/tokens> create an **Automation**
   token with publish access to the `@clndr-pro` scope.
2. On the GitHub repo: **Settings → Secrets and variables → Actions → New
   repository secret** → `NPM_TOKEN = <the token>`.
3. Enable **Settings → Actions → General → Workflow permissions → Read and
   write permissions** (needed for provenance id-token).

Release flow:

```bash
# bump both package versions in packages/*/package.json (keep them in sync)
git commit -am "Release v0.2.0"
git tag v0.2.0
git push && git push --tags
# GitHub Actions runs publish.yml automatically
```

Both packages publish with **npm provenance**, so `npmjs.com` shows a
verified badge linking back to the GitHub Actions run.

### 2.4 Deprecating a bad release

```bash
npm deprecate @clndr-pro/sdk@0.1.1 "Use 0.1.2 or later"
```

Never `unpublish` 24h+ after release — it breaks everyone who installed it.

---

## 3. Deploy the clndr.pro API

The SDK talks to the clndr.pro Next.js app. Until that's deployed to a
public URL, consumers can't use the default `baseUrl`.

### 3.1 Vercel (recommended, since it's a Next.js 16 app)

From `apps/clndr-pro/`:

```bash
npx vercel link        # link to a new or existing project
npx vercel env add     # one by one — or paste via dashboard
npx vercel --prod
```

Required env vars on Vercel (matches `apps/clndr-pro/GOOGLE_CALENDAR_SETUP.md`):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET
OAUTH_STATE_SECRET           # openssl rand -base64 32
NEXT_PUBLIC_SITE_URL         # https://clndr.pro
RESEND_API_KEY
RESEND_FROM_EMAIL
UPSTASH_REDIS_REST_URL       # optional in dev, recommended in prod
UPSTASH_REDIS_REST_TOKEN
```

Point Supabase at your hosted project — local Supabase is fine for dev but
not for a deployed app.

### 3.2 Custom domain

Add `clndr.pro` as a custom domain in Vercel → Settings → Domains. Update
DNS (A/CNAME records per Vercel's instructions).

Once the domain resolves:

- Update Google Cloud OAuth **Authorized redirect URIs** to include
  `https://clndr.pro/api/calendar/import/google/callback` and the Supabase
  `https://<project-ref>.supabase.co/auth/v1/callback`.
- Update Supabase **Authentication → URL Configuration → Site URL** to
  `https://clndr.pro`.

### 3.3 Verify the deployed API from the SDK

```bash
curl -H "Authorization: Bearer clndr_sk_..." https://clndr.pro/api/v1/booking-pages | jq
```

With no `baseUrl` override, the SDK now talks to production out of the box:

```ts
const clndr = new Clndr(process.env.CLNDR_SECRET_KEY!);
// → hits https://clndr.pro by default
```

### 3.4 Self-host users

Anyone running their own fork passes `baseUrl` explicitly:

```ts
new Clndr({ apiKey: '...', baseUrl: 'https://bookings.myco.com' });
```

and in React:

```tsx
<ClndrProvider publishableKey="..." baseUrl="https://bookings.myco.com">
```

---

## 4. Version + docs site (optional)

- **Versioning tool:** consider [Changesets](https://github.com/changesets/changesets)
  once multiple people are cutting releases. For now, hand-bumping two
  `package.json`s is fine.
- **Docs site:** the current README is enough for v0. For a dedicated docs
  site, [Nextra](https://nextra.site) or [Mintlify](https://mintlify.com)
  both work well and can live in a `docs/` folder or a separate repo.

---

## 5. Post-launch checklist

- [ ] npm pages show READMEs and the GitHub repo link.
- [ ] `npm i @clndr-pro/react` in a fresh Next.js app resolves both packages.
- [ ] GitHub Actions CI is green on `main`.
- [ ] Publish workflow ran successfully on the first `v0.1.0` tag.
- [ ] A booking created via the deployed API appears in the production
      Supabase `meetings` table.
- [ ] Google Meet end-to-end works against the deployed app.
- [ ] CORS preflight + GET from a third-party origin succeeds with a
      publishable key.
