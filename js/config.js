import { QUESTIONS } from "./fragen.js";

export const TIMER_SECONDS = 45;                  // Zeitdruck pro Frage im Übungsmodus
export const MEMO_SECONDS = { 1: 6, 2: 8, 3: 12 }; // Einprägezeit bei Merkfähigkeitsfragen
export const REPEAT_SHARE = 0.3;                  // Anteil fälliger Wiederholungen in normalen Runden

export const LEVEL_NAMES = { 1: "Leicht", 2: "Mittel", 3: "Schwer" };
export const LEVEL_COLORS = { 1: "var(--lvl1)", 2: "var(--lvl2)", 3: "var(--lvl3)" };

// Bereiche aus dem Fragenpool plus Bereiche, deren Aufgaben komplett generiert werden
export const POOL_CATEGORIES = [...new Set(QUESTIONS.map(q => q.cat))].sort();
export const GENERATED_ONLY = [];
export const CATEGORIES = [...POOL_CATEGORIES, ...GENERATED_ONLY].sort();
