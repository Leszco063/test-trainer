// Zusätzliche, automatisch erzeugte Aufgaben für die Prüfungsblöcke und Beispielaufgaben.

import { QUESTIONS } from "./fragen.js";
import { rand } from "./util.js";
import { generate, hasGenerator } from "./gen/index.js";

// Block (über seinen ersten Bereich) -> [Generator-Bereich, Anteil am Block]
const EXTRAS = {
  Logik: [["Figuren", 1 / 3], ["Logik", 1 / 6]],
  Mathe: [["Mathe", 1 / 3]],
  Konzentration: [["Konzentration", 1 / 2]],
  Diagramme: [["Diagramme", 1]],
  Deutsch: [["Deutsch", 1 / 5]],
};

function randomLevel() {
  const r = Math.random();
  return r < 0.25 ? 1 : r < 0.7 ? 2 : 3;
}

export function examExtras(section) {
  const out = [];
  for (const [genCat, share] of EXTRAS[section.cats[0]] || []) {
    const n = Math.round(section.count * share);
    for (let i = 0; i < n; i++) out.push(generate(genCat, randomLevel()));
  }
  return out;
}

// Beispielaufgabe vor einem Block (zählt nicht) – wie die Probefragen im echten Test
export function exampleQuestion(section, used) {
  const cat = section.cats[0];
  if (cat === "Logik") return generate("Figuren", 1);
  if (hasGenerator(cat) && cat !== "Merkfähigkeit") return generate(cat, 1);
  const pool = QUESTIONS.filter(q => section.cats.includes(q.cat) && q.level === 1 && !q.memo && !used.has(q.id));
  if (!pool.length) return null;
  const q = rand(pool);
  used.add(q.id);
  return q;
}
