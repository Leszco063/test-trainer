// Übungsrunde: adaptive Schwierigkeit, Zeitdruck, Merkphase, Fehler-Training.

import { QUESTIONS } from "./fragen.js";
import { CATEGORIES, LEVEL_NAMES, LEVEL_COLORS, MEMO_SECONDS, TIMER_SECONDS } from "./config.js";
import { esc, shuffle } from "./util.js";
import { GENERATED_ONLY, GEN_SHARE, hasGenerator, generate } from "./gen/index.js";
import { app, render, on, startTick, stopTick, screen, go } from "./ui.js";
import { loadProgress, loadSettings, saveRun, recordAnswer, dueQuestions, withBox, isDue } from "./speicher.js";
import { pickFromPool } from "./auswahl.js";
import { questionBodyHtml, shuffledOrder, markAnswer } from "./fragenansicht.js";
import { cardForQuestion } from "./lernkarten.js";
import { openCardOverlay } from "./lernen.js";

let S = null; // aktuelle Runde

// override.cats: nur diese Bereiche üben (z. B. vom Spickzettel aus)
function startSession(mode, override = {}) {
  const settings = loadSettings();
  const history = loadProgress().fragen;
  const activeCats = override.cats || CATEGORIES.filter(c => settings.cats[c]);
  if (!activeCats.length) {
    alert("Bitte mindestens einen Bereich auswählen.");
    return;
  }
  let pool = QUESTIONS.filter(q => activeCats.includes(q.cat));
  if (mode === "faellig") {
    pool = dueQuestions(history, pool); // wackeligste zuerst
    if (!pool.length) {
      alert("In den ausgewählten Bereichen ist heute nichts zum Wiederholen fällig.");
      return;
    }
  }
  // Mit generierten Bereichen gehen die Aufgaben nie aus
  const unlimited = activeCats.some(c => hasGenerator(c));
  if (mode === "normal" && !pool.length && !unlimited) {
    alert("In den ausgewählten Bereichen gibt es keine Fragen.");
    return;
  }
  S = {
    mode,
    cats: activeCats,
    pool,
    history,
    adaptive: settings.adaptive && mode === "normal",
    fixedLevel: settings.level,
    timer: settings.timer,
    total: mode === "faellig" ? Math.min(pool.length, Math.max(settings.count, 20)) : (unlimited ? settings.count : Math.min(settings.count, pool.length)),
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

function pickNext() {
  let q;
  if (S.mode === "faellig") {
    q = S.pool.find(x => !S.used.has(x.id)) || null; // schon nach Box sortiert
  } else {
    // Erst zufällig einen Bereich wählen, damit alle Bereiche gleich oft drankommen
    const level = S.adaptive ? S.level : S.fixedLevel;
    for (const cat of shuffle(S.cats)) {
      if (GENERATED_ONLY.includes(cat) || (hasGenerator(cat) && Math.random() < GEN_SHARE)) {
        q = generate(cat, level);
        break;
      }
      q = pickFromPool(S.pool.filter(x => x.cat === cat), level, S.used, S.history);
      if (q) break;
    }
  }
  if (!q) return null;
  S.used.add(q.id);
  S.questions.push(q);
  return q;
}

function historyTag(q) {
  if (q.gen) return `<span class="muted">Neu erzeugt</span>`;
  const raw = S.history[q.id];
  if (!raw) return `<span style="color:var(--info)" class="badge">Neu</span>`;
  const e = withBox(raw);
  if (isDue(e) && e.box === 1) return `<span style="color:var(--warn)" class="badge">Wiederholung – zuletzt falsch</span>`;
  if (isDue(e)) return `<span style="color:var(--warn)" class="badge">Wiederholung · Box ${e.box}</span>`;
  return `<span class="muted">Box ${e.box} · ${e.gesehen}× gehabt</span>`;
}

function questionHeader(q) {
  const modeLabel = S.mode === "faellig" ? "Wiederholung" : (S.adaptive ? "Adaptiv" : "");
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
  let left = MEMO_SECONDS[q.level] || 8;
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
  startTick(() => {
    left -= 1;
    if (left <= 0) { finish(); return; }
    document.getElementById("memoTimer").textContent = `Noch ${left} Sekunden`;
  });
}

function showQuestion() {
  const q = S.questions[S.index];
  if (q.memo && S.memoDone !== S.index) {
    showMemo(q);
    return;
  }
  render(`
    ${questionHeader(q)}
    ${questionBodyHtml(q, shuffledOrder(q))}
    <div id="feedback"></div>
    <div class="timer" id="timer"></div>
    <button class="btn" id="next" style="display:none">${S.index + 1 >= S.total ? "Zum Ergebnis" : "Weiter"}</button>
  `);
  S.answered = false;
  on(".opt", "click", e => checkAnswer(Number(e.currentTarget.dataset.i)));
  on("#next", "click", nextQuestion);

  if (S.timer) {
    let left = TIMER_SECONDS;
    const el = document.getElementById("timer");
    el.textContent = `⏱ ${left} s`;
    startTick(() => {
      left -= 1;
      el.textContent = `⏱ ${left} s`;
      el.classList.toggle("low", left <= 10);
      if (left <= 0) checkAnswer(-1);
    });
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
  markAnswer(app, q, chosen);

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
  if (S.adaptive) {
    const before = S.level;
    if (S.streakCorrect >= 2 && S.level < 3) { S.level += 1; S.streakCorrect = 0; }
    else if (S.streakWrong >= 2 && S.level > 1) { S.level -= 1; S.streakWrong = 0; }
    if (S.level !== before) levelNote = `<span class="explain muted small">Schwierigkeit wird ${S.level > before ? "höher" : "niedriger"} gestellt.</span>`;
  }

  const card = cardForQuestion(q);
  const fb = document.getElementById("feedback");
  fb.className = `feedback ${isCorrect ? "ok" : "bad"}`;
  fb.innerHTML = `<strong>${head}</strong><span class="explain">${esc(q.explain)}</span>${levelNote}
    <div class="feedback-actions">${card ? `<button class="link" id="cardLink">📖 Spickzettel: ${esc(card.title)}</button>` : ""}</div>`;
  if (card) document.getElementById("cardLink").addEventListener("click", () => openCardOverlay(card));
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

  if (S.mode === "faellig") lastPct = null;  // Wiederholungen zählen nicht in den Verlauf
  else saveRun(S.score, total, S.catStats, S.level);

  let cmp = "";
  if (lastPct !== null) {
    const diff = pct - lastPct;
    if (diff > 0) cmp = `<p class="center trend-up">↑ ${diff} Prozentpunkte besser als letzte Runde (${lastPct}%)</p>`;
    else if (diff < 0) cmp = `<p class="center trend-down">↓ ${-diff} Prozentpunkte schwächer als letzte Runde (${lastPct}%)</p>`;
    else cmp = `<p class="center trend-flat">→ Gleiches Ergebnis wie letzte Runde (${lastPct}%)</p>`;
  }

  let extra = "";
  if (S.mode === "faellig") {
    const stillDue = dueQuestions(S.history).length;
    extra = `<p class="center"><strong>${S.score} von ${total} gewusst</strong> – diese rücken eine Box weiter.<br>Heute noch fällig: ${stillDue}</p>`;
  } else if (S.adaptive) {
    extra = `<p class="center">Zuletzt erreichtes Level: <strong>${LEVEL_NAMES[S.level]}</strong></p>`;
  }

  const wrongByCat = {};
  S.wrong.forEach(q => { wrongByCat[q.cat] = (wrongByCat[q.cat] || 0) + 1; });
  const wrongHtml = S.wrong.length
    ? `<section class="card"><h3>Fehler nach Bereich</h3>${Object.entries(wrongByCat).map(([c, n]) => `<p>${esc(c)}: ${n} Fehler</p>`).join("")}</section>`
    : "";

  render(`
    <h2 class="center">${S.mode === "faellig" ? "Wiederholung beendet" : "Ergebnis"}</h2>
    <div class="big">${S.score} / ${total}</div>
    <p class="center muted">${pct} % richtig</p>
    ${cmp}${extra}${wrongHtml}
    <button class="btn" id="again">Zurück zum Start</button>
  `);
  on("#again", "click", () => go("start"));
}

screen("uebung", startSession);
