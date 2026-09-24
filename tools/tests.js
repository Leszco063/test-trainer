// Automatische Tests für die Aufgaben-Generatoren und die App-Struktur.
//   node tools/tests.js
// Läuft auch bei jedem Upload auf GitHub (siehe .github/workflows/pruefen.yml).

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { GENERATED_ONLY, hasGenerator, generate } from "../js/gen/index.js";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const RUNS_PER_LEVEL = 1500;
let failures = 0;

function fail(msg) {
  failures += 1;
  if (failures <= 30) console.error("  FEHLER:", msg);
}

function checkQuestion(q, where) {
  for (const key of ["id", "cat", "level", "q", "opts", "correct", "explain"]) {
    if (q[key] === undefined || q[key] === null || q[key] === "") fail(`${where}: Feld '${key}' fehlt`);
  }
  if (!Array.isArray(q.opts) || q.opts.length < 2) fail(`${where}: zu wenige Antworten`);
  if (!(q.correct >= 0 && q.correct < q.opts.length)) fail(`${where}: 'correct' ungültig (${q.correct})`);
  if (new Set(q.opts).size !== q.opts.length) fail(`${where}: doppelte Antworten ${JSON.stringify(q.opts)}`);
  if (q.optHtml && q.optHtml.length !== q.opts.length) fail(`${where}: optHtml passt nicht zu opts`);
  const text = JSON.stringify(q);
  if (/NaN|undefined|Infinity|\[object /.test(text)) fail(`${where}: kaputter Wert in ${text.slice(0, 200)}`);
}

// 1) Generatoren
const genCats = ["Figuren", "Mathe", "Konzentration", "Logik", "Diagramme"].filter(hasGenerator);
for (const cat of genCats) {
  let count = 0;
  for (const level of [1, 2, 3]) {
    for (let i = 0; i < RUNS_PER_LEVEL; i++) {
      let q;
      try {
        q = generate(cat, level);
      } catch (e) {
        fail(`${cat} L${level}: Generator-Fehler ${e.message}`);
        continue;
      }
      checkQuestion(q, `${cat} L${level}`);
      if (q.cat !== cat) fail(`${cat}: falscher Bereich ${q.cat}`);
      if (q.level !== level) fail(`${cat}: falsches Level ${q.level} statt ${level}`);
      count += 1;
    }
  }
  console.log(`✓ ${cat}: ${count} erzeugte Aufgaben geprüft`);
}
for (const cat of GENERATED_ONLY) if (!hasGenerator(cat)) fail(`${cat} ist GENERATED_ONLY, hat aber keinen Generator`);

// 1b) Inhaltliche Stichproben: Rechenaufgaben selbst nachrechnen
const parseDe = s => Number(s.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, ""));
let checked = 0;
for (let i = 0; i < 3000; i++) {
  const level = 1 + (i % 3);
  const k = generate("Konzentration", level);
  const m = k.q.match(/^Rechne im Kopf: (.+) = \?$/);
  if (m) {
    const expr = m[1].replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
    const expected = Function(`return (${expr});`)();
    if (parseDe(k.opts[k.correct]) !== expected) fail(`Kopfrechnen falsch: ${k.q} -> ${k.opts[k.correct]} (erwartet ${expected})`);
    checked++;
  }
  const p = generate("Mathe", level);
  const pm = p.q.match(/^Wie viel sind ([\d.,]+) % von ([\d.,]+)\?$/);
  if (pm) {
    const expected = Math.round((parseDe(pm[1]) * parseDe(pm[2])) / 100 * 100) / 100;
    if (parseDe(p.opts[p.correct]) !== expected) fail(`Prozentrechnung falsch: ${p.q} -> ${p.opts[p.correct]} (erwartet ${expected})`);
    checked++;
  }
}
console.log(`✓ Stichproben nachgerechnet: ${checked} Aufgaben`);

// 1c) Zu jedem Bereich gibt es einen Spickzettel
const { QUESTIONS } = await import("../js/fragen.js");
const { cardForQuestion, CARDS } = await import("../js/lernkarten.js");
for (const cat of new Set([...QUESTIONS.map(q => q.cat), ...GENERATED_ONLY])) {
  if (!cardForQuestion({ cat, q: "", explain: "" })) fail(`Kein Spickzettel für Bereich ${cat}`);
}
if (new Set(CARDS.map(c => c.id)).size !== CARDS.length) fail("Spickzettel-IDs doppelt");
console.log(`✓ Spickzettel: ${CARDS.length} Karten, alle Bereiche abgedeckt`);

// 1d) Leitner-System (mit simuliertem Browser-Speicher)
globalThis.localStorage = {
  store: {},
  getItem(k) { return this.store[k] ?? null; },
  setItem(k, v) { this.store[k] = String(v); },
};
const sp = await import("../js/speicher.js");
const { dateKey, addDays } = await import("../js/util.js");
const today = dateKey();
const qA = { id: "testA", cat: "Mathe" }, qB = { id: "testB", cat: "Mathe" };
let h = sp.recordAnswer(qA, true);
if (h.testA.box !== 3 || h.testA.faellig !== addDays(today, 3)) fail(`Leitner: neu+richtig sollte Box 3 / +3 Tage sein, ist ${JSON.stringify(h.testA)}`);
h = sp.recordAnswer(qA, true);
if (h.testA.box !== 4 || h.testA.faellig !== addDays(today, 7)) fail(`Leitner: Box 3 + richtig sollte Box 4 / +7 Tage sein`);
h = sp.recordAnswer(qA, false);
if (h.testA.box !== 1 || h.testA.faellig !== today) fail(`Leitner: falsch sollte Box 1 / heute sein`);
h = sp.recordAnswer(qB, false);
if (h.testB.box !== 1 || !sp.isDue(h.testB)) fail(`Leitner: neu+falsch sollte heute fällig sein`);
const migrated = sp.withBox({ gesehen: 2, richtig: 1, letzte_richtig: false, zuletzt: "2026-01-01 10:00:00" });
if (migrated.box !== 1 || migrated.faellig !== "2026-01-01") fail(`Leitner: Migration alter Einträge fehlerhaft`);
const due = sp.dueQuestions(h, [qA, qB, { id: "x" }]);
if (due.length !== 2) fail(`Leitner: dueQuestions sollte 2 liefern, liefert ${due.length}`);
if (h.testA.gesehen !== 3 || h.testA.richtig !== 2) fail(`Leitner: Zähler falsch`);
const genQ = { id: "gen-1", gen: true };
if (sp.recordAnswer(genQ, true)["gen-1"]) fail(`Generierte Aufgaben dürfen nicht im Verlauf landen`);
console.log("✓ Leitner-System: Boxen, Fälligkeit und Migration korrekt");

// 2) Jede Datei in js/ und css/ muss im Service Worker stehen (sonst fehlt sie offline)
const sw = readFileSync(join(ROOT, "sw.js"), "utf-8");
function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
const files = [...walk(join(ROOT, "js")), ...walk(join(ROOT, "css"))].map(p => relative(ROOT, p).replaceAll("\\", "/"));
for (const f of files) if (!sw.includes(`"${f}"`)) fail(`sw.js: Datei fehlt in der Offline-Liste: ${f}`);
console.log(`✓ Service Worker: ${files.length} Dateien geprüft`);

if (failures) {
  console.error(`\n${failures} Fehler gefunden.`);
  process.exit(1);
}
console.log("\nAlle Tests bestanden.");
