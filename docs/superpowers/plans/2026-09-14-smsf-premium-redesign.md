# SMSF Premium Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a premium ASG adviser landing page, personal/shared report dashboard, and native React version of the original SMSF comparison calculator without changing its calculation behaviour.

**Architecture:** The `app` Vite project becomes the single deployed application. A session-backed adviser store controls routing and display identity, Firebase anonymous auth supplies a non-interactive database principal, and a dedicated comparison report repository persists adviser-tagged snapshots. The calculator uses controlled React state around the existing pure calculation engine and receives a visual polish rather than a workflow rewrite.

**Tech Stack:** React 19, TypeScript 5.7, React Router 7, Zustand, Firebase Auth/Firestore Lite, Tailwind CSS 3, Recharts, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-14-smsf-premium-redesign-design.md`

## Global Constraints

- Work occurs on `codex/smsf-premium-redesign`.
- Preserve the original calculator formulas, defaults, controls, URL-sharing behaviour, and comparison outputs.
- Adviser selection is identification and filtering, not secure authorisation.
- No email/password UI; Firebase anonymous auth may run invisibly for Firestore access.
- Dates displayed to users use Australian formatting.
- Existing generated `app/dist` modifications are excluded from feature commits.
- The Vercel project Root Directory remains `app`.

---

### Task 1: Test Harness and Shared Premium Theme

**Files:**
- Modify: `app/package.json`
- Modify: `app/package-lock.json`
- Create: `app/vitest.config.ts`
- Create: `app/src/test/setup.ts`
- Modify: `app/tailwind.config.ts`
- Modify: `app/src/index.css`

**Interfaces:**
- Produces: shared Tailwind tokens `navy`, `gold`, `ivory`, `ink`; component classes `premium-card`, `eyebrow`, and `premium-control`.
- Produces: browser-like Vitest environment for later component tests.

- [ ] **Step 1: Add the test dependencies and scripts**

Run:

```powershell
npm install --save-dev @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

Add to `scripts` in `app/package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Configure Vitest**

Create `app/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    restoreMocks: true,
  },
})
```

Create `app/src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 3: Add premium theme tokens and shared classes**

Extend Tailwind with:

```ts
colors: {
  navy: '#10233d',
  gold: '#c8a34f',
  ivory: '#f5f1e9',
  ink: '#17253a',
}
```

Add reusable component classes to `index.css` using existing Tailwind utilities. Keep focus rings visible, body text at least 14px, and controls at least 44px high.

- [ ] **Step 4: Verify the harness and build**

Run:

```powershell
npm test
npm run typecheck
npm run build
```

Expected: existing options test passes; typecheck and build exit 0.

- [ ] **Step 5: Commit**

```powershell
git add app/package.json app/package-lock.json app/vitest.config.ts app/src/test/setup.ts app/tailwind.config.ts app/src/index.css
git commit -m "chore: add premium theme and component test harness"
```

---

### Task 2: Adviser Session and Invisible Firebase Access

**Files:**
- Create: `app/src/lib/adviserSession.ts`
- Create: `app/src/lib/adviserSession.test.ts`
- Create: `app/src/stores/adviserStore.ts`
- Create: `app/src/components/routing/AdviserRoute.tsx`
- Create: `app/src/components/routing/AdviserRoute.test.tsx`
- Modify: `app/src/lib/firebase.ts`
- Modify: `app/src/App.tsx`
- Modify: `app/firestore.rules`

**Interfaces:**
- Produces: `AdviserSession { id: string; name: string }`.
- Produces: `readAdviserSession(): AdviserSession | null`, `writeAdviserSession(adviser): void`, and `clearAdviserSession(): void`.
- Produces: `useAdviserStore` with `adviser`, `selectAdviser(id)`, and `signOut()`.
- Produces: `<AdviserRoute />` that renders an outlet only for a valid adviser session.

- [ ] **Step 1: Write failing session tests**

Cover valid JSON, missing storage, malformed JSON, unknown adviser IDs, write, and clear:

