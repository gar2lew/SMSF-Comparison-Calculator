# SMSF Comparison Calculator HTML User Guide Implementation Plan

**Goal:** Produce one self-contained, editable HTML guide for ASG staff, optimised for screen use and A4 PDF printing.

**Source of truth:** `public/index.html` and the approved design specification.

## Constraints

- Cover the standalone calculator only.
- Do not change calculator code.
- Use Australian English and Australian currency formatting.
- Use ASCII hyphens only. Do not use Unicode dash characters.
- Keep all styling and content in one portable HTML file.
- Preserve existing user-owned `.bak` changes in the main checkout.

## Tasks

- [ ] Reconcile calculator labels and behaviours against `public/index.html`.
- [ ] Create `output/html/SMSF-Comparison-Calculator-User-Guide.html` with ASG navy and gold styling.
- [ ] Include overview, quick start, field guidance, fair comparison guidance, result interpretation, exports, sharing, troubleshooting, and appointment best practices.
- [ ] Add A4 print CSS, controlled page breaks, page labels, and print instructions.
- [ ] Create `tools/user-guide/verify_html_guide.py` to check required content and prohibited dash characters.
- [ ] Run the verifier and `git diff --check`.
- [ ] Inspect the guide at desktop and mobile widths.
- [ ] Print to PDF and inspect every rendered page for layout defects.
- [ ] Commit the verified guide and report the final HTML file.
