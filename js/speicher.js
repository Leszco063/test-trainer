// Speichern im Browser (localStorage). Das Format ist kompatibel mit der alten PC-Version
// (telekom_trainer_fortschritt.json) und wird über Export/Import zwischen Geräten übertragen.

import { QUESTIONS } from "./fragen.js";
import { CATEGORIES } from "./config.js";
import { nowStamp, dateKey, addDays } from "./util.js";

// Leitner-System: Box 1–5. Nach einer Antwort kommt die Frage nach so vielen Tagen wieder.
export const BOX_INTERVALS = [0, 0, 1, 3, 7, 16]; // Index = Box
export const LEARNED_BOX = 5;

// Alte Einträge (vor dem Leitner-System) bekommen eine Box und ein Fälligkeitsdatum
export function withBox(entry) {
  if (!entry || entry.box) return entry;
  const last = (entry.zuletzt || nowStamp()).slice(0, 10);
  return entry.letzte_richtig === false
    ? { ...entry, box: 1, faellig: last }
    : { ...entry, box: 2, faellig: addDays(last, BOX_INTERVALS[2]) };
}

const PROGRESS_KEY = "testTrainer.progress";
const SETTINGS_KEY = "testTrainer.settings";

function withDefaults(data) {
  data.runs = Array.isArray(data.runs) ? data.runs : [];
  data.fragen = data.fragen || {};      // Verlauf je Frage
  data.pruefungen = data.pruefungen || []; // Ergebnisse der Prüfungssimulation
  data.tage = data.tage || {};           // { "2026-09-24": { anzahl, ziel } } für Tagesziel und Serie
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
    dailyGoal: 30,
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
    const old = data.fragen[q.id];
    const entry = old ? withBox(old) : { gesehen: 0, richtig: 0 };
    // Neu und gleich richtig -> vermutlich bekannt, direkt Box 3. Neu und falsch -> Box 1.
    if (!old) entry.box = isCorrect ? 3 : 1;
    else entry.box = isCorrect ? Math.min(LEARNED_BOX, entry.box + 1) : 1;
    entry.faellig = addDays(dateKey(), BOX_INTERVALS[entry.box]);
    entry.gesehen += 1;
    if (isCorrect) entry.richtig += 1;
    entry.letzte_richtig = isCorrect;
    entry.zuletzt = nowStamp();
    data.fragen[q.id] = entry;
  }
  // Tageszähler: jede beantwortete Aufgabe zählt, das Ziel des Tages wird mitgespeichert
  const day = dateKey();
  const t = data.tage[day] || { anzahl: 0 };
  t.anzahl += 1;
  t.ziel = loadSettings().dailyGoal;
  data.tage[day] = t;
  saveProgress(data);
  return data.fragen;
}

// Tagesziel, aktuelle Serie und Rekord
export function dailyStatus(data = loadProgress()) {
  const goal = loadSettings().dailyGoal;
  const today = dateKey();
  const met = key => {
    const t = data.tage[key];
    return !!t && t.anzahl >= (t.ziel || goal);
  };
  const heute = data.tage[today] ? data.tage[today].anzahl : 0;

  // Serie: heute zählt mit, wenn erreicht – sonst ist sie bis gestern noch nicht gerissen
  let serie = 0;
  let key = met(today) ? today : addDays(today, -1);
  while (met(key)) { serie += 1; key = addDays(key, -1); }

  let rekord = 0, run = 0, prev = null;
  for (const k of Object.keys(data.tage).sort()) {
    if (!met(k)) { run = 0; prev = k; continue; }
    run = prev && addDays(prev, 1) === k && met(prev) ? run + 1 : 1;
    rekord = Math.max(rekord, run);
    prev = k;
  }

  const woche = Array.from({ length: 7 }, (_, i) => {
    const k = addDays(today, i - 6);
    return { key: k, erreicht: met(k), anzahl: data.tage[k] ? data.tage[k].anzahl : 0 };
  });
  return { heute, ziel: goal, erreicht: heute >= goal, serie, rekord: Math.max(rekord, serie), woche };
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

export function isDue(entry, today = dateKey()) {
  const e = withBox(entry);
  return !!e && e.faellig <= today;
}

// Heute fällige Fragen, die mit der niedrigsten Box (= am wackeligsten) zuerst
export function dueQuestions(history, questions = QUESTIONS, today = dateKey()) {
  return questions
    .filter(q => history[q.id] && isDue(history[q.id], today))
    .sort((a, b) => withBox(history[a.id]).box - withBox(history[b.id]).box);
}

// Verteilung auf die Boxen: [neu, box1, ..., box5]
export function boxStats(history, questions = QUESTIONS) {
  const counts = [0, 0, 0, 0, 0, 0];
  for (const q of questions) {
    const e = history[q.id];
    counts[e ? withBox(e).box : 0] += 1;
  }
  return counts;
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