```ts
expect(readAdviserSession()).toBeNull()
writeAdviserSession({ id: 'mike-enderby', name: 'Mike Enderby' })
expect(readAdviserSession()).toEqual({ id: 'mike-enderby', name: 'Mike Enderby' })
clearAdviserSession()
expect(readAdviserSession()).toBeNull()
```

- [ ] **Step 2: Run the session test and confirm RED**

Run: `npx vitest run src/lib/adviserSession.test.ts`

Expected: FAIL because `adviserSession.ts` does not exist.

- [ ] **Step 3: Implement validated session storage**

Use the existing `STAFF_OPTIONS` as the source of truth. Store only under `asg-smsf-adviser-session-v1`; reject values whose IDs are absent from `STAFF_OPTIONS`.

- [ ] **Step 4: Run the session test and confirm GREEN**

Run: `npx vitest run src/lib/adviserSession.test.ts`

Expected: all session tests pass.

- [ ] **Step 5: Write the failing route test**

Render `AdviserRoute` in a `MemoryRouter` and verify an empty session navigates to `/login`, while a valid session renders the child route.

- [ ] **Step 6: Run the route test and confirm RED**

Run: `npx vitest run src/components/routing/AdviserRoute.test.tsx`

Expected: FAIL because `AdviserRoute` does not exist.

- [ ] **Step 7: Implement the store, route guard, and anonymous auth bootstrap**

On app startup call `signInAnonymously(auth)` only when no Firebase user exists. The adviser store remains independent of Firebase identity. Replace the email/password guard in `AppLayout` with `AdviserRoute`.

Set Firestore rules to require a Firebase principal:

```text
match /comparisonReports/{reportId} {
  allow read, create, update, delete: if request.auth != null;
}
```

- [ ] **Step 8: Run focused and full checks**

Run:

```powershell
npx vitest run src/lib/adviserSession.test.ts src/components/routing/AdviserRoute.test.tsx
npm run typecheck
```

Expected: tests and typecheck pass.

- [ ] **Step 9: Commit**

```powershell
git add app/src/lib/adviserSession.ts app/src/lib/adviserSession.test.ts app/src/stores/adviserStore.ts app/src/components/routing app/src/lib/firebase.ts app/src/App.tsx app/firestore.rules
git commit -m "feat: add adviser sessions and protected routes"
```

---

### Task 3: Activate and Polish the Landing Page

**Files:**
- Modify: `app/src/pages/LoginPage.tsx`
- Create: `app/src/pages/LoginPage.test.tsx`

**Interfaces:**
- Consumes: `useAdviserStore.selectAdviser(id)`.
- Produces: accessible adviser selector and active Enter Workspace navigation to `/dashboard`.

- [ ] **Step 1: Write the failing interaction test**

Verify the button is disabled initially, selecting `mike-enderby` enables it, clicking saves the adviser, and navigation renders the dashboard destination.

```ts
expect(screen.getByRole('button', { name: /enter workspace/i })).toBeDisabled()
await user.selectOptions(screen.getByLabelText(/your name/i), 'mike-enderby')
expect(screen.getByRole('button', { name: /enter workspace/i })).toBeEnabled()
```

- [ ] **Step 2: Run the landing test and confirm RED**

Run: `npx vitest run src/pages/LoginPage.test.tsx`

Expected: FAIL because the current button has no action.

- [ ] **Step 3: Implement the approved landing behaviour and polish**

Wire the submit action to `selectAdviser(staffName)` and `navigate('/dashboard')`. Preserve the approved split-panel composition while refining typography, vertical balance, dropdown affordance, focus states, trust markers, mobile layout, and ASG landing-page tokens.

- [ ] **Step 4: Run the landing test and confirm GREEN**

Run: `npx vitest run src/pages/LoginPage.test.tsx`

Expected: landing interaction passes.

- [ ] **Step 5: Commit**

