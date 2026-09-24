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
const genCats = ["Figuren", "Mathe", "Konzentration", "Logik", "Diagramme", "Deutsch", "Merkfähigkeit"].filter(hasGenerator);
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

// 1a) Dreh-/Spiegel-Aufgaben: genau eine Antwort ist eine Drehung der Vorlage, und zwar die richtige
function svgCells(svg) {
  const rects = [...svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)"/g)].map(m => m.slice(1).map(Number));
  const w = rects[0][2], mx = Math.min(...rects.map(r => r[0])), my = Math.min(...rects.map(r => r[1]));
  return rects.map(([x, y]) => [Math.round((x - mx) / w), Math.round((y - my) / w)]);
}
const normCells = c => {
  const mx = Math.min(...c.map(p => p[0])), my = Math.min(...c.map(p => p[1]));
  return c.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(p => p.join(",")).join(";");
};
let rotChecked = 0;
for (let i = 0; i < 6000 && rotChecked < 500; i++) {
  const q = generate("Figuren", 1 + (i % 3));
  if (!q.q.includes("nur gedreht")) continue;
  let c = svgCells(q.stemHtml);
  const rots = [];
  for (let k = 0; k < 4; k++) { rots.push(normCells(c)); c = c.map(([x, y]) => [-y, x]); }
  const isRot = q.optHtml.map(h => rots.includes(normCells(svgCells(h))));
  if (isRot.filter(Boolean).length !== 1 || !isRot[q.correct]) fail(`Dreh-Aufgabe mehrdeutig oder falsch: ${JSON.stringify(isRot)} correct=${q.correct}`);
  rotChecked++;
}
console.log(`✓ Dreh-/Spiegelaufgaben geometrisch geprüft: ${rotChecked}`);

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

// 1e) Tagesziel und Serie
localStorage.store = {};
const tage = {};
tage[today] = { anzahl: 30, ziel: 30 };                // heute erreicht
tage[addDays(today, -1)] = { anzahl: 35, ziel: 30 };   // gestern erreicht
tage[addDays(today, -2)] = { anzahl: 10, ziel: 30 };   // vorgestern nicht
for (let i = 10; i <= 12; i++) tage[addDays(today, -i)] = { anzahl: 40, ziel: 30 }; // alte Serie von 3 Tagen
localStorage.setItem("testTrainer.progress", JSON.stringify({ runs: [], fragen: {}, tage }));
let ds = sp.dailyStatus();
if (ds.serie !== 2) fail(`Serie sollte 2 sein, ist ${ds.serie}`);
if (ds.rekord !== 3) fail(`Rekord sollte 3 sein, ist ${ds.rekord}`);
if (!ds.erreicht || ds.heute !== 30) fail(`Heute sollte erreicht sein (30/30)`);
delete tage[today];
localStorage.setItem("testTrainer.progress", JSON.stringify({ runs: [], fragen: {}, tage }));
ds = sp.dailyStatus();
if (ds.serie !== 1) fail(`Serie ohne heutige Übung sollte bis gestern zählen (1), ist ${ds.serie}`);
console.log("✓ Tagesziel & Serie korrekt berechnet");

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
