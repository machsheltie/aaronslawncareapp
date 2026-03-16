# Aaron's Lawn Care - AI Coding Instructions

## Project Overview
Single-tenant PWA for lawn care business management. React 18 + Vite + TypeScript, Supabase backend, offline-first design, Stripe payments. Uses BMAD framework for AI-assisted development.

**Key Architecture:**
- Frontend: React Router v6, TanStack Query v5 (server state), Zustand (client state)
- Backend: Supabase (Postgres + Auth + Realtime + Storage)
- PWA: vite-plugin-pwa, Workbox, Dexie.js for offline storage
- Validation: Zod schemas for all external data
- Payments: Stripe Elements + Financial Connections (ACH support)

## Critical Patterns

### State Management
- **Server State:** TanStack Query with typed generics
  ```typescript
  const { data } = useQuery<Job[]>({ queryKey: ['jobs'], queryFn: fetchJobs })
  ```
- **Client State:** Zustand stores (auth, UI, offline queue)
- **Offline Queue:** Discriminated unions for actions
  ```typescript
  type QueueAction = { type: 'CREATE_JOB'; payload: JobInsert } | ...
  ```

### Data Validation
- **Zod Required:** Validate ALL API responses and user input
  ```typescript
  const CustomerSchema = z.object({ name: z.string().min(1), email: z.string().email() })
  const validated = CustomerSchema.parse(data)
  ```

### Supabase Integration
- **Type Generation:** Regenerate after schema changes
  ```bash
  npx supabase gen types typescript --project-id <ref> > src/types/supabase.ts
  ```
- **RLS Policies:** Staff vs customer portal access
- **Async/Await Only:** No .then() chains

### Offline-First Design
- **Queue Sync:** Background upload on reconnect
- **Geofencing:** GPS verification for job start/finish
- **Photo Compression:** WebP ~500KB before upload

### Development Workflow
- **Build:** `npm run build` (TypeScript + Vite)
- **Dev Server:** `npm run dev` (HMR enabled)
- **PWA Test:** Install on Android device for offline testing
- **Schema Changes:** Update Supabase, regenerate types, test RLS

## Key Files
- [PRD.md](PRD.md) - Product requirements and user personas
- [Technical_Spec.md](Technical_Spec.md) - Architecture and tech stack
- [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) - Development phases
- [_bmad-output/project-context.md](_bmad-output/project-context.md) - Detailed AI rules
- [src/App.tsx](src/App.tsx) - Main app structure
- [package.json](package.json) - Dependencies and scripts

## Conventions
- **Path Aliases:** `@/components`, `@/hooks`, `@/lib`
- **Strict TypeScript:** No implicit any, strict null checks
- **Component Structure:** Feature-based folders under `src/components`
- **Error Handling:** Custom error classes (SupabaseError, OfflineError)
- **Forms:** React Hook Form + Zod resolvers

## Testing
- **Unit:** Vitest with React Testing Library
- **E2E:** Playwright for critical flows
- **Offline Testing:** Airplane mode + throttled network

## Deployment
- **Platform:** Vercel/Netlify
- **PWA:** Installable on Android, usable on iOS/desktop
- **Environment:** Separate dev/staging/prod Supabase projects