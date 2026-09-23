/*
 * Einstellungstest-Trainer – Web-Version fürs Handy.
 * Gleiche Logik wie telekom_trainer.py: adaptive Schwierigkeit, Zeitdruck, Merkphase,
 * Fragen-Gedächtnis (neue Fragen zuerst, Fehler kommen wieder) und Persönlichkeitsteil.
 * Fortschritt liegt im Browser-Speicher (localStorage) und nutzt dasselbe Format wie
 * telekom_trainer_fortschritt.json – kann also zwischen PC und Handy übertragen werden.
 */
"use strict";

const QUESTIONS = window.QUESTIONS;
const PERSONALITY_ITEMS = window.PERSONALITY_ITEMS;
const CONFIG = window.CONFIG;
const LEVEL_NAMES = { 1: "Leicht", 2: "Mittel", 3: "Schwer" };
const LEVEL_COLORS = { 1: "var(--lvl1)", 2: "var(--lvl2)", 3: "var(--lvl3)" };
const CATEGORIES = [...new Set(QUESTIONS.map(q => q.cat))].sort();
const SCALE_LABELS = ["Trifft gar nicht zu", "Trifft eher nicht zu", "Teils, teils", "Trifft eher zu", "Trifft voll zu"];

const PROGRESS_KEY = "testTrainer.progress";
const SETTINGS_KEY = "testTrainer.settings";

const app = document.getElementById("app");
let tickTimer = null;   // läuft für Zeitdruck- oder Merk-Countdown
let S = null;           // aktuelle Übungsrunde
let PS = null;          // aktuelle Persönlichkeitsrunde

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------

function esc(text) {
  return String(text).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function rand(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function stopTick() {
  if (tickTimer) clearInterval(tickTimer);
  tickTimer = null;
}

function render(html) {
  stopTick();
  app.innerHTML = html;
  window.scrollTo(0, 0);
}

function on(selector, event, handler) {
  app.querySelectorAll(selector).forEach(el => el.addEventListener(event, handler));
}

function barColor(pct) {
  return pct >= 70 ? "var(--ok)" : pct >= 50 ? "var(--lvl2)" : "var(--bad)";
}

function now() {
  const d = new Date();
  const p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

// ---------------------------------------------------------------------------
// Speichern / Laden
// ---------------------------------------------------------------------------

function loadProgress() {
  try {
    const data = JSON.parse(localStorage.getItem(PROGRESS_KEY));
    if (data && Array.isArray(data.runs)) {
      data.fragen = data.fragen || {};
      return data;
    }
  } catch (e) { /* leer oder kaputt -> neu anfangen */ }
  return { runs: [], fragen: {} };
}

function saveProgress(data) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
  } catch (e) { /* Speicher voll oder gesperrt – Übung läuft trotzdem weiter */ }
}

function loadSettings() {
  const defaults = { cats: Object.fromEntries(CATEGORIES.map(c => [c, true])), adaptive: true, level: 2, timer: true, count: 20 };
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    if (s) return { ...defaults, ...s, cats: { ...defaults.cats, ...(s.cats || {}) } };
  } catch (e) { /* Standardwerte */ }
  return defaults;
}

function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) { /* egal */ }
}

function saveRun(score, total, catStats, levelReached) {
  const data = loadProgress();
  data.runs.push({
    datum: now().slice(0, 16),
    score,
    total,
    prozent: total ? Math.round((score / total) * 100) : 0,
    kategorien: catStats,
    level_erreicht: levelReached,
  });
  saveProgress(data);
}

function recordAnswer(q, isCorrect) {
  const data = loadProgress();
  const entry = data.fragen[q.id] || { gesehen: 0, richtig: 0 };
  entry.gesehen += 1;
  if (isCorrect) entry.richtig += 1;
  entry.letzte_richtig = isCorrect;
  entry.zuletzt = now();
  data.fragen[q.id] = entry;
  saveProgress(data);
  return data.fragen;
}

