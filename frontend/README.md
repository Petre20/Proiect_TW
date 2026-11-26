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

## API layer

`src/lib/http.ts` is the only place that talks to the network: an axios instance (`/api`, cookies, the
`X-Requested-With` header) whose errors are always `ApiError` (`status`, `message`, `fieldErrors` from 422 responses).
A 401 outside the session probes opens the "session expired" modal.

Each feature owns its calls in four files:

| File | Holds | Example |
|---|---|---|
| `types.ts` | request and response shapes, matching the backend schemas | `Habit`, `HabitInput` |
| `api.ts` | plain async functions, no React | `habitsApi.list(params, signal)` |
| `queries.ts` | a key factory and `queryOptions` | `habitKeys.list(params)`, `habitsQuery(params)` |
| `mutations.ts` | `useMutation` hooks that update or invalidate the cache | `useCreateHabit()` |

- Components never import `http` or `api.ts`; they use `useQuery(habitsQuery(...))` or a mutation hook.
- Keys are built only through the factory (`habitKeys.all` → `lists()` → `list(params)` → `detail(id)`), so
  `invalidateQueries({ queryKey: habitKeys.lists() })` hits exactly the right entries.
- `queryOptions` objects work in components, in route guards (`ensureQueryData`) and in prefetching.
- When a mutation affects another feature (ticking a habit moves goals and the dashboard), invalidate that feature's
  keys in the mutation's `onSuccess`.

`features/auth` is the reference implementation.
