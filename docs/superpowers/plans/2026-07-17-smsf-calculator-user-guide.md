# SMSF Comparison Calculator User Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce an accurate, ASG-branded SMSF Comparison Calculator user guide for staff appointments in editable Word, polished PDF, and printable HTML formats.

**Architecture:** Keep the guide copy in one Python content module, then use a focused builder to produce the DOCX and HTML versions from that shared source. Render the DOCX to PDF with the bundled document workflow so the PDF and editable version remain aligned, and verify all three outputs with automated text checks plus page-by-page visual inspection.

**Tech Stack:** Bundled Python 3, python-docx, HTML5, CSS print media, LibreOffice headless rendering, Poppler or the bundled document renderer, pytest-style Python assertions, and PowerShell-compatible commands.

## Global Constraints

- The standalone calculator in `public/index.html` is the product source of truth.
- The authenticated workspace under `app/` is outside the guide's scope.
- Primary audience: ASG staff using the calculator during client appointments.
- Produce an editable Microsoft Word document, a polished PDF, and a printable HTML version.
- Target approximately 8 to 10 A4 pages, allowing slight variation for clean layout.
- Use Australian English and Australian currency formatting.
- Use ASCII hyphens only.
- Do not use em dashes, en dashes, non-breaking hyphens, or decorative dash characters.
- Do not change calculator code or calculation logic.
- Do not introduce financial, tax, legal, or investment advice.
- Preserve the user's existing uncommitted `.bak` file changes.

---

### Task 1: Establish the shared guide content and accuracy checks

**Files:**
- Create: `tools/user-guide/guide_content.py`
- Create: `tools/user-guide/verify_guide.py`
- Read: `public/index.html`
- Read: `docs/superpowers/specs/2026-07-17-smsf-calculator-user-guide-design.md`

**Interfaces:**
- Consumes: current labels, control behaviour, validation, calculation ordering, comparison period handling, export behaviour, and disclaimer text from `public/index.html`.
- Produces: `GUIDE_META: dict[str, str]`, `SECTIONS: list[dict[str, object]]`, `FIELD_ROWS: list[dict[str, str]]`, and `FORBIDDEN_DASHES: tuple[str, ...]` for both output builders.

- [ ] **Step 1: Write the content verifier before the content module**

Create `tools/user-guide/verify_guide.py` with checks that import the shared content, flatten all strings recursively, reject `\u2014`, `\u2013`, `\u2011`, and `\u2212`, and assert that required phrases exist:

```python
from pathlib import Path
import importlib.util

ROOT = Path(__file__).resolve().parents[2]
CONTENT_PATH = Path(__file__).with_name("guide_content.py")
REQUIRED = (
    "Current Superannuation",
    "SMSF with ASG + Partners",
    "Employer Contribution Rate",
    "Salary Sacrifice",
    "Projection Milestones",
    "Export CSV",
    "Share",
    "Reset to Example",
    "illustrative",
    "market volatility",
)
FORBIDDEN = ("\u2014", "\u2013", "\u2011", "\u2212")

def load_content():
    spec = importlib.util.spec_from_file_location("guide_content", CONTENT_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module

def flatten(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for item in value.values():
            yield from flatten(item)
    elif isinstance(value, (list, tuple)):
        for item in value:
            yield from flatten(item)

def main():
    module = load_content()
    text = "\n".join(flatten([module.GUIDE_META, module.SECTIONS, module.FIELD_ROWS]))
    assert all(token in text for token in REQUIRED)
    assert not any(char in text for char in FORBIDDEN)
    assert "If the selected periods differ" in text
    assert "shorter projection period" in text
    print("Guide content checks passed")

if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run the verifier and confirm the expected failure**

Run:

```powershell
& $bundledPython tools/user-guide/verify_guide.py
```

Expected: failure because `tools/user-guide/guide_content.py` does not yet exist.

- [ ] **Step 3: Create the shared guide content**

Create `tools/user-guide/guide_content.py` with typed metadata and structured sections. Include the ten approved sections, a field table for both scenarios, appointment talking points, troubleshooting, and this exact core disclaimer:

```python
GUIDE_META = {
    "title": "SMSF Comparison Calculator User Guide",
    "subtitle": "Appointment guide for ASG staff",
    "version": "1.0",
    "date": "17/07/2026",
}

