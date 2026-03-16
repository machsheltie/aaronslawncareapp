---
project_name: 'app'
user_name: 'Heirr'
date: '2026-02-09'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'critical_rules']
existing_patterns_found: 0
workflow_status: 'complete'
completion_date: '2026-02-09'
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code for Aaron's Lawn Care business management PWA. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

### Core Technologies

**Frontend:**
- React 18.3+ (use react-dom/client for concurrent features)
- Vite 5.1+ (faster HMR, better PWA support)
- TypeScript 5.3+ (better type inference)
- React Router v6.4+ (data router features)

**State Management:**
- TanStack Query v5.20+ (React Query - improved deduplication)
- Zustand 4.5+ (client state)

**Backend/Database:**
- Supabase JS Client v2.39+ (v2.38 has WebSocket bugs)
- @supabase/auth-helpers-react v0.5+ (React 18 compat)
- PostgreSQL 15+ (via Supabase)
- PostGIS extension (enable manually in dashboard)

**PWA & Offline:**
- vite-plugin-pwa 0.19.2+ (manifest generation fixes)
- Workbox 7.0+ (v6 deprecated)
- Dexie.js 3.2+ (IndexedDB wrapper, better than idb-keyval for complex queries)

**Payments:**
- @stripe/stripe-js v3.0+ (Financial Connections support)
- @stripe/react-stripe-js v2.5+ (React 18 compat)

**Communications:**
- Twilio SDK latest
- SendGrid/mail latest

**Maps:**
- @googlemaps/js-api-loader latest
- Google Routes API (requires API key configuration)

**Deployment:**
- Netlify (zero-config CI/CD)
- Node 20.x LTS (development)
- Node 18.x minimum (CI/CD)

**Testing:**
- Vitest 1.2+ (Vite 5 compat)
- Playwright 1.40+ (modern browsers)
- @testing-library/react 14+ (React 18 - v13 has breaking changes)

### Critical Version Constraints

⚠️ **BREAKING CHANGES:**
- React Query v4 → v5: Breaking API changes, don't mix versions
- Supabase Client v1 → v2: Complete rewrite, use v2.39+
- Testing Library React v13 → v14: React 18 support

⚠️ **PLATFORM-SPECIFIC:**
- iOS Safari: Requires user interaction for SW registration
- IndexedDB: 50MB quota on iOS - implement quota monitoring
- Service Worker: Requires HTTPS (localhost OK for dev)

⚠️ **RUNTIME CONSTRAINTS:**
- Supabase Edge Functions: Deno 1.40+, NOT Node.js
- Stripe Webhooks: Requires raw body parsing (configure before body-parser)

⚠️ **BROWSER SUPPORT:**
- Minimum: Safari 16.4+, Chrome 108+, Firefox 109+, Edge 108+
- Target: Last 2 versions of modern browsers
- NO IE11 support

### Environment Setup

**Development:**
- Node.js 20.x LTS (best performance)
- pnpm 8.x or npm 10.x
- Supabase CLI 1.x

**Environment Variables Required:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_GOOGLE_MAPS_API_KEY`

**Secret Keys (Netlify/Backend only):**
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `TWILIO_AUTH_TOKEN`
- `SENDGRID_API_KEY`

---

## Critical Implementation Rules

### Language-Specific Rules (TypeScript/JavaScript)

#### TypeScript Configuration

**Strict Mode (REQUIRED):**
- `strict: true` in tsconfig.json
- `strictNullChecks: true`
- `noImplicitAny: true`
- `strictFunctionTypes: true`

**Import/Export Patterns:**
- Use ES6 imports only (no CommonJS require)
- Named exports preferred over default exports
- Import order: React → External → Internal → Types → Styles
- Use path aliases: `@/components`, `@/utils`, `@/types`
- Type-only imports: `import type { Type } from '...'` (smaller bundle)

**Path Aliases (tsconfig.json):**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"]
    }
  }
}
```

#### Supabase Type Generation (CRITICAL)

**Auto-generate types from database:**
```bash
npx supabase gen types typescript --project-id <ref> > src/types/supabase.ts
```

**MUST regenerate after ANY schema changes**

**Usage:**
```typescript
import { Database } from '@/types/supabase'

type Job = Database['public']['Tables']['jobs']['Row']
type JobInsert = Database['public']['Tables']['jobs']['Insert']
type JobUpdate = Database['public']['Tables']['jobs']['Update']
```