```powershell
git add app/src/pages/LoginPage.tsx app/src/pages/LoginPage.test.tsx
git commit -m "feat: activate premium adviser landing page"
```

---

### Task 4: Preserve the Original Calculator as a React State Model

**Files:**
- Modify: `app/src/lib/types.ts`
- Modify: `app/src/lib/calculator.ts`
- Create: `app/src/lib/comparisonState.ts`
- Create: `app/src/lib/comparisonState.test.ts`
- Create: `app/src/lib/calculator.regression.test.ts`

**Interfaces:**
- Produces: `ComparisonScenarioInput`, `ComparisonState`, and `ComparisonOutcome`.
- Produces: `DEFAULT_COMPARISON_STATE`, `encodeComparisonQuery(state)`, `decodeComparisonQuery(search)`, and `calculateComparison(state)`.
- Preserves: left/current and right/SMSF defaults, URL parameter names, validation bounds, contribution ordering, CSV values, and milestone-year selection from `public/index.html`.

- [ ] **Step 1: Write calculator regression fixtures**

Cover at minimum:

```ts
const baseline = {
  currentBalance: 100000,
  salary: 40000,
  employerRate: 0.12,
  growthRate: 0.05,
  projectionYears: 10,
  salarySacrificeEnabled: false,
  salarySacrificePercent: 5,
  fundType: 'current' as const,
}
expect(projectYearlySeries(baseline).finalBalance).toBeCloseTo(226282.04, 2)
```

Add equivalent SMSF, salary-sacrifice, zero-balance, and 30-year fixtures derived from the original implementation.

- [ ] **Step 2: Run regression tests and confirm the current engine behaviour**

Run: `npx vitest run src/lib/calculator.regression.test.ts`

Expected: fixtures either pass or expose a documented discrepancy with `public/index.html`; reconcile the pure engine before UI migration.

- [ ] **Step 3: Write failing comparison-state tests**

Test defaults, left/right calculation, winner and deltas, URL round trip, invalid parameter fallback, and milestone years.

- [ ] **Step 4: Run comparison-state tests and confirm RED**

Run: `npx vitest run src/lib/comparisonState.test.ts`

Expected: FAIL because comparison-state helpers do not exist.

- [ ] **Step 5: Implement the comparison state model**

Keep parsing, validation, query encoding, winner selection, yearly rows, and CSV data in pure functions. Do not place DOM, React, Firebase, or download logic in this module.

- [ ] **Step 6: Run focused tests and confirm GREEN**

Run:

```powershell
npx vitest run src/lib/calculator.regression.test.ts src/lib/comparisonState.test.ts
```

Expected: all calculator and state tests pass.

- [ ] **Step 7: Commit**

```powershell
git add app/src/lib/types.ts app/src/lib/calculator.ts app/src/lib/comparisonState.ts app/src/lib/comparisonState.test.ts app/src/lib/calculator.regression.test.ts
git commit -m "feat: preserve original comparison calculator model"
```

---

### Task 5: Build the Premium Single-Page Calculator

**Files:**
- Create: `app/src/pages/ComparisonPage.tsx`
- Create: `app/src/pages/ComparisonPage.test.tsx`
- Create: `app/src/components/comparison/ScenarioCard.tsx`
- Create: `app/src/components/comparison/ComparisonHero.tsx`
- Create: `app/src/components/comparison/ComparisonChart.tsx`
- Create: `app/src/components/comparison/YearlyComparison.tsx`
- Create: `app/src/components/comparison/SaveComparisonDialog.tsx`
- Modify: `app/src/App.tsx`

**Interfaces:**
- Consumes: `ComparisonState`, `calculateComparison`, query encode/decode helpers, and selected adviser.
- Produces: `/comparison/new` and `/comparison/:reportId` calculator routes.
- Emits: `onSave(clientName, state, outcome)` for Task 6 persistence.

- [ ] **Step 1: Write the failing calculator interaction test**

Verify original defaults render, Copy mirrors balance and salary, salary-sacrifice controls enable conditionally, Calculate displays the expected winner, Reset restores defaults, and Share writes the encoded URL.

