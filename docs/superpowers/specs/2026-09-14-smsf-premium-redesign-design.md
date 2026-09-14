# SMSF Premium Redesign

## Objective

Create a cohesive ASG-branded web application that starts with a premium adviser-selection landing page, opens a useful report dashboard, and launches the existing single-page SMSF calculator with a visual polish rather than a behavioural rewrite.

## Scope

The redesign covers the adviser entry flow, dashboard, report history, calculator presentation, session handling, and shared visual system. It preserves the original calculator's formulas, defaults, controls, URL-sharing behaviour, and comparison outputs.

Firebase email/password authentication is removed from this flow. Adviser selection identifies and filters activity but does not provide secure access control.

## Navigation

- `/login` displays the adviser-selection landing page.
- `/dashboard` displays adviser-specific report history and summary information.
- `/comparison/new` starts a new comparison using the original calculator experience.
- Saved reports can be reopened from the dashboard.
- Routes requiring an adviser redirect to `/login` when no adviser session exists.
- Signing out clears the adviser session and returns to `/login`.

## Adviser Session

The landing page stores the selected adviser's stable ID and display name in `sessionStorage`. The Enter Workspace button remains disabled until a valid adviser is selected, then opens the dashboard.

The selected adviser appears in the application header and is attached to saved comparison reports. Because the selector is not authentication, any person with the application link can select another adviser.

## Dashboard

The dashboard is the first page after adviser selection. It includes:

- A premium welcome header with the selected adviser's name.
- A prominent New Comparison action.
- Summary metrics for saved reports and recent activity.
- Recent report cards or rows showing client name, adviser, saved date, comparison period, and projected advantage.
- A My Reports / All Reports toggle. My Reports filters by the selected adviser ID; All Reports removes the adviser filter.
- A polished empty state with a Create Your First Comparison action.

The toggle is a convenience filter, not a permission boundary.

## Calculator

The original single-page calculator is migrated into the React application as focused components. Its calculations and interaction model remain unchanged.

The premium polish includes:

- Navy, ivory, warm white, and restrained gold surfaces.
- Editorial headings and stronger visual hierarchy.
- Refined scenario cards with less visible form chrome.
- Consistent input grouping, spacing, and control styling.
- A prominent result summary and clearer comparison narrative.
- A chart and key figures that visually lead the page.
- Responsive layouts for desktop, tablet, and mobile.

The calculator remains a single-page workspace rather than becoming a wizard.

## Reports

Saving a comparison records:

- Optional client name.
- Adviser ID and adviser display name.
- Calculator inputs and calculated outputs.
- Comparison period and projected advantage.
- Creation and update timestamps.

Firestore stores report history. A save failure must not clear or alter the active calculation. The application shows an actionable error and allows the adviser to retry.

Saved reports can be reopened. Report removal requires confirmation. Dates use Australian display formatting.

## Visual System

The attached Client Appointment Checklist establishes the reusable direction for ASG web application landing pages:

- Split navy and warm-white composition on large screens.
- Restrained gold borders, accents, and primary actions.
- Large serif editorial headings paired with clear sans-serif body text.
- Rounded outer frame, soft shadow, generous whitespace, and subtle geometric line motifs.
- Compact trust markers and concise supporting copy.
- A single obvious primary action.

Shared design tokens and reusable primitives will centralise colours, typography, cards, buttons, inputs, page surfaces, and responsive behaviour. The current SMSF landing page will receive additional spacing, typography, and detail polish while retaining its approved structure.

## Error and Empty States

- Missing adviser session: redirect to `/login`.
- Invalid adviser value: clear the session and return to the selector.
- Firestore unavailable: preserve local calculator state, show an error, and offer retry.
- Report unavailable: show a clear not-found state with a dashboard return action.
- No reports: show the designed first-use dashboard state.

## Verification

- Unit tests cover adviser session persistence, report filtering, and representative calculator outputs.
- Component tests cover dropdown activation, route protection, sign-out, and My Reports / All Reports behaviour.
- Regression fixtures compare migrated calculator results against the original implementation.
- Browser checks cover landing, dashboard, calculator, save/reopen, and responsive layouts.
- TypeScript, production build, and repository-defined tests must pass before completion.
- The production Vercel flow is verified from adviser selection through a saved report.

## Delivery Constraints

- Work occurs on `codex/smsf-premium-redesign`.
- Existing generated `app/dist` modifications are not included in feature commits.
- Existing calculator behaviour and data formats are preserved unless this specification explicitly changes them.
- Implementation stays within the existing `app` project so Vercel builds one cohesive application.