#### Runtime Validation with Zod (REQUIRED)

**Install:** `pnpm add zod`

**Validate ALL external data (API responses, user input):**
```typescript
import { z } from 'zod'

const CustomerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().regex(/^\d{10}$/)
})

type Customer = z.infer<typeof CustomerSchema>

// Validate Supabase responses
const { data } = await supabase.from('customers').select('*')
const validated = CustomerSchema.parse(data)
```

**Form validation:** Use Zod + React Hook Form for type-safe forms

#### Async/Await Patterns (REQUIRED)

**Always async/await, NEVER .then() chains:**
```typescript
// ✅ CORRECT
const { data, error } = await supabase.from('jobs').select('*')

// ❌ WRONG
supabase.from('jobs').select('*').then(...)
```

**Error Handling:**
```typescript
try {
  const { data, error } = await supabase.from('jobs').select('*')
  if (error) throw new SupabaseError(error.message, error.code)
  return data
} catch (error) {
  if (error instanceof SupabaseError) {
    // Handle Supabase errors
  }
  throw error
}
```

#### Offline Queue Typing (CRITICAL)

**Use discriminated unions for queue actions:**
```typescript
type QueueAction =
  | { type: 'CREATE_JOB'; payload: JobInsert; timestamp: number }
  | { type: 'UPDATE_JOB'; payload: { id: string; updates: JobUpdate }; timestamp: number }
  | { type: 'UPLOAD_PHOTO'; payload: { jobId: string; blob: Blob }; timestamp: number }

function processQueueItem(item: QueueAction) {
  switch (item.type) {
    case 'CREATE_JOB':
      // payload is automatically typed as JobInsert
      break
  }
}
```

#### React Query Typing (REQUIRED)

**Always type queries with generics:**
```typescript
const { data, error } = useQuery<Job[], Error>({
  queryKey: ['jobs', customerId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('customer_id', customerId)
    if (error) throw error
    return data
  }
})
// data is Job[] | undefined
```

#### Stripe Webhook Typing

**Use Stripe SDK types:**
```typescript
import Stripe from 'stripe'

async function handleWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      // Fully typed
      break
  }
}
```

#### Custom Error Types (REQUIRED)

**Define domain-specific errors:**
```typescript
class SupabaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'SupabaseError'
  }
}

class OfflineError extends Error {
  constructor(
    message: string,
    public action: QueueAction
  ) {
    super(message)
    this.name = 'OfflineError'
  }
}
```

#### React Hook Typing

**Custom hooks must return typed objects:**
```typescript
function useOfflineQueue() {
  const [queue, setQueue] = useState<QueueAction[]>([])

  const addToQueue = useCallback((action: QueueAction) => {
    setQueue(prev => [...prev, action])
  }, [])

  return { queue, addToQueue } // Inferred correctly
}
```

**Context hooks must validate:**
```typescript
function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

#### Service Worker TypeScript

**Special reference directive:**
```typescript
/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope
```

#### Performance TypeScript Patterns

**Prefer union types over enums:**
```typescript
// ❌ AVOID (larger bundle)
enum JobStatus { Scheduled, InProgress, Completed }

// ✅ PREFER (smaller bundle)
type JobStatus = 'scheduled' | 'in_progress' | 'completed'

// With const assertion for compile-time array
const JOB_STATUSES = ['scheduled', 'in_progress', 'completed'] as const
type JobStatus = typeof JOB_STATUSES[number]
```

**Use type-only imports:**
```typescript
// No runtime cost
import type { Customer, Job } from '@/types/supabase'
```

#### Critical Anti-Patterns (NEVER)

❌ **NEVER:**
- Use `any` type (use `unknown` for dynamic data)
- Use `@ts-ignore` or `@ts-expect-error` (fix the type)
- Use `as` type assertion (validate with Zod instead)
- Mix CommonJS and ES6 imports
- Use enums (use union types)
- Trust external data without validation

✅ **ALWAYS:**
- Validate external data with Zod
- Use discriminated unions for state machines
- Type React Query hooks with generics
- Generate Supabase types from schema
- Use custom error classes
- Fix TypeScript errors before committing

---

### Framework-Specific Rules (React 18+)

#### Component Structure

**File Organization:**
```
src/components/
├── layout/          # Header, Footer, Navigation, Sidebar
├── common/          # Button, Card, Input, Modal (reusable primitives)
├── forms/           # CustomerForm, JobForm, InvoiceForm
├── features/        # Feature-specific (jobs/, customers/, invoices/)
└── providers/       # Context providers (AuthProvider, OfflineProvider)
```

**Naming:** PascalCase for components, camelCase for utilities, prefix hooks with `use`

#### React 18 Concurrent Features (REQUIRED)

**Entry point:**
```typescript
// ✅ CORRECT - src/main.tsx
import { createRoot } from 'react-dom/client'
const root = createRoot(document.getElementById('root')!)
root.render(<React.StrictMode><App /></React.StrictMode>)