- [ ] **Step 2: Run the component test and confirm RED**

Run: `npx vitest run src/pages/ComparisonPage.test.tsx`

Expected: FAIL because `ComparisonPage` does not exist.

- [ ] **Step 3: Build focused calculator components**

Use two premium `ScenarioCard` components with the original fields. Keep both scenarios visible on desktop and stacked on mobile. Display the outcome in `ComparisonHero`, followed by chart and milestone table. Use progressive disclosure only for the full yearly table.

- [ ] **Step 4: Preserve utility actions**

Implement Calculate, Reset, CSV download, Share, Copy balance, Copy salary, numeric increment/decrement, and show-all-year controls against the pure state model.

- [ ] **Step 5: Run calculator tests and confirm GREEN**

Run:

```powershell
npx vitest run src/pages/ComparisonPage.test.tsx src/lib/calculator.regression.test.ts src/lib/comparisonState.test.ts
npm run typecheck
```

Expected: all focused tests and typecheck pass.

- [ ] **Step 6: Commit**

```powershell
git add app/src/pages/ComparisonPage.tsx app/src/pages/ComparisonPage.test.tsx app/src/components/comparison app/src/App.tsx
git commit -m "feat: add premium single-page SMSF calculator"
```

---

### Task 6: Comparison Report Persistence

**Files:**
- Modify: `app/src/lib/types.ts`
- Modify: `app/src/lib/firestore.ts`
- Create: `app/src/lib/reportFilters.ts`
- Create: `app/src/lib/reportFilters.test.ts`
- Modify: `app/src/pages/ComparisonPage.tsx`

**Interfaces:**
- Produces: `ComparisonReport` with `id`, `adviserId`, `adviserName`, `clientName`, `state`, `outcomeSummary`, `createdAt`, and `updatedAt`.
- Produces: `saveComparisonReport`, `getComparisonReport`, `listComparisonReports`, and `deleteComparisonReport`.
- Produces: `filterReports(reports, mode, adviserId)` where mode is `'mine' | 'all'`.

- [ ] **Step 1: Write failing report-filter tests**

Verify Mine returns only exact adviser-ID matches, All returns every report, and neither mode mutates or reorders the input.

- [ ] **Step 2: Run filter tests and confirm RED**

Run: `npx vitest run src/lib/reportFilters.test.ts`

Expected: FAIL because the helper does not exist.

- [ ] **Step 3: Implement report types, repository, and filters**

Use the `comparisonReports` Firestore collection. Store calculator state and summary values as plain serialisable data. Convert Firestore timestamps at the repository boundary and sort descending by creation time.

- [ ] **Step 4: Connect save and reopen flows**

The save dialog accepts an optional client name. On failure, leave the calculator state untouched and show `Comparison could not be saved. Check your connection and try again.` Reopening `/comparison/:reportId` hydrates the saved state; a missing report displays a return-to-dashboard action.

- [ ] **Step 5: Run focused tests and typecheck**

Run:

```powershell
npx vitest run src/lib/reportFilters.test.ts src/pages/ComparisonPage.test.tsx
npm run typecheck
```

Expected: tests and typecheck pass.

- [ ] **Step 6: Commit**

```powershell
git add app/src/lib/types.ts app/src/lib/firestore.ts app/src/lib/reportFilters.ts app/src/lib/reportFilters.test.ts app/src/pages/ComparisonPage.tsx
git commit -m "feat: save and reopen adviser comparison reports"
```

---

### Task 7: Premium Dashboard and Application Shell

**Files:**
- Modify: `app/src/pages/DashboardPage.tsx`
- Create: `app/src/pages/DashboardPage.test.tsx`
- Modify: `app/src/components/layout/AppLayout.tsx`
- Modify: `app/src/components/layout/Header.tsx`
- Modify: `app/src/components/layout/Sidebar.tsx`
- Modify: `app/src/components/ui/Button.tsx`
- Modify: `app/src/components/ui/Card.tsx`
- Modify: `app/src/components/ui/Input.tsx`
- Modify: `app/src/components/ui/Select.tsx`

