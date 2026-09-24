// Zusätzliche, automatisch erzeugte Aufgaben für die Prüfungsabschnitte.

import { generate } from "./gen/index.js";

// Abschnitt (über seinen ersten Bereich) -> [Generator-Bereich, Anteil am Abschnitt]
const EXTRAS = {
  Logik: [["Figuren", 1 / 3], ["Logik", 1 / 6]],
  Mathe: [["Mathe", 1 / 3], ["Diagramme", 1 / 6]],
  Konzentration: [["Konzentration", 1 / 2]],
  Diagramme: [["Diagramme", 1]],
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
