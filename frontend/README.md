# gigachat frontend

React + TypeScript + Vite. Tailwind v4 for styling. Vitest for tests.

## Commands

```
npm install
npm run dev      # local dev server
npm run build    # typecheck + production build
npm test         # run tests (watch mode)
```

## Structure — vertically sliced

Code is grouped by *feature*, not by technical type. Each feature folder
owns its own components, types and (later) hooks. Shared plumbing only
moves up to `src/` once a second feature actually needs it.

```
src/
  main.tsx                 entry point
  App.tsx                  THE SEAM — backend wiring lives here (currently stubbed)
  index.css                Tailwind import + global height
  features/
    chat/
      components/          presentational UI — no backend knowledge
      types.ts             the chat view model
      index.ts             the feature's public surface (barrel export)
```

The chat feature is **presentational only**. It receives messages, a typing
flag and an `onSend` callback as props — it never fetches or streams anything.
All backend wiring (queue, SSE, conversation state) belongs in `App.tsx`.