**Interfaces:**
- Consumes: selected adviser and comparison report repository/filter helper.
- Produces: dashboard with My Reports / All Reports, New Comparison, empty/loading/error states, reopen and confirmed delete actions.

- [ ] **Step 1: Write failing dashboard tests**

Cover adviser greeting, Mine default, All toggle, report metadata, New Comparison link, empty state, Firestore failure message, and sign-out redirect.

- [ ] **Step 2: Run dashboard tests and confirm RED**

Run: `npx vitest run src/pages/DashboardPage.test.tsx`

Expected: FAIL against the current projection dashboard.

- [ ] **Step 3: Implement the report dashboard**

Replace projection/activity metrics with report-centric metrics: total comparisons, this month, clients represented, and strongest projected advantage. Render the selected filter state in an accessible two-option control.

- [ ] **Step 4: Apply the premium application shell**

Use restrained navy navigation, warm-white content surfaces, gold active indicators, editorial page titles, and consistent shared controls. Keep desktop navigation compact and provide an accessible mobile menu.

- [ ] **Step 5: Implement report actions and states**

Reopen navigates to `/comparison/:reportId`. Delete uses the existing confirmation modal pattern and refreshes the list only after success. Errors retain the existing list and expose retry.

- [ ] **Step 6: Run dashboard and full tests**

Run:

```powershell
npx vitest run src/pages/DashboardPage.test.tsx
npm test
npm run typecheck
```

Expected: full suite and typecheck pass.

- [ ] **Step 7: Commit**

```powershell
git add app/src/pages/DashboardPage.tsx app/src/pages/DashboardPage.test.tsx app/src/components/layout app/src/components/ui
git commit -m "feat: add premium adviser report dashboard"
```

---

### Task 8: End-to-End Verification and Deployment Readiness

**Files:**
- Modify if required by verified defects only: files changed in Tasks 1-7
- Do not commit: `app/dist/**`, `app/tsconfig.app.tsbuildinfo`, `.superpowers/**`

**Interfaces:**
- Verifies the complete landing → dashboard → calculator → save → reopen workflow.

- [ ] **Step 1: Run all automated checks**

Run:

```powershell
npm test
npm run typecheck
npm run lint
npm run build
```

Expected: all configured checks exit 0. If lint remains unavailable, classify and repair the repository lint dependency before completion.

- [ ] **Step 2: Run calculator parity checks**

Compare baseline, SMSF, salary-sacrifice, zero-balance, and 30-year outputs against the committed regression fixtures. Expected: no numerical drift beyond two decimal places.

- [ ] **Step 3: Perform responsive browser verification**

Verify at 1440×900, 768×1024, and 390×844:

- Landing content is readable with no horizontal scroll.
- Adviser selection activates Enter Workspace.
- Dashboard Mine/All toggle updates report rows.
- New Comparison retains all original controls.
- Result hierarchy, chart, CSV, and share actions work.
- Keyboard focus is visible and every control has an accessible name.

- [ ] **Step 4: Verify Firebase and Vercel prerequisites**

Confirm Firebase Anonymous Authentication is enabled, Firestore rules are deployed, and all five `VITE_FIREBASE_*` values exist for Vercel Production and Preview. Confirm Vercel Root Directory is `app` and redeploy without stale cache.

- [ ] **Step 5: Review the final diff**

Run:

```powershell
git status --short
git diff main...HEAD --stat
git diff --check main...HEAD
```

Expected: only intentional source, test, configuration, rules, spec, and plan files appear; no generated build output is staged.

- [ ] **Step 6: Commit verified fixes, if any**

```powershell
git add app/src app/firestore.rules app/package.json app/package-lock.json app/vitest.config.ts
git commit -m "fix: resolve SMSF redesign verification findings"
```

Skip this commit when verification required no fixes.