// ❌ WRONG - Legacy React 17
import ReactDOM from 'react-dom'
ReactDOM.render(<App />, document.getElementById('root'))
```

**Use Suspense + lazy for code splitting:**
```typescript
import { Suspense, lazy } from 'react'
const CustomerList = lazy(() => import('./features/customers/CustomerList'))

<Suspense fallback={<LoadingSpinner />}>
  <CustomerList />
</Suspense>
```

**Use useTransition for non-urgent updates:**
```typescript
const [isPending, startTransition] = useTransition()
startTransition(() => setFilteredResults(filter(query)))
```

#### Hooks Rules (STRICT)

**NEVER BREAK:**
- Only call hooks at top level (not in loops, conditions, nested functions)
- Only call from React components or custom hooks
- Custom hooks must start with `use`
- Include ALL dependencies in useEffect (no ESLint disabling)

#### State Management Architecture (CRITICAL)

**Three-Tier Pattern:**

1. **Server State (React Query):** ALL Supabase data
2. **Client State (Zustand):** UI state, offline queue, app settings
3. **Component State (useState):** Truly local UI only (modals, tabs)

**NEVER use useState for server data or persistent app state**

#### React Query Patterns (REQUIRED)

**Query Keys:**
```typescript
['jobs']                              // All jobs
['jobs', { customerId: '123' }]      // Filtered
['customers', '123']                  // Single entity
```

**Mutations with Optimistic Updates:**
```typescript
onMutate: async (updates) => {
  await queryClient.cancelQueries({ queryKey: ['jobs'] })
  const previous = queryClient.getQueryData(['jobs'])
  queryClient.setQueryData(['jobs'], (old) => /* optimistic update */)
  return { previous }
},
onError: (err, updates, context) => {
  queryClient.setQueryData(['jobs'], context?.previous)  // Rollback
}
```

**Offline Queue Integration:**
```typescript
if (!navigator.onLine) {
  addToQueue({ type: 'CREATE_JOB', payload, timestamp: Date.now() })
  return { ...payload, id: `temp-${Date.now()}`, sync_status: 'pending' }
}
```

#### Performance (CRITICAL)

**useMemo for expensive calculations only:**
```typescript
const sorted = useMemo(() => jobs.sort(...), [jobs])
```

**useCallback for functions passed as props:**
```typescript
const handleSubmit = useCallback(async (data) => { ... }, [createJob])
```

**React.memo for expensive components (list items):**
```typescript
export const JobCard = React.memo(({ job }) => <div>...</div>)
```

**Lazy load routes:**
```typescript
{ path: '/customers', element: lazy(() => import('./pages/Customers')) }
```

#### Error Boundaries (REQUIRED)

Create error boundary for each major feature. Use `getDerivedStateFromError` and `componentDidCatch`.

#### PWA-Specific Patterns (CRITICAL)

**Online/Offline Detection:**
```typescript
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  return isOnline
}
```

**Service Worker Registration:**
```typescript
import { registerSW } from 'virtual:pwa-register'
const updateSW = registerSW({
  onNeedRefresh() { /* Prompt for update */ },
  onOfflineReady() { /* Log ready */ }
})
```

#### Form Handling (REQUIRED)

**Use React Hook Form + Zod:**
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(FormSchema)
})
```

#### Critical Anti-Patterns (NEVER)

❌ **NEVER:**
- Mutate state directly
- Use index as key in lists
- Call hooks conditionally
- Forget cleanup in useEffect
- Use inline objects/arrays as props (re-renders)
- Put large objects in Context

✅ **ALWAYS:**
- Immutable updates
- Use stable IDs as keys
- Return cleanup from useEffect
- Memoize props objects/arrays
- Use React Query for server state

---

### Testing Rules

#### Test Organization