function historySummary(history, questions = QUESTIONS) {
  let seen = 0, wrong = 0;
  for (const q of questions) {
    const e = history[q.id];
    if (e) seen++;
    if (e && e.letzte_richtig === false) wrong++;
  }
  return { seen, wrong };
}

function categoryWeakness(data) {
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

function trend(data) {
  const runs = data.runs;
  if (runs.length < 2) return null;
  const recent = runs.length >= 3 ? runs.slice(-3) : runs;
  const older = runs.length >= 6 ? runs.slice(-6, -3) : runs.slice(0, runs.length - recent.length);
  if (!older.length) return null;
  const avg = list => list.reduce((s, r) => s + r.prozent, 0) / list.length;
  return avg(recent) - avg(older);
}

// ---------------------------------------------------------------------------
// Startbildschirm
// ---------------------------------------------------------------------------

function showStart() {
  const settings = loadSettings();
  const data = loadProgress();
  const { seen, wrong } = historySummary(data.fragen);

  let progressHtml = "";
  if (data.runs.length) {
    const last = data.runs.slice(-5).map(r => `${r.prozent}%`).join(" → ");
    let trendHtml = "";
    const tr = trend(data);
    if (tr !== null) {
      if (tr > 3) trendHtml = `<p class="trend-up">↑ Du wirst besser (+${Math.round(tr)} Prozentpunkte)</p>`;
      else if (tr < -3) trendHtml = `<p class="trend-down">↓ Etwas schwächer als zuvor (${Math.round(tr)} Prozentpunkte)</p>`;
      else trendHtml = `<p class="trend-flat">→ Stabil, ungefähr gleichbleibend</p>`;
    }
    const weakness = categoryWeakness(data);
    const weakest = weakness.filter(w => w.pct < 70).slice(0, 3);
    const weakHtml = weakness.length
      ? (weakest.length
        ? `<p class="warn-text">Nochmal ansehen: ${weakest.map(w => `${esc(w.cat)} (${w.pct}%)`).join(", ")}</p>`
        : `<p class="trend-up">Alle Bereiche über 70 % – solide Basis!</p>`)
      : "";
    progressHtml = `
      <section class="card">
        <h3>Dein Fortschritt</h3>
        <p>Letzte Runden: <strong>${last}</strong></p>
        ${trendHtml}${weakHtml}
        <button class="link" id="stats">Vollständige Statistik →</button>
      </section>`;
  }

  render(`
    <h1>Einstellungstest-Trainer</h1>
    <p class="muted small">${QUESTIONS.length} Fragen · bearbeitet: ${seen} · zuletzt falsch: ${wrong}</p>
    ${progressHtml}

    <section class="card">
      <h3>Bereiche</h3>
      <div class="chips">
        ${CATEGORIES.map(c => `<button class="chip ${settings.cats[c] ? "on" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("")}
      </div>
    </section>

    <section class="card">
      <div class="row">
        <div>Adaptive Schwierigkeit<div class="muted small">passt sich deiner Leistung an</div></div>
        <label class="switch"><input type="checkbox" id="adaptive" ${settings.adaptive ? "checked" : ""}><span></span></label>
      </div>
      <div class="row" id="levelRow" style="${settings.adaptive ? "display:none" : ""}">
        <div style="width:100%">Feste Stufe
          <div class="segmented">
            ${[1, 2, 3].map(l => `<button data-level="${l}" class="${settings.level === l ? "on" : ""}">${LEVEL_NAMES[l]}</button>`).join("")}
          </div>
        </div>
      </div>
      <div class="row">
        <div>Zeitdruck<div class="muted small">${CONFIG.TIMER_SECONDS} Sekunden pro Frage</div></div>
        <label class="switch"><input type="checkbox" id="timer" ${settings.timer ? "checked" : ""}><span></span></label>
      </div>
      <div class="row">
        <div>Anzahl Fragen</div>
        <div class="stepper">
          <button id="minus" aria-label="weniger">−</button>
          <output id="count">${settings.count}</output>
          <button id="plus" aria-label="mehr">+</button>
        </div>
      </div>
    </section>

    <button class="btn" id="start">Übung starten</button>
    ${wrong ? `<button class="btn warn" id="fehler">Fehler wiederholen (${wrong})</button>` : ""}
    <button class="btn secondary" id="personality">Persönlichkeitsteil üben</button>
  `);

  on(".chip", "click", e => {
    const cat = e.currentTarget.dataset.cat;
    settings.cats[cat] = !settings.cats[cat];
    e.currentTarget.classList.toggle("on", settings.cats[cat]);
    saveSettings(settings);
  });
  on("#adaptive", "change", e => {
    settings.adaptive = e.target.checked;
    document.getElementById("levelRow").style.display = settings.adaptive ? "none" : "";
    saveSettings(settings);
  });
  on("[data-level]", "click", e => {
    settings.level = Number(e.currentTarget.dataset.level);
    app.querySelectorAll("[data-level]").forEach(b => b.classList.toggle("on", Number(b.dataset.level) === settings.level));
    saveSettings(settings);
  });
  on("#timer", "change", e => { settings.timer = e.target.checked; saveSettings(settings); });
  const setCount = n => {
    settings.count = Math.max(5, Math.min(QUESTIONS.length, n));
    document.getElementById("count").textContent = settings.count;
    saveSettings(settings);
  };
  on("#minus", "click", () => setCount(settings.count - 5));
  on("#plus", "click", () => setCount(settings.count + 5));
  on("#start", "click", () => startSession("normal"));
  on("#fehler", "click", () => startSession("fehler"));
  on("#personality", "click", showPersonalityIntro);
  on("#stats", "click", showStats);
}

// ---------------------------------------------------------------------------
// Übungsrunde
// ---------------------------------------------------------------------------

function startSession(mode) {
  const settings = loadSettings();
  const history = loadProgress().fragen;
  const activeCats = CATEGORIES.filter(c => settings.cats[c]);
  let pool = QUESTIONS.filter(q => activeCats.includes(q.cat));
  if (!pool.length) {
    alert("Bitte mindestens einen Bereich auswählen.");
    return;
  }
  if (mode === "fehler") {
    pool = pool.filter(q => history[q.id] && history[q.id].letzte_richtig === false);
    if (!pool.length) {
      alert("In den ausgewählten Bereichen gibt es keine offenen Fehler.");
      return;
    }
  }
  S = {
    mode,
    pool,
    history,
    adaptive: settings.adaptive,
    fixedLevel: settings.level,
    timer: settings.timer,
    total: mode === "fehler" ? pool.length : Math.min(settings.count, pool.length),
    level: settings.adaptive ? 1 : settings.level,
    streakCorrect: 0,
    streakWrong: 0,
    used: new Set(),
    questions: [],
    index: 0,
    score: 0,
    wrong: [],
    catStats: {},
    memoDone: -1,
  };
  pickNext();
  showQuestion();
}

function chooseByHistory(candidates) {
  const h = S.history;
  const unseen = candidates.filter(q => !h[q.id]);
  const wrong = candidates.filter(q => h[q.id] && h[q.id].letzte_richtig === false);
  if (wrong.length && (!unseen.length || Math.random() < CONFIG.REPEAT_SHARE)) return rand(wrong);
  if (unseen.length) return rand(unseen);
  const oldest = candidates.slice().sort((a, b) => (h[a.id].zuletzt || "").localeCompare(h[b.id].zuletzt || ""));
  return rand(oldest.slice(0, 3));
}

function pickNext() {
  const free = q => !S.used.has(q.id);
  let candidates;
  if (S.mode === "fehler") {
    candidates = S.pool.filter(free);
  } else {
    const level = S.adaptive ? S.level : S.fixedLevel;
    candidates = S.pool.filter(q => q.level === level && free(q));
    if (!candidates.length) {
      for (const fb of [level - 1, level + 1, level - 2, level + 2]) {
        if (fb < 1 || fb > 3) continue;
        candidates = S.pool.filter(q => q.level === fb && free(q));
        if (candidates.length) break;
      }
    }
    if (!candidates.length) candidates = S.pool.filter(free);
  }
  if (!candidates.length) return null;
  const q = S.mode === "fehler" ? rand(candidates) : chooseByHistory(candidates);
  S.used.add(q.id);
  S.questions.push(q);
  return q;
}

function historyTag(q) {
  const e = S.history[q.id];
  if (!e) return `<span style="color:var(--info)" class="badge">Neu</span>`;
  if (e.letzte_richtig === false) return `<span style="color:var(--warn)" class="badge">Wiederholung – letztes Mal falsch</span>`;
  return `<span class="muted">Schon ${e.gesehen}× gehabt</span>`;
}

function questionHeader(q) {
  const modeLabel = S.mode === "fehler" ? "Fehler-Training" : (S.adaptive ? "Adaptiv" : "");
  return `
    <div class="qhead"><span>Frage ${S.index + 1} / ${S.total}</span><span>Richtig: ${S.score}</span></div>
    <div class="qmeta">
      <span class="badge" style="color:${LEVEL_COLORS[q.level]}">● ${LEVEL_NAMES[q.level]}</span>
      ${historyTag(q)}
      <span class="muted" style="margin-left:auto">${modeLabel}</span>
    </div>
    <div class="progress"><div style="width:${(S.index / S.total) * 100}%"></div></div>
    <div class="cat">${esc(q.cat)}</div>`;
}

function showMemo(q) {
  let left = CONFIG.MEMO_SECONDS[q.level] || 8;
  render(`
    ${questionHeader(q)}
    <p class="qtext">Präge dir Folgendes ein:</p>
    <div class="memo">${esc(q.memo)}</div>
    <div class="timer" id="memoTimer">Noch ${left} Sekunden</div>
    <p class="muted small center">Danach wird der Inhalt ausgeblendet und die Frage erscheint.</p>
    <button class="btn" id="memoDone">Hab's mir gemerkt – weiter</button>
  `);
  const finish = () => { S.memoDone = S.index; showQuestion(); };
  on("#memoDone", "click", finish);
  tickTimer = setInterval(() => {
    left -= 1;
    if (left <= 0) { finish(); return; }
    document.getElementById("memoTimer").textContent = `Noch ${left} Sekunden`;
  }, 1000);
}

function showQuestion() {
  const q = S.questions[S.index];
  if (q.memo && S.memoDone !== S.index) {
    showMemo(q);
    return;
  }
  const order = shuffle(q.opts.map((_, i) => i));
  render(`
    ${questionHeader(q)}
    <p class="qtext">${esc(q.q)}</p>
    <div id="opts">
      ${order.map(i => `<button class="opt" data-i="${i}">${esc(q.opts[i])}</button>`).join("")}
    </div>
    <div id="feedback"></div>
    <div class="timer" id="timer"></div>
    <button class="btn" id="next" style="display:none">${S.index + 1 >= S.total ? "Zum Ergebnis" : "Weiter"}</button>
  `);
  S.answered = false;
  on(".opt", "click", e => checkAnswer(Number(e.currentTarget.dataset.i)));
  on("#next", "click", nextQuestion);

  if (S.timer) {
    let left = CONFIG.TIMER_SECONDS;
    const el = document.getElementById("timer");
    el.textContent = `⏱ ${left} s`;
    tickTimer = setInterval(() => {
      left -= 1;
      el.textContent = `⏱ ${left} s`;
      el.classList.toggle("low", left <= 10);
      if (left <= 0) checkAnswer(-1);
    }, 1000);
  }
}

function checkAnswer(chosen) {
  if (S.answered) return;
  S.answered = true;
  stopTick();
  const q = S.questions[S.index];
  const isCorrect = chosen === q.correct;

  const cs = S.catStats[q.cat] = S.catStats[q.cat] || { richtig: 0, gesamt: 0 };
  cs.gesamt += 1;
  if (isCorrect) cs.richtig += 1;
  S.history = recordAnswer(q, isCorrect);

  app.querySelectorAll(".opt").forEach(btn => {
    const i = Number(btn.dataset.i);
    btn.disabled = true;
    if (i === q.correct) btn.classList.add("correct");
    else if (i === chosen) btn.classList.add("wrong");
  });

  let head;
  if (isCorrect) {
    S.score += 1;
    S.streakCorrect += 1;
    S.streakWrong = 0;
    head = "Richtig!";
  } else {
    S.streakWrong += 1;
    S.streakCorrect = 0;
    S.wrong.push(q);
    head = chosen === -1 ? "Zeit abgelaufen." : "Nicht ganz.";
  }

  let levelNote = "";
  if (S.adaptive && S.mode === "normal") {
    const before = S.level;
    if (S.streakCorrect >= 2 && S.level < 3) { S.level += 1; S.streakCorrect = 0; }
    else if (S.streakWrong >= 2 && S.level > 1) { S.level -= 1; S.streakWrong = 0; }
    if (S.level !== before) levelNote = `<span class="explain muted small">Schwierigkeit wird ${S.level > before ? "höher" : "niedriger"} gestellt.</span>`;
  }

  const fb = document.getElementById("feedback");
  fb.className = `feedback ${isCorrect ? "ok" : "bad"}`;
  fb.innerHTML = `<strong>${head}</strong><span class="explain">${esc(q.explain)}</span>${levelNote}`;
  document.getElementById("timer").textContent = "";
  const next = document.getElementById("next");
  next.style.display = "block";
  next.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function nextQuestion() {
  S.index += 1;
  if (S.index < S.total && pickNext()) showQuestion();
  else showResult();
}

function showResult() {
  const total = S.questions.length;
  const pct = total ? Math.round((S.score / total) * 100) : 0;
  const before = loadProgress().runs;
  let lastPct = before.length ? before[before.length - 1].prozent : null;

  if (S.mode === "fehler") lastPct = null;  // Fehler-Training zählt nicht in den Verlauf
  else saveRun(S.score, total, S.catStats, S.level);

  let cmp = "";
  if (lastPct !== null) {
    const diff = pct - lastPct;
    if (diff > 0) cmp = `<p class="center trend-up">↑ ${diff} Prozentpunkte besser als letzte Runde (${lastPct}%)</p>`;
    else if (diff < 0) cmp = `<p class="center trend-down">↓ ${-diff} Prozentpunkte schwächer als letzte Runde (${lastPct}%)</p>`;
    else cmp = `<p class="center trend-flat">→ Gleiches Ergebnis wie letzte Runde (${lastPct}%)</p>`;
  }

  let extra = "";
  if (S.mode === "fehler") {
    const { wrong } = historySummary(S.history);
    extra = `<p class="center"><strong>${S.score} Fehler ausgebessert</strong> · insgesamt noch offen: ${wrong}</p>`;
  } else if (S.adaptive) {
    extra = `<p class="center">Zuletzt erreichtes Level: <strong>${LEVEL_NAMES[S.level]}</strong></p>`;
  }

  const wrongByCat = {};
  S.wrong.forEach(q => { wrongByCat[q.cat] = (wrongByCat[q.cat] || 0) + 1; });
  const wrongHtml = S.wrong.length
    ? `<section class="card"><h3>Fehler nach Bereich</h3>${Object.entries(wrongByCat).map(([c, n]) => `<p>${esc(c)}: ${n} Fehler</p>`).join("")}</section>`
    : "";

  render(`
    <h2 class="center">${S.mode === "fehler" ? "Fehler-Training beendet" : "Ergebnis"}</h2>
    <div class="big">${S.score} / ${total}</div>
    <p class="center muted">${pct} % richtig</p>
    ${cmp}${extra}${wrongHtml}
    <button class="btn" id="again">Zurück zum Start</button>
  `);
  on("#again", "click", showStart);
}

// ---------------------------------------------------------------------------
// Statistik
// ---------------------------------------------------------------------------

function showStats() {
  const data = loadProgress();
  const last10 = data.runs.slice(-10);
  const weakness = categoryWeakness(data);

  const historyHtml = last10.length
    ? `<div class="history">${last10.map(r => `
        <div class="col"><span>${r.prozent}%</span><div style="height:${Math.max(2, r.prozent)}%;background:${barColor(r.prozent)}"></div></div>`).join("")}
      </div>`
    : `<p class="muted">Noch keine Runden.</p>`;

  const catHtml = weakness.length
    ? weakness.map(w => `
        <div class="bar-row"><span>${esc(w.cat)}</span>
          <div class="bar"><div style="width:${w.pct}%;background:${barColor(w.pct)}"></div></div>
          <span class="bar-val">${w.pct}%</span></div>`).join("")
    : `<p class="muted">Noch keine Daten.</p>`;

  const coverHtml = CATEGORIES.map(cat => {
    const qs = QUESTIONS.filter(q => q.cat === cat);
    const { seen, wrong } = historySummary(data.fragen, qs);
    return `<span class="${wrong ? "warn-text" : ""}">${esc(cat)}: ${seen}/${qs.length}${wrong ? ` (${wrong} offen)` : ""}</span>`;
  }).join("");

  render(`
    <h2>Deine Statistik</h2>
    <section class="card"><h3>Verlauf der letzten Runden</h3>${historyHtml}</section>
    <section class="card"><h3>Trefferquote je Bereich</h3>${catHtml}</section>
    <section class="card"><h3>Bearbeitete Fragen</h3><div class="grid2">${coverHtml}</div></section>
    <section class="card">
      <h3>Fortschritt sichern</h3>
      <p class="small muted">Als Datei speichern oder vom PC-Programm übernehmen (telekom_trainer_fortschritt.json).</p>
      <button class="btn secondary" id="export">Fortschritt exportieren</button>
      <button class="btn secondary" id="import">Fortschritt importieren</button>
      <input type="file" id="importFile" accept=".json,application/json" style="display:none">
    </section>
    <button class="btn" id="back">Zurück</button>
  `);

  on("#back", "click", showStart);
  on("#export", "click", () => {
    const blob = new Blob([JSON.stringify(loadProgress(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "telekom_trainer_fortschritt.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  on("#import", "click", () => document.getElementById("importFile").click());
  on("#importFile", "change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (!imported || !Array.isArray(imported.runs)) throw new Error("Format");
        if (!confirm("Der aktuelle Fortschritt auf diesem Gerät wird durch die Datei ersetzt. Fortfahren?")) return;
        imported.fragen = imported.fragen || {};
        saveProgress(imported);
        showStats();
      } catch (err) {
        alert("Die Datei konnte nicht gelesen werden. Ist es eine telekom_trainer_fortschritt.json?");
      }
    };
    reader.readAsText(file);
  });
}

// ---------------------------------------------------------------------------
// Persönlichkeitsteil
// ---------------------------------------------------------------------------

function showPersonalityIntro() {
  render(`
    <h2>Persönlichkeitsteil üben</h2>
    <section class="card">
      <p>In vielen Online-Assessments schätzt du Aussagen auf einer Skala ein – von „trifft gar nicht zu“ bis „trifft voll zu“. Richtig oder falsch gibt es nicht.</p>
      <p><strong>Worauf es ankommt:</strong></p>
      <ul class="hints">
        <li>Ehrlich und zügig antworten – nicht lange grübeln.</li>
        <li>Einheitlich bleiben: Ähnliche Aussagen kommen oft mehrfach vor, teils umgekehrt formuliert. Widersprüche fallen auf.</li>
        <li>Nicht nur Extremwerte wählen, aber auch nicht alles auf „teils, teils“.</li>
      </ul>
      <p class="small muted">${PERSONALITY_ITEMS.length} Aussagen. Die Auswertung ist nur ein Hinweis zum Format, keine echte Bewertung, und wird nicht gespeichert.</p>
    </section>
    <button class="btn" id="go">Starten</button>
    <button class="btn ghost" id="back">Zurück</button>
  `);
  on("#go", "click", () => {
    PS = { items: shuffle(PERSONALITY_ITEMS), index: 0, answers: [] };
    showPersonalityItem();
  });
  on("#back", "click", showStart);
}

function showPersonalityItem() {
  const item = PS.items[PS.index];
  render(`
    <div class="qhead"><span>Aussage ${PS.index + 1} / ${PS.items.length}</span></div>
    <div class="progress" style="margin-top:8px"><div style="width:${(PS.index / PS.items.length) * 100}%"></div></div>
    <p class="statement">${esc(item.text)}</p>
    <div class="scale">
      ${SCALE_LABELS.map((label, i) => `<button class="opt" data-v="${i + 1}">${label}</button>`).join("")}
    </div>
    <button class="btn ghost" id="cancel">Abbrechen</button>
  `);
  on("[data-v]", "click", e => {
    PS.answers.push({ item, value: Number(e.currentTarget.dataset.v) });
    PS.index += 1;
    if (PS.index < PS.items.length) showPersonalityItem();
    else showPersonalityResult();
  });
  on("#cancel", "click", showStart);
}

function showPersonalityResult() {
  const byDim = {};
  for (const { item, value } of PS.answers) {
    const scored = item.rev ? 6 - value : value;
    (byDim[item.dim] = byDim[item.dim] || []).push({ item, scored });
  }

  const contradictions = [];
  const rows = Object.entries(byDim).map(([dim, entries]) => {
    const avg = entries.reduce((s, e) => s + e.scored, 0) / entries.length;
    const normal = entries.filter(e => !e.item.rev).map(e => e.scored);
    if (normal.length) {
      const normalAvg = normal.reduce((a, b) => a + b, 0) / normal.length;
      entries.filter(e => e.item.rev && Math.abs(e.scored - normalAvg) >= 2).forEach(e => contradictions.push(e.item.text));
    }
    return { dim, avg };
  });

  const values = PS.answers.map(a => a.value);
  const extremes = values.filter(v => v === 1 || v === 5).length / values.length;
  const middles = values.filter(v => v === 3).length / values.length;
  const hints = [];
  if (contradictions.length) {
    hints.push(`<span class="warn-text">⚠ ${contradictions.length} Antwort(en) passen nicht zu deinen anderen Antworten im selben Bereich – das sind umgekehrt formulierte Aussagen. Genau lesen!</span><br><span class="small muted">z. B.: „${esc(contradictions[0])}“</span>`);
  } else {
    hints.push(`<span class="trend-up">✓ Deine Antworten sind in sich stimmig – auch bei umgekehrt formulierten Aussagen.</span>`);
  }
  if (extremes > 0.7) hints.push("⚠ Sehr viele Extremantworten (1 oder 5). Das kann unglaubwürdig oder übertrieben wirken.");
  if (middles > 0.5) hints.push("⚠ Sehr oft „teils, teils“. Das wirkt unentschlossen – trau dich zu klaren Aussagen.");
  const low = rows.filter(r => r.avg < 2.5).map(r => r.dim);
  if (low.length) hints.push(`ℹ Eher niedrig: ${low.map(esc).join(", ")}. Für Kundenkontakt und Teamarbeit lohnt es sich, im Interview Beispiele parat zu haben, wie du damit umgehst.`);

  render(`
    <h2>Dein Profil</h2>
    <p class="muted small">Kein Test-Ergebnis – nur eine Rückmeldung, wie deine Antworten wirken.</p>
    <section class="card">
      <h3>Ausprägung je Bereich</h3>
      ${rows.map(r => `
        <div class="bar-row"><span>${esc(r.dim)}</span>
          <div class="bar"><div style="width:${((r.avg - 1) / 4) * 100}%;background:var(--accent)"></div></div>
          <span class="bar-val">${r.avg.toFixed(1)} / 5</span></div>`).join("")}
    </section>
    <section class="card"><h3>Hinweise</h3><ul class="hints">${hints.map(h => `<li>${h}</li>`).join("")}</ul></section>
    <button class="btn" id="again">Nochmal</button>
    <button class="btn secondary" id="home">Zum Start</button>
  `);
  on("#again", "click", () => {
    PS = { items: shuffle(PERSONALITY_ITEMS), index: 0, answers: [] };
    showPersonalityItem();
  });
  on("#home", "click", showStart);
}

showStart();