CORE_DISCLAIMER = (
    "This calculator provides illustrative estimates only. Results are not guaranteed and do not constitute "
    "financial, tax, legal, or investment advice. The calculator excludes tax, fees, insurance, contribution "
    "caps, contribution timing nuances, and market volatility."
)
```

Represent each section as a dictionary with a `number`, `title`, and ordered `blocks`. Use block types `paragraph`, `steps`, `bullets`, `callout`, and `table`. Include these behaviour-specific facts:

```python
BEHAVIOUR_FACTS = (
    "The calculator recalculates about 500 milliseconds after an input changes.",
    "The Calculate button can be used to refresh the results immediately.",
    "The Copy buttons transfer the current balance or salary from the Current Superannuation scenario to the SMSF scenario.",
    "If the selected periods differ, the comparison uses the shorter projection period.",
    "Projection Milestones shows selected years, while Show full yearly breakdown displays every year in a contained scroll area.",
    "Export CSV downloads the complete year-by-year data as smsf_comparison.csv.",
    "Share copies a URL containing both scenarios and their settings.",
    "The latest settings are also stored in the current browser.",
    "Reset to Example restores the calculator's example values and clears the saved browser state.",
)
```

- [ ] **Step 4: Run the verifier and reconcile every statement against the calculator**

Run:

```powershell
& $bundledPython tools/user-guide/verify_guide.py
rg -n "DEBOUNCE_DELAY|copy-right|Math.min|Export CSV|share-btn|STORAGE_KEY|resetExample|MAX_BALANCE|MAX_SALARY" public/index.html
```

Expected: `Guide content checks passed`, with each guide behaviour supported by a matching implementation location in `public/index.html`.

- [ ] **Step 5: Commit the shared content and verifier**

```powershell
git add tools/user-guide/guide_content.py tools/user-guide/verify_guide.py
git commit -m "docs: draft SMSF calculator guide content"
```

---

### Task 2: Build the printable HTML guide

**Files:**
- Create: `tools/user-guide/build_html.py`
- Create: `tools/user-guide/guide.css`
- Create: `output/html/SMSF-Comparison-Calculator-User-Guide.html`
- Read: `tools/user-guide/guide_content.py`

**Interfaces:**
- Consumes: `GUIDE_META`, `SECTIONS`, and `FIELD_ROWS` from `guide_content.py`.
- Produces: a self-contained HTML document at `output/html/SMSF-Comparison-Calculator-User-Guide.html` with embedded CSS and no external assets.

- [ ] **Step 1: Extend the verifier with HTML output assertions**

Add checks to `verify_guide.py` that, when the HTML exists, confirm its title, all section headings, disclaimer text, A4 print rule, page footer, and absence of forbidden dash characters:

```python
html_path = ROOT / "output/html/SMSF-Comparison-Calculator-User-Guide.html"
if html_path.exists():
    html = html_path.read_text(encoding="utf-8")
    assert "@page" in html and "size: A4" in html
    assert GUIDE_META["title"] in html
    assert CORE_DISCLAIMER in html
    assert "page-footer" in html
    assert not any(char in html for char in FORBIDDEN)