**File Structure:**
```
src/
├── components/
│   └── CustomerList.tsx
│   └── CustomerList.test.tsx    # Colocate tests with components
├── utils/
│   └── formatters.ts
│   └── formatters.test.ts
└── __tests__/
    └── e2e/                      # Playwright E2E tests
        └── job-workflow.spec.ts
```

**Naming:** `ComponentName.test.tsx` for unit/component tests, `*.spec.ts` for E2E

#### Vitest Configuration (REQUIRED)

**Setup file for React Testing Library:**
```typescript
// vitest.setup.ts
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
```

**Mock Supabase in tests:**
```typescript
import { vi } from 'vitest'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockResolvedValue({ data: {}, error: null })
    }))
  }
}))
```

#### Component Testing Patterns

**Use Testing Library queries (priority order):**
1. `getByRole` (preferred - accessibility-first)
2. `getByLabelText` (for form inputs)
3. `getByPlaceholderText`
4. `getByText`
5. `getByTestId` (last resort)

**Example:**
```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

test('creates new job', async () => {
  const user = userEvent.setup()
  render(<JobForm />)

  // ✅ Use getByRole (accessibility-first)
  await user.type(screen.getByRole('textbox', { name: /customer name/i }), 'John')
  await user.click(screen.getByRole('button', { name: /submit/i }))

  // ✅ Assert async behavior
  await waitFor(() => {
    expect(screen.getByText(/job created/i)).toBeInTheDocument()
  })
})
```

#### React Query Testing

**Mock React Query for tests:**
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
}

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}
```

#### Playwright E2E Testing (CRITICAL)

**Test offline functionality:**
```typescript
import { test, expect } from '@playwright/test'

test('handles offline job creation', async ({ page, context }) => {
  await page.goto('/')

  // Go offline
  await context.setOffline(true)

  // Create job while offline
  await page.fill('[name="customer"]', 'John Doe')
  await page.click('button:text("Create Job")')

  // Verify optimistic UI
  await expect(page.locator('text=Job queued')).toBeVisible()

  // Go back online
  await context.setOffline(false)

  // Wait for sync
  await expect(page.locator('text=Job created')).toBeVisible({ timeout: 10000 })
})
```

**Test service worker:**
```typescript
test('works offline after first load', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  // Go offline
  await page.context().setOffline(true)

  // Navigate (should work from cache)
  await page.click('a:text("Jobs")')
  await expect(page.locator('h1:text("Jobs")')).toBeVisible()
})
```

#### Test Coverage

**Target:** 70%+ for critical paths (auth, payments, offline queue)

**Run coverage:**
```bash
pnpm test -- --coverage
```

**Focus coverage on:**
- Authentication flows
- Payment processing
- Offline queue logic
- Form validation
- Critical business logic

**Skip coverage for:**
- UI component styles
- Third-party integrations (mock them)
- Configuration files

#### Testing Anti-Patterns (NEVER)

❌ **NEVER:**
- Test implementation details (component state)
- Use `getByTestId` as first choice
- Skip cleanup after tests
- Test third-party libraries (Supabase, Stripe)
- Write brittle tests tied to specific HTML structure

✅ **ALWAYS:**
- Test user behavior and outcomes
- Use accessible queries (getByRole)
- Mock external dependencies
- Test error states and edge cases
- Test offline scenarios for critical flows

---

### Code Quality & Style Rules

#### ESLint Configuration (REQUIRED)

**Install:**
```bash
pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
pnpm add -D eslint-plugin-react eslint-plugin-react-hooks
```

**eslint.config.js (Flat Config):**
```javascript
import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      }
    },
    plugins: {
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error'
    }
  }
]
```

**CRITICAL:** Fix all ESLint errors before committing. No `// eslint-disable` comments.

#### Prettier Configuration (REQUIRED)

**.prettierrc:**
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

**Format on save:** Enable in VS Code settings

#### File and Folder Naming

**Components:** PascalCase - `CustomerList.tsx`, `JobCard.tsx`
**Utilities:** camelCase - `formatDate.ts`, `validateEmail.ts`
**Hooks:** camelCase with `use` prefix - `useOfflineQueue.ts`, `useCustomers.ts`
**Types:** PascalCase - `Customer.ts`, `Job.ts` (or in `types/` folder)
**Pages/Routes:** PascalCase - `Customers.tsx`, `Jobs.tsx`
**Tests:** Match source file - `CustomerList.test.tsx`

#### Import Organization (AUTO-FORMATTED)

