// Gemeinsame Helfer für alle Aufgaben-Generatoren.

import { shuffle } from "../util.js";

let counter = 0;

// Generierte Aufgaben brauchen nur eine eindeutige ID für die laufende Runde
export function genId(prefix) {
  counter += 1;
  return `gen-${prefix}-${Date.now().toString(36)}-${counter}`;
}

// Baut eine Text-Aufgabe mit gemischten Antworten. Doppelte Ablenker werden aussortiert;
// "format" wandelt Zahlen in Anzeigetext um (z. B. 12.5 -> "12,50 €").
export function textQuestion({ cat, level, q, answer, distractors, explain, format = String, extra = {} }) {
  const answerText = format(answer);
  const seen = new Set([answerText]);
  const wrong = [];
  for (const d of distractors) {
    if (typeof d === "number" && (!Number.isFinite(d) || d < 0)) continue;
    const t = format(d);
    if (seen.has(t)) continue;
    seen.add(t);
    wrong.push(t);
    if (wrong.length === 3) break;
  }
  if (wrong.length < 3) throw new Error(`Zu wenige Ablenker für: ${q}`);
  const opts = shuffle([answerText, ...wrong]);
  return { id: genId(cat), cat, level, q, opts, correct: opts.indexOf(answerText), explain, gen: true, ...extra };
}

// Ruft einen Generator auf und versucht es erneut, falls er keine gültige Aufgabe bauen konnte
export function retry(fn, tries = 20) {
  let lastError;
  for (let i = 0; i < tries; i++) {
    try {
      return fn();
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}
