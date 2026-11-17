# SMSF DRAPS-Style Login Gate Design

## Intent

Bring the SMSF adviser gate into the same visual family as the new Daily DRAPS gate so ASG internal web apps feel consistent. The screen remains a lightweight adviser selector rather than secure authentication.

## Selected approach

Use a close structural match to the DRAPS gate, adapted for the SMSF comparison. This was selected over lightly restyling the current screen or extracting a shared cross-app component now. A shared component can follow once the SMSF production flow is live.

## Screen design

- Centre a compact, bordered two-panel gate on a warm ivory canvas.
- Use an approximately 40/60 split: navy brand panel on the left and ivory action panel on the right.
- Left panel: ASG / Amplify Solutions Group wordmark treatment, subtle contour lines and gold arc, stacked `SMSF Growth Comparison` title, short italic gold statement, and one plain supporting line.
- Right panel: `SMSF COMPARISON` eyebrow, `Start Your Comparison` serif heading, lock divider, one instruction line, and an inset adviser-selection card.
- Adviser card: circular user icon, `ADVISER NAME` label, existing staff dropdown, and no email/password fields.
- Primary action: wide gold `Enter Workspace` button below the card. It remains disabled until an adviser is selected.
- Preserve keyboard focus, visible labels, mobile stacking, and minimum 44px touch targets.

## Behaviour

- Keep the existing adviser list and session-storage model.
- Selecting a valid adviser and submitting stores the adviser session and navigates to `/dashboard`.
- Dashboard, calculator, reports, calculations, and saved-report behaviour are unchanged.
- The login screen must not depend on Firebase or environment variables.

## Constraints and non-goals

- Do not copy DRAPS source code; reproduce the visual system using the SMSF app's existing React and Tailwind setup.
- Do not introduce authentication, backend storage, new dependencies, or new routes.
- Do not merge to `main` until the revised gate passes tests, production build, and browser verification.

## Acceptance criteria

- At desktop width, the composition closely matches the supplied DRAPS reference while clearly identifying the SMSF comparison product.
- At mobile width, the brand panel condenses cleanly above the action panel without hiding the dropdown or button.
- `Enter Workspace` is disabled with no adviser, enabled after selection, and opens the dashboard.
- Existing login, adviser-route, dashboard, and calculator tests continue to pass.
