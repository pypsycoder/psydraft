from pathlib import Path
import re

ROOT_DIR = Path(__file__).parent
SRC_DIR = ROOT_DIR / "src"
DIST_DIR = ROOT_DIR / "dist"

TEMPLATE_FILE = SRC_DIR / "index.template.html"
OUTPUT_FILE = DIST_DIR / "somnology.html"

INCLUDE_RE = re.compile(r"<!--\s*INCLUDE\s+(.+?)\s*-->")


def resolve_includes(text: str, base_dir: Path) -> str:
    """Recursively expand <!-- INCLUDE path/to/file --> directives."""

    def replacer(match: re.Match) -> str:
        rel_path = match.group(1).strip()
        file_path = base_dir / rel_path
        if not file_path.exists():
            raise FileNotFoundError(f"Include not found: {file_path}")
        content = file_path.read_text(encoding="utf-8")
        return resolve_includes(content, file_path.parent)

    return INCLUDE_RE.sub(replacer, text)


def build():
    DIST_DIR.mkdir(exist_ok=True)
    html = TEMPLATE_FILE.read_text(encoding="utf-8")
    full_html = resolve_includes(html, SRC_DIR)
    OUTPUT_FILE.write_text(full_html, encoding="utf-8")
    print(f"Собрано: {OUTPUT_FILE.relative_to(ROOT_DIR)}")


if __name__ == "__main__":
    build()
