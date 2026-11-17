# SMSF DRAPS-Style Login Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the SMSF adviser gate to closely match the supplied Daily DRAPS gate while preserving the working adviser-session navigation.

**Architecture:** Keep `LoginPage` as the only product-code change and reuse its existing adviser store and route flow. Update its component test first to pin the new gate copy and existing navigation behaviour, then implement the responsive two-panel presentation with existing Tailwind utilities.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, React Router, Zustand, Vitest, Testing Library

**Spec:** `docs/superpowers/specs/2026-11-17-smsf-draps-login-gate-design.md`

## Global Constraints

- No new dependencies, backend services, authentication, environment variables, or routes.
- Preserve the existing adviser list, session-storage model, dashboard, calculator and saved reports.
- The button remains disabled until a valid adviser is selected.
- Desktop follows the supplied DRAPS 40/60 composition; mobile stacks without hiding controls.

## Review Focus

- Empty adviser selection keeps `Enter Workspace` disabled.
- A valid adviser enables submission, persists the session and reaches `/dashboard`.
- The new SMSF-specific heading and product title render.
- Desktop and 390px layouts keep the adviser control and action visible.
- Direct dashboard access without a session still redirects to `/login`.

---

### Task 1: Pin the revised gate behaviour and copy

**Files:**
- Modify: `app/src/pages/LoginPage.test.tsx`

**Interfaces:**
- Consumes: `LoginPage`, `useAdviserStore`
- Produces: regression coverage for the revised gate and existing navigation

- [ ] **Step 1: Add assertions for `SMSF Growth Comparison`, `Start Your Comparison`, disabled initial action, and successful adviser navigation.**
- [ ] **Step 2: Run `npm test -- LoginPage.test.tsx --run` and verify it fails on the new copy.**

### Task 2: Implement the DRAPS-style SMSF gate

**Files:**
- Modify: `app/src/pages/LoginPage.tsx`

**Interfaces:**
- Consumes: `STAFF_OPTIONS`, `useAdviserStore.selectAdviser`, React Router `navigate`
- Produces: responsive adviser gate that submits to `/dashboard`

- [ ] **Step 1: Replace the current visual composition with the approved 40/60 gate and SMSF-specific copy.**
- [ ] **Step 2: Preserve the form submit path and disabled state.**
- [ ] **Step 3: Run the focused login test and verify it passes.**
- [ ] **Step 4: Run `npm run lint`, `npm test -- --run`, `npm run typecheck`, and `npm run build`.**
- [ ] **Step 5: Verify login → dashboard → new comparison in a browser at desktop and 390px.**

### Task 3: Integrate the approved release

**Files:**
- Add: the design and plan documents
- Modify: no additional product files

**Interfaces:**
- Consumes: verified Task 2 branch
- Produces: updated PR #1 and production `main`

- [ ] **Step 1: Commit the specification, plan, test and login page with a focused message.**
- [ ] **Step 2: Push `codex/smsf-premium-redesign`.**
- [ ] **Step 3: Merge PR #1 into `main` only after checks pass.**
- [ ] **Step 4: Verify the production Enter Workspace flow.**
