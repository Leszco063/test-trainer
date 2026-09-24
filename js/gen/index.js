// Übersicht aller Aufgaben-Generatoren.
// GENERATED_ONLY: Bereiche ohne feste Fragen – alle Aufgaben werden erzeugt.
// Andere Bereiche mit Generator bekommen einen Teil ihrer Aufgaben erzeugt (GEN_SHARE).

import { generateFigure } from "./figuren.js";
import { generateMath } from "./rechnen.js";
import { generateConcentration } from "./konzentration.js";
import { generateSeries } from "./reihen.js";
import { generateChart } from "./diagramme.js";
import { generateSpelling } from "./deutsch.js";
import { generateSheetQuestion } from "./merkblatt.js";
import { retry } from "./gemeinsam.js";

const GENERATORS = {
  Figuren: generateFigure,
  Diagramme: generateChart,
  Mathe: generateMath,
  Konzentration: generateConcentration,
  Logik: generateSeries,
  Deutsch: generateSpelling,
  Merkfähigkeit: generateSheetQuestion,
};

export const GENERATED_ONLY = ["Figuren", "Diagramme"];
export const GEN_SHARE = 0.35;

export function hasGenerator(cat) {
  return Object.prototype.hasOwnProperty.call(GENERATORS, cat);
}

export function generate(cat, level) {
  return retry(() => GENERATORS[cat](level));
}
