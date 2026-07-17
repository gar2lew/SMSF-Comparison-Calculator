from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
GUIDE = ROOT / "output" / "html" / "SMSF-Comparison-Calculator-User-Guide.html"
FORBIDDEN_DASHES = ("\u2014", "\u2013", "\u2011", "\u2212")
REQUIRED_TEXT = (
    "SMSF Comparison Calculator User Guide",
    "Appointment guide for ASG staff",
    "Current Superannuation Setup",
    "SMSF with ASG + Partners",
    "Current Superannuation Balance",
    "Annual Salary",
    "Employer Contribution Rate",
    "Salary Sacrifice",
    "Years of Performance",
    "Projection Milestones",
    "Show full yearly breakdown",
    "Export CSV",
    "Share",
    "Reset to Example",
    "shorter projection period",
    "illustrative",
    "market volatility",
)


class GuideParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text: list[str] = []
        self.ids: set[str] = set()

    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key == "id" and value:
                self.ids.add(value)

    def handle_data(self, data):
        self.text.append(data)


def main() -> None:
    assert GUIDE.exists(), f"Guide not found: {GUIDE}"
    source = GUIDE.read_text(encoding="utf-8")
    parser = GuideParser()
    parser.feed(source)
    visible_text = " ".join(" ".join(parser.text).split())

    missing = [item for item in REQUIRED_TEXT if item not in visible_text]
    assert not missing, f"Missing required content: {missing}"
    found_dashes = [char for char in FORBIDDEN_DASHES if char in source]
    assert not found_dashes, f"Forbidden dash characters found: {found_dashes}"
    assert "@page" in source and "size: A4" in source
    assert "@media print" in source
    assert "print-color-adjust: exact" in source
    assert source.count('class="guide-page') == 8
    assert len(parser.ids) == len(set(parser.ids))
    assert GUIDE.stat().st_size > 20_000
    print(f"HTML guide checks passed: {GUIDE.stat().st_size:,} bytes, 8 print pages")


if __name__ == "__main__":
    main()
