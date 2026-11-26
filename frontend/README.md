# WellTrack frontend

Vite + React 19 + TypeScript, Tailwind v4, shadcn/ui, React Router (data mode), TanStack Query, Zustand.

```bash
npm install
npm run dev      # http://localhost:5173, /api is proxied to the backend on :8000
npm test         # vitest
npm run build    # typecheck + production build
npm run lint
```

- `VITE_DEV_BYPASS_AUTH=true` (set in `.env.development`) skips login checks so the shell can be explored without the backend.
- Design tokens live in `src/styles/globals.css`. They mirror `design/mockups/globals.css`; never write hex values in components.
- `/styleguide` shows every building block in the active theme.
- Routes: `src/app/router.tsx`. Pages: `src/features/<name>/`. Auth forms are shared by the pages and the auth modal.
