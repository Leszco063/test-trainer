"""
Prüft den Fragenpool (fragen.py) und schreibt ihn als JavaScript-Modul nach js/fragen.js.

    python tools/export.py          # prüfen + exportieren
    python tools/export.py --check  # nur prüfen, ob js/fragen.js aktuell ist (für GitHub Actions)

Die Fragen-IDs werden genauso berechnet wie in der alten PC-Version, damit gespeicherter
Fortschritt (welche Fragen man schon hatte) gültig bleibt.
"""

import collections
import hashlib
import json
import os
import sys

TOOLS_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(TOOLS_DIR)
OUT_FILE = os.path.join(ROOT_DIR, "js", "fragen.js")

sys.path.insert(0, TOOLS_DIR)
from fragen import QUESTIONS  # noqa: E402

REQUIRED = ("cat", "level", "q", "opts", "correct", "explain")


def question_id(q):
    raw = q["cat"] + "|" + q["q"] + "|" + "|".join(q["opts"])
    return hashlib.md5(raw.encode("utf-8")).hexdigest()[:12]


def validate(questions):
    errors = []
    for i, q in enumerate(questions):
        where = f"Frage {i + 1} ({q.get('cat', '?')}: {str(q.get('q', ''))[:50]})"
        for key in REQUIRED:
            if key not in q or q[key] in ("", None, []):
                errors.append(f"{where}: Feld '{key}' fehlt")
        if q.get("level") not in (1, 2, 3):
            errors.append(f"{where}: level muss 1, 2 oder 3 sein")
        opts = q.get("opts", [])
        if not isinstance(q.get("correct"), int) or not 0 <= q["correct"] < len(opts):
            errors.append(f"{where}: 'correct' zeigt auf keine Antwort")
        if len(set(opts)) != len(opts):
            errors.append(f"{where}: doppelte Antwortoptionen")
        if len(opts) < 2:
            errors.append(f"{where}: weniger als 2 Antwortoptionen")
        if q.get("cat") == "Merkfähigkeit" and not q.get("memo"):
            errors.append(f"{where}: Merkfähigkeit ohne 'memo'")
    ids = collections.Counter(question_id(q) for q in questions)
    for qid, n in ids.items():
        if n > 1:
            errors.append(f"Doppelte Frage (ID {qid}) kommt {n}-mal vor")
    return errors


def build_js(questions):
    data = []
    for q in questions:
        entry = {"id": question_id(q)}
        entry.update(q)
        data.append(entry)
    return (
        "// Automatisch erzeugt von tools/export.py aus tools/fragen.py – nicht von Hand bearbeiten!\n"
        f"export const QUESTIONS = {json.dumps(data, ensure_ascii=False, indent=1)};\n"
    )


def main():
    errors = validate(QUESTIONS)
    if errors:
        print(f"{len(errors)} Fehler im Fragenpool:")
        for e in errors:
            print("  -", e)
        sys.exit(1)

    content = build_js(QUESTIONS)
    if "--check" in sys.argv:
        current = open(OUT_FILE, encoding="utf-8").read() if os.path.exists(OUT_FILE) else ""
        if current != content:
            print("js/fragen.js ist nicht aktuell – bitte 'python tools/export.py' ausführen.")
            sys.exit(1)
        print(f"OK: {len(QUESTIONS)} Fragen gültig, js/fragen.js ist aktuell.")
        return

    with open(OUT_FILE, "w", encoding="utf-8", newline="\n") as f:
        f.write(content)
    counts = collections.Counter(q["cat"] for q in QUESTIONS)
    print(f"{len(QUESTIONS)} Fragen exportiert nach js/fragen.js")
    for cat, n in sorted(counts.items()):
        print(f"  {cat}: {n}")


if __name__ == "__main__":
    main()