**Order:**
1. React imports
2. External dependencies
3. Internal modules (using @/ aliases)
4. Types
5. Styles

**Example:**
```typescript
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Customer } from '@/types/supabase'
import './CustomerList.css'
```

#### Comment Guidelines

**When to comment:**
- Complex business logic
- Workarounds for browser bugs
- Non-obvious performance optimizations
- Offline queue state machine logic

**When NOT to comment:**
- Obvious code (`// Increment counter` - NO!)
- Self-documenting code with good naming
- Implementation details (let the code speak)

**Use JSDoc for public APIs:**
```typescript
/**
 * Syncs offline queue to Supabase when connection restored
 * @param queue - Array of pending actions
 * @returns Number of successfully synced items
 */
async function syncOfflineQueue(queue: QueueAction[]): Promise<number> {
  // ...
}
```

---

### Development Workflow Rules

#### Git Branch Strategy

**Branch naming:**
```
feature/customer-management
fix/offline-queue-retry
refactor/supabase-client
```

**Main branch:** `main` (protected, requires PR)

#### Commit Message Format

**Convention:**
```
type(scope): brief description

- Bullet point details if needed
- What changed and why
```

**Types:** `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

**Examples:**
```
feat(customers): add customer search functionality
fix(offline): handle queue retry after network restore
refactor(auth): simplify Supabase auth hooks
test(jobs): add E2E tests for job creation flow
```

#### Pull Request Checklist

Before merging:
- [ ] All tests passing
- [ ] No ESLint errors
- [ ] Code formatted with Prettier
- [ ] TypeScript types all correct
- [ ] Tested offline functionality (if applicable)
- [ ] Updated types if schema changed
- [ ] Self-reviewed code changes

#### Deployment to Netlify

**Automatic:**
- Push to `main` → Deploy to production
- Push to feature branch → Deploy to preview URL

**Environment Variables (Netlify Dashboard):**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_GOOGLE_MAPS_API_KEY`

**Build Settings:**
```
Build command: pnpm build
Publish directory: dist
```

#### Local Development Commands

```bash
pnpm dev          # Start dev server (http://localhost:5173)
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm test         # Run Vitest unit tests
pnpm test:e2e     # Run Playwright E2E tests
pnpm lint         # Run ESLint
pnpm format       # Format with Prettier
pnpm type-check   # TypeScript type checking
```

---

### Critical Don't-Miss Rules (⚠️ READ CAREFULLY)

#### Offline-First Gotchas (CRITICAL)

**1. IndexedDB Storage Quota (iOS Safari)**
- **Issue:** iOS Safari limits IndexedDB to 50MB
- **Solution:** Monitor quota with `navigator.storage.estimate()`
- **Implementation:**
```typescript
async function checkStorageQuota() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const { usage, quota } = await navigator.storage.estimate()
    const percentUsed = (usage / quota) * 100
    if (percentUsed > 80) {
      // Warn user or clear old cache
      console.warn(`Storage ${percentUsed}% full`)
    }
  }
}
```

**2. Service Worker Requires User Interaction (iOS)**
- **Issue:** iOS Safari won't register SW without user interaction
- **Solution:** Register SW on first user click/tap
```typescript
document.addEventListener('click', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
  }
}, { once: true })
```

**3. Background Sync Requires HTTPS**
- **Issue:** Background Sync API only works on HTTPS (or localhost)
- **Solution:** Always deploy to HTTPS (Netlify provides free SSL)

**4. Offline Queue Must Handle Conflicts**
- **Issue:** Multiple clients editing same data while offline
- **Solution:** Last-write-wins with timestamp (acceptable for 2-user app)

#### Supabase RLS Gotchas (CRITICAL)

**1. RLS Policies Must Be Explicit**
```sql
-- ✅ CORRECT - Explicit customer portal access
CREATE POLICY "Customers can view their own jobs"
ON jobs FOR SELECT
USING (auth.uid() = customer_id);

-- ❌ WRONG - Forgetting auth check
CREATE POLICY "Anyone can view jobs"
ON jobs FOR SELECT
USING (true);  -- SECURITY HOLE!
```

**2. Service Role Key Bypasses RLS**
- **Issue:** `SUPABASE_SERVICE_ROLE_KEY` bypasses ALL RLS policies
- **Solution:** NEVER use service role key client-side. Only in Supabase Edge Functions.

**3. Regenerate Types After Schema Changes**
```bash
npx supabase gen types typescript --project-id <ref> > src/types/supabase.ts
```
**CRITICAL:** Run this EVERY TIME you change database schema

