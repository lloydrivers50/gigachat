# gigachat backend

Node + TypeScript + Express. Organised as **vertical slices**: each feature
owns a folder under `src/features/<feature>/` and exposes its router through
an `index.ts` public surface. Slices are wired together in `src/app.ts` —
nothing reaches across a slice boundary.

## Run

```
npm install
npm run dev      # tsx watch — http://localhost:3000
```

`GET /health` → `{ "status": "ok" }`

## Layout

```
src/
  server.ts              bootstrap — build the app, start listening
  app.ts                 the Express app — mounts every feature router
  features/
    health/              first slice
      health.routes.ts   the route
      index.ts           public surface — import the slice from here
```

New feature → new folder under `features/`, new line in `app.ts`.
