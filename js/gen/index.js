// Übersicht aller Aufgaben-Generatoren.
// GENERATED_ONLY: Bereiche ohne feste Fragen – alle Aufgaben werden erzeugt.
// Andere Bereiche mit Generator bekommen einen Teil ihrer Aufgaben erzeugt (GEN_SHARE).

import { generateFigure } from "./figuren.js";
import { retry } from "./gemeinsam.js";

const GENERATORS = {
  Figuren: generateFigure,
};

export const GENERATED_ONLY = ["Figuren"];
export const GEN_SHARE = 0.35;

export function hasGenerator(cat) {
  return Object.prototype.hasOwnProperty.call(GENERATORS, cat);
}

export function generate(cat, level) {
  return retry(() => GENERATORS[cat](level));
}