#### Stripe Webhook Gotchas (CRITICAL)

**1. Verify Webhook Signatures (REQUIRED)**
```typescript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function handleWebhook(request: Request) {
  const signature = request.headers.get('stripe-signature')
  const body = await request.text()  // MUST be raw body

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
    // Process event
  } catch (err) {
    return new Response('Invalid signature', { status: 400 })
  }
}
```

**2. Webhooks Need Raw Body**
- **Issue:** Body parsers convert body to JSON before Stripe can verify
- **Solution:** Configure raw body for webhook endpoint only

**3. Handle Idempotency**
```typescript
const processedEvents = new Set<string>()

async function handleWebhook(event: Stripe.Event) {
  // Check if already processed
  if (processedEvents.has(event.id)) {
    return // Skip duplicate
  }

  // Process event
  await processPayment(event)

  // Mark as processed
  processedEvents.add(event.id)
}
```

#### Performance Gotchas (CRITICAL)

**1. Don't Fetch All Data at Once**
```typescript
// ❌ WRONG - Loads all 100 customers at once
const { data } = await supabase.from('customers').select('*')

// ✅ CORRECT - Pagination
const { data } = await supabase
  .from('customers')
  .select('*')
  .range(0, 19)  // First 20 only
```

**2. Use React Query Stale Time**
```typescript
// Prevent unnecessary refetches
useQuery({
  queryKey: ['customers'],
  queryFn: fetchCustomers,
  staleTime: 5 * 60 * 1000  // 5 minutes
})
```

**3. Lazy Load Routes**
```typescript
// Split bundles by route
const Customers = lazy(() => import('./pages/Customers'))
```

#### Security Gotchas (CRITICAL)

**1. Never Commit `.env` Files**
- Add `.env*` to `.gitignore`
- Use Netlify environment variables for secrets

**2. Validate ALL User Input**
```typescript
// Use Zod to validate BEFORE database operations
const validatedData = CustomerSchema.parse(userInput)
```

**3. Rate Limit API Calls**
```typescript
// Prevent abuse of Supabase API
// Use Supabase rate limiting or implement client-side throttle
```

**4. Sanitize File Uploads**
```typescript
// Check file type and size before upload
if (!['image/jpeg', 'image/png'].includes(file.type)) {
  throw new Error('Invalid file type')
}
if (file.size > 5 * 1024 * 1024) {  // 5MB
  throw new Error('File too large')
}
```

#### Database Gotchas (CRITICAL)

**1. Add Indexes for Queries**
```sql
-- If you query by customer_id frequently
CREATE INDEX idx_jobs_customer_id ON jobs(customer_id);

-- If you query by date range
CREATE INDEX idx_jobs_scheduled_date ON jobs(scheduled_date);
```

**2. Use Transactions for Related Operations**
```typescript
// Create job + invoice atomically
const { data, error } = await supabase.rpc('create_job_with_invoice', {
  job_data: newJob,
  invoice_data: newInvoice
})
```

**3. Soft Delete Instead of Hard Delete**
```typescript
// Keep audit trail
await supabase
  .from('jobs')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', jobId)
```

#### React Query Gotchas (CRITICAL)

**1. Query Keys Must Be Stable**
```typescript
// ❌ WRONG - Object literal creates new reference
useQuery({ queryKey: ['jobs', { filter: 'active' }] })

// ✅ CORRECT - Stable reference
const filter = 'active'
useQuery({ queryKey: ['jobs', filter] })
```

**2. Mutations Invalidate Queries**
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['jobs'] })
}
```

**3. Optimistic Updates Need Rollback**
```typescript
onError: (err, variables, context) => {
  queryClient.setQueryData(['jobs'], context.previousJobs)
}
```

---

## 🎉 Project Context Complete!

All critical implementation rules documented for Aaron's Lawn Care PWA.

**Total Sections:**
- ✅ Technology Stack & Versions
- ✅ Language-Specific Rules (TypeScript/JavaScript)
- ✅ Framework-Specific Rules (React 18+)
- ✅ Testing Rules (Vitest, Playwright)
- ✅ Code Quality & Style Rules
- ✅ Development Workflow Rules
- ✅ Critical Don't-Miss Rules

**File Location:** `_bmad-output/project-context.md`

This file is now ready to guide AI agents through consistent, high-quality implementation of your offline-first business management PWA.
