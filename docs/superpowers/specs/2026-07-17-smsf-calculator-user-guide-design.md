# SMSF Comparison Calculator User Guide Design

## Purpose

Create a practical user guide for ASG staff who use the standalone SMSF Comparison Calculator during client appointments. The guide must help staff enter information consistently, explain the comparison clearly, interpret the outputs responsibly, and use the calculator's supporting controls.

## Source of truth

The standalone calculator in `public/index.html` is the product source of truth. The authenticated workspace under `app/` is outside the guide's scope.

The supplied `PIA Calculator - User Guide.pdf` is a structural and quality reference only. The SMSF guide will use calculator-specific content, ASG styling, and the current behaviour found in this repository.

## Audience and use context

- Primary audience: ASG staff.
- Primary setting: appointments with clients.
- Secondary use: onboarding and refresher training for staff.
- Tone: clear, practical, confident, and careful about the limits of projected results.

## Deliverables

Produce three matching deliverables:

1. An editable Microsoft Word document.
2. A polished PDF suitable for distribution and printing.
3. A printable HTML version that can be maintained or printed to PDF in a browser.

Final files will use stable, descriptive names and will be stored in appropriate output folders within the repository.

## Content structure

Target approximately 8 to 10 A4 pages, allowing the final page count to vary slightly when needed for clean layout.

1. Cover and purpose
2. Overview and important projection disclaimer
3. Appointment quick start
4. Input fields for Current Superannuation and SMSF with ASG + Partners
5. How to create a fair comparison
6. Salary sacrifice and projection period controls
7. Understanding the comparison summary and scenario results
8. Reading the balance chart, milestone table, and full yearly breakdown
9. Exporting CSV data, sharing a calculation, browser state, and resetting the example
10. Appointment talking points, troubleshooting, and best practices

## Required product details

The guide will explain the current standalone experience, including:

- Current superannuation balance
- Annual salary
- Employer contribution rate
- Growth rate selections for both scenarios
- Optional salary sacrifice percentage
- Projection periods from 5 to 30 years
- Copy controls for matching balance and salary
- Automatic recalculation after input changes and the Calculate button
- Starting balance, final projected balance, total contributions, total earnings or growth, and projected years
- Winning scenario and comparison differences
- Balance projection chart
- Milestone view and full yearly breakdown
- Full year-by-year CSV export
- Shareable links containing the calculator state
- Browser-local state restoration
- Reset to Example behaviour
- Input validation and common error messages

## Responsible presentation

The guide must make these points prominent:

- Results are illustrative estimates, not guaranteed outcomes.
- The calculator excludes tax, fees, insurance, contribution caps, contribution timing nuances, and market volatility.
- Figures do not constitute financial advice.
- Matching starting balances, salaries, employer rates, salary sacrifice settings, and projection periods creates the clearest like-for-like comparison.
- Different growth assumptions materially affect the result and should be explained openly to clients.
- If the selected periods differ, comparisons use the shorter projection period.

## Visual design

- Use an ASG-aligned navy, white, and gold palette based on the calculator.
- Use a clean handbook layout with clear numbered sections, short steps, tables, and restrained callout boxes.
- Use screenshots or cropped interface callouts only where they improve comprehension.
- Keep body text readable at normal print size and optimise for A4 portrait printing.
- Include consistent headers, footers, and page numbering in the Word and PDF outputs.
- Keep the HTML print layout visually aligned with the Word and PDF versions.

## Language and punctuation

- Use Australian English.
- Use Australian currency formatting.
- Use plain language suitable for staff speaking with clients.
- Use ASCII hyphens only.
- Do not use em dashes, en dashes, non-breaking hyphens, or decorative dash characters in any deliverable.

## Quality checks

- Reconcile all instructions against the actual standalone calculator behaviour.
- Scan all deliverables for prohibited dash characters.
- Check that no unsupported claim or feature is introduced.
- Render and inspect every Word and PDF page for clipping, overlap, poor page breaks, missing glyphs, and inconsistent spacing.
- Print-preview the HTML at A4 size and confirm that sections, tables, callouts, headers, and footers remain readable.
- Confirm the Word, PDF, and HTML versions contain equivalent substantive content.

## Out of scope

- The authenticated projection workspace under `app/`
- Changes to calculator code or calculation logic
- Financial, tax, legal, or investment advice
- New calculator features
- Detailed mathematical derivations beyond the explanation needed to interpret the displayed results
