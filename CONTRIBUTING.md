# Contributing

## Dev setup

```bash
npm install
npm run build --workspace @clndr/sdk --workspace @clndr/react
npm run typecheck
```

## Running the example

```bash
cd examples/nextjs
cp .env.example .env.local   # fill in keys
npm run dev
```

## Releasing

1. Bump versions in `packages/sdk/package.json` and `packages/react/package.json`
   (keep them in sync; `@clndr/react` depends on a specific `@clndr/sdk` version).
2. `git tag v0.X.Y && git push --tags`
3. The `Publish` workflow runs `npm publish --access public --provenance`.