```

- [ ] **Step 2: Run the verifier and confirm it does not yet validate an HTML artifact**

Run:

```powershell
& $bundledPython tools/user-guide/verify_guide.py
```

Expected: content checks pass and the HTML-specific branch is skipped because the file does not exist.

- [ ] **Step 3: Implement the HTML builder and print stylesheet**

Create `build_html.py` to escape all content with `html.escape`, render each supported block type, load `guide.css`, and write a complete UTF-8 document. The stylesheet must define:

```css
:root {
  --navy: #1e3a5f;
  --navy-dark: #12263f;
  --gold: #b8933a;
  --gold-soft: #f4ecd7;
  --ink: #1f2933;
  --muted: #5f6b76;
  --line: #d8dee5;
}
@page { size: A4; margin: 17mm 16mm 18mm; }
body { margin: 0; color: var(--ink); font: 10.5pt/1.45 Arial, sans-serif; }
.cover { min-height: 245mm; display: grid; align-content: center; background: var(--navy-dark); color: white; padding: 18mm; }
h1, h2, h3 { color: var(--navy); page-break-after: avoid; }
.cover h1 { color: white; }
.callout { border-left: 4px solid var(--gold); background: var(--gold-soft); padding: 10px 12px; }
table { width: 100%; border-collapse: collapse; page-break-inside: avoid; }
th { background: var(--navy); color: white; text-align: left; }
th, td { border: 1px solid var(--line); padding: 7px 8px; vertical-align: top; }
section { break-inside: auto; }
.page-footer { color: var(--muted); font-size: 8.5pt; border-top: 1px solid var(--line); margin-top: 18px; padding-top: 6px; }
@media screen { body { max-width: 210mm; margin: 24px auto; box-shadow: 0 4px 24px #0002; } }
```

- [ ] **Step 4: Generate and verify the HTML**

Run:

```powershell
& $bundledPython tools/user-guide/build_html.py
& $bundledPython tools/user-guide/verify_guide.py
```

Expected: the HTML file is created and `Guide content checks passed` is printed.

- [ ] **Step 5: Print-preview the HTML at A4 size**

Open the generated HTML in a browser, use print preview with A4 paper and background graphics enabled, and inspect every page for clipped tables, orphan headings, excessive gaps, and footer overlap. Adjust only `guide.css` or block-level break classes until the preview is clean.

- [ ] **Step 6: Commit the HTML builder and artifact**

```powershell
git add tools/user-guide/build_html.py tools/user-guide/guide.css output/html/SMSF-Comparison-Calculator-User-Guide.html
git commit -m "docs: add printable SMSF calculator guide"
```

---

### Task 3: Build the editable Word guide

**Files:**
- Create: `tools/user-guide/build_docx.py`
- Create: `output/docx/SMSF-Comparison-Calculator-User-Guide.docx`
- Read: `tools/user-guide/guide_content.py`
- Read: `C:/Users/great/.codex/plugins/cache/openai-primary-runtime/documents/26.715.12143/skills/documents/tasks/create_edit.md`

**Interfaces:**
- Consumes: the same shared guide content used by the HTML builder.
- Produces: an A4 DOCX with ASG-aligned styles, semantic headings, formatted tables, callouts, headers, footers, and page numbering.

- [ ] **Step 1: Extend the verifier with DOCX structural assertions**

Add a `python-docx` check that opens the artifact when present and asserts the title, every numbered section heading, at least one table, header text, footer text, and no forbidden dash characters in paragraphs or table cells:

```python
from docx import Document

docx_path = ROOT / "output/docx/SMSF-Comparison-Calculator-User-Guide.docx"
if docx_path.exists():
    doc = Document(docx_path)
    paragraphs = [p.text for p in doc.paragraphs]
    cells = [cell.text for table in doc.tables for row in table.rows for cell in row.cells]
    doc_text = "\n".join(paragraphs + cells)
    assert GUIDE_META["title"] in doc_text
    assert len(doc.tables) >= 1
    assert not any(char in doc_text for char in FORBIDDEN)
```

- [ ] **Step 2: Implement the Word builder**

Create `build_docx.py` using `python-docx`. Set A4 dimensions, 17 mm side margins, 18 mm top and bottom margins, Arial body text, navy headings, gold accents, repeating table headers, 0.15 inch cell margins, and a footer containing the guide title plus a PAGE field. Render the shared block types with helpers whose signatures are:

```python
def configure_document(doc: Document) -> None: ...
def add_cover(doc: Document, meta: dict[str, str]) -> None: ...
def add_heading(doc: Document, number: str, title: str) -> None: ...
def add_callout(doc: Document, title: str, text: str) -> None: ...
def add_table(doc: Document, headers: list[str], rows: list[list[str]]) -> None: ...
def add_block(doc: Document, block: dict[str, object]) -> None: ...
def add_page_number(paragraph) -> None: ...
```

Use built-in Heading 1 and Heading 2 styles for navigation, and avoid the built-in Title style. Keep table rows together where practical, repeat header rows, and never reduce body text below 9 pt.

- [ ] **Step 3: Generate and structurally verify the DOCX**

Run:

```powershell
& $bundledPython tools/user-guide/build_docx.py
& $bundledPython tools/user-guide/verify_guide.py
```

Expected: the DOCX exists and all content, structure, and punctuation checks pass.

- [ ] **Step 4: Render the DOCX to PNG and PDF**

Run:

```powershell
New-Item -ItemType Directory -Force tmp/user-guide/docx-render | Out-Null
& $bundledPython "C:/Users/great/.codex/plugins/cache/openai-primary-runtime/documents/26.715.12143/skills/documents/render_docx.py" `
  output/docx/SMSF-Comparison-Calculator-User-Guide.docx `
  --output_dir tmp/user-guide/docx-render `
  --emit_pdf
```

Expected: one PNG per page plus a non-empty rendered PDF. The page count should be approximately 8 to 10 pages unless clean pagination requires a small variation.

- [ ] **Step 5: Inspect every rendered DOCX page**

Review every PNG at full readable size. Check cover alignment, page breaks, headers, footers, page numbers, callout padding, table widths, table cell wrapping, heading placement, missing glyphs, and whitespace. Correct `build_docx.py`, regenerate, and rerender until no visible defect remains.

- [ ] **Step 6: Commit the DOCX builder and artifact**

```powershell
git add tools/user-guide/build_docx.py output/docx/SMSF-Comparison-Calculator-User-Guide.docx
git commit -m "docs: add editable SMSF calculator user guide"
```

---

### Task 4: Finalise and verify the PDF deliverable

**Files:**
- Create: `output/pdf/SMSF-Comparison-Calculator-User-Guide.pdf`
- Read: `tmp/user-guide/docx-render/SMSF-Comparison-Calculator-User-Guide.pdf`
- Modify as required: `tools/user-guide/build_docx.py`
- Modify as required: `tools/user-guide/guide_content.py`

**Interfaces:**
- Consumes: the visually approved DOCX and its rendered PDF.
- Produces: the final distributable PDF with the same substantive content as the DOCX and HTML.

- [ ] **Step 1: Copy the approved rendered PDF to the final output path**

Run:

```powershell
New-Item -ItemType Directory -Force output/pdf | Out-Null
Copy-Item -LiteralPath tmp/user-guide/docx-render/SMSF-Comparison-Calculator-User-Guide.pdf `
  -Destination output/pdf/SMSF-Comparison-Calculator-User-Guide.pdf
```

- [ ] **Step 2: Extend the verifier with PDF text and punctuation checks**

Use `pypdf.PdfReader` to assert that the PDF has pages, includes the title and core disclaimer, contains all numbered section headings, and contains none of the forbidden dash characters:

```python
from pypdf import PdfReader

pdf_path = ROOT / "output/pdf/SMSF-Comparison-Calculator-User-Guide.pdf"
if pdf_path.exists():
    reader = PdfReader(str(pdf_path))
    pdf_text = "\n".join(page.extract_text() or "" for page in reader.pages)
    assert len(reader.pages) >= 1
    assert GUIDE_META["title"] in pdf_text
    assert CORE_DISCLAIMER in pdf_text
    assert not any(char in pdf_text for char in FORBIDDEN)
```

- [ ] **Step 3: Run final cross-format automated checks**

Run:

```powershell
& $bundledPython tools/user-guide/verify_guide.py
git diff --check
```

Expected: `Guide content checks passed` and no whitespace errors in guide files.

- [ ] **Step 4: Perform final PDF visual inspection**

Render the final PDF to page PNGs using the available bundled Poppler command or inspect the PNGs produced by `render_docx.py`. Check every page for clipping, overlap, missing glyphs, inconsistent margins, unreadable tables, and poor section transitions. If any defect is found, fix the DOCX builder or content, regenerate all affected deliverables, and repeat the complete verification.

- [ ] **Step 5: Confirm substantive consistency across formats**

Extract text from the DOCX, HTML, and PDF, normalise whitespace, and verify that every section title, field label, disclaimer sentence, appointment step, and troubleshooting item appears in all three outputs. Differences in page numbers, navigation labels, and format-specific footer text are acceptable.

- [ ] **Step 6: Commit the final PDF and verification updates**

```powershell
git add tools/user-guide/verify_guide.py output/pdf/SMSF-Comparison-Calculator-User-Guide.pdf
git commit -m "docs: finalise SMSF calculator user guide"
```

---

### Task 5: Final delivery audit

**Files:**
- Verify: `output/html/SMSF-Comparison-Calculator-User-Guide.html`
- Verify: `output/docx/SMSF-Comparison-Calculator-User-Guide.docx`
- Verify: `output/pdf/SMSF-Comparison-Calculator-User-Guide.pdf`

**Interfaces:**
- Consumes: all completed guide deliverables and verification evidence.
- Produces: a clean handoff with three final files and no claim beyond completed checks.

- [ ] **Step 1: Run the complete verification suite from a clean command invocation**

```powershell
& $bundledPython tools/user-guide/verify_guide.py
git status --short
```

Expected: all guide checks pass. The only unrelated working-tree changes remain the user's pre-existing `.bak` files.

- [ ] **Step 2: Check file existence and non-zero size**

```powershell
Get-Item `
  output/html/SMSF-Comparison-Calculator-User-Guide.html, `
  output/docx/SMSF-Comparison-Calculator-User-Guide.docx, `
  output/pdf/SMSF-Comparison-Calculator-User-Guide.pdf | `
  Select-Object FullName, Length
```

Expected: all three files exist and have non-zero lengths.

- [ ] **Step 3: Report the final deliverables and verified checks**

Use the repository's Final Report format. Link the DOCX, PDF, and HTML with absolute paths. State the page count observed in the final render, the automated punctuation and content results, and the completed page-by-page visual review. Do not report calculator build or application tests because calculator code was not changed.
