// Speichern im Browser (localStorage). Das Format ist kompatibel mit der alten PC-Version
// (telekom_trainer_fortschritt.json) und wird über Export/Import zwischen Geräten übertragen.

import { QUESTIONS } from "./fragen.js";
import { CATEGORIES } from "./config.js";
import { nowStamp } from "./util.js";

const PROGRESS_KEY = "testTrainer.progress";
const SETTINGS_KEY = "testTrainer.settings";

function withDefaults(data) {
  data.runs = Array.isArray(data.runs) ? data.runs : [];
  data.fragen = data.fragen || {};      // Verlauf je Frage
  data.pruefungen = data.pruefungen || []; // Ergebnisse der Prüfungssimulation
  return data;
}

export function loadProgress() {
  try {
    const data = JSON.parse(localStorage.getItem(PROGRESS_KEY));
    if (data && typeof data === "object") return withDefaults(data);
  } catch (e) { /* leer oder kaputt -> neu anfangen */ }
  return withDefaults({});
}

export function saveProgress(data) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    return false; // Speicher voll oder gesperrt – Übung läuft trotzdem weiter
  }
}

export function importProgress(imported) {
  if (!imported || !Array.isArray(imported.runs)) throw new Error("Unbekanntes Format");
  saveProgress(withDefaults(imported));
}

export function loadSettings() {
  const defaults = {
    cats: Object.fromEntries(CATEGORIES.map(c => [c, true])),
    adaptive: true,
    level: 2,
    timer: true,
    count: 20,
  };
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    if (s) return { ...defaults, ...s, cats: { ...defaults.cats, ...(s.cats || {}) } };
  } catch (e) { /* Standardwerte */ }
  return defaults;
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) { /* egal */ }
}

export function saveRun(score, total, catStats, levelReached) {
  const data = loadProgress();
  data.runs.push({
    datum: nowStamp().slice(0, 16),
    score,
    total,
    prozent: total ? Math.round((score / total) * 100) : 0,
    kategorien: catStats,
    level_erreicht: levelReached,
  });
  saveProgress(data);
}

// Merkt sich pro Frage, wie oft sie kam und ob die letzte Antwort richtig war.
// Generierte Aufgaben (q.gen) haben keine feste ID und werden nicht einzeln gespeichert.
export function recordAnswer(q, isCorrect) {
  const data = loadProgress();
  if (!q.gen) {
    const entry = data.fragen[q.id] || { gesehen: 0, richtig: 0 };
    entry.gesehen += 1;
    if (isCorrect) entry.richtig += 1;
    entry.letzte_richtig = isCorrect;
    entry.zuletzt = nowStamp();
    data.fragen[q.id] = entry;
  }
  saveProgress(data);
  return data.fragen;
}

export function historySummary(history, questions = QUESTIONS) {
  let seen = 0, wrong = 0;
  for (const q of questions) {
    const e = history[q.id];
    if (e) seen++;
    if (e && e.letzte_richtig === false) wrong++;
  }
  return { seen, wrong };
}

export function categoryWeakness(data) {
  const totals = {};
  for (const run of data.runs) {
    for (const [cat, st] of Object.entries(run.kategorien || {})) {
      totals[cat] = totals[cat] || { richtig: 0, gesamt: 0 };
      totals[cat].richtig += st.richtig;
      totals[cat].gesamt += st.gesamt;
    }
  }
  return Object.entries(totals)
    .filter(([, t]) => t.gesamt > 0)
    .map(([cat, t]) => ({ cat, pct: Math.round((t.richtig / t.gesamt) * 100), total: t.gesamt }))
    .sort((a, b) => a.pct - b.pct);
}

export function trend(data) {
  const runs = data.runs;
  if (runs.length < 2) return null;
  const recent = runs.length >= 3 ? runs.slice(-3) : runs;
  const older = runs.length >= 6 ? runs.slice(-6, -3) : runs.slice(0, runs.length - recent.length);
  if (!older.length) return null;
  const avg = list => list.reduce((s, r) => s + r.prozent, 0) / list.length;
  return avg(recent) - avg(older);
}
