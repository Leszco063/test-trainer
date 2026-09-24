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
