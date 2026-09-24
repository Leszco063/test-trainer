// Prüfungssimulation: Abschnitte mit eigenem Zeitlimit, kein Feedback zwischendurch,
// Merkblatt am Anfang und Merkfragen am Ende – wie in echten Online-Assessments.

import { QUESTIONS } from "./fragen.js";
import { esc, rand, shuffle, nowStamp, formatDuration } from "./util.js";
import { app, render, on, startTick, stopTick, barColor, screen, go, toast } from "./ui.js";
import { loadProgress, saveProgress, recordAnswer, dailyStatus } from "./speicher.js";
import { chooseByHistory } from "./auswahl.js";
import { questionBodyHtml, shuffledOrder, answerText } from "./fragenansicht.js";
import { examExtras } from "./pruefung-extras.js";
import { CARDS, cardForQuestion } from "./lernkarten.js";
import { openCardOverlay } from "./lernen.js";

// Abschnitte je Variante: Bereiche, Anzahl Fragen, Zeit in Sekunden
export const PRESETS = {
  kurz: {
    name: "Kurz",
    memo: { count: 3, seconds: 90 },
    sections: [
      { name: "Mathematik", cats: ["Mathe"], count: 6, seconds: 360 },
      { name: "Logik", cats: ["Logik"], count: 6, seconds: 300 },
      { name: "Deutsch", cats: ["Deutsch"], count: 5, seconds: 180 },
      { name: "Englisch", cats: ["Englisch"], count: 5, seconds: 180 },
      { name: "IT & Wirtschaft", cats: ["IT", "BWL"], count: 6, seconds: 180 },
      { name: "Konzentration", cats: ["Konzentration"], count: 6, seconds: 180 },
    ],
  },
  komplett: {
    name: "Komplett",
    memo: { count: 5, seconds: 150 },
    sections: [
      { name: "Mathematik", cats: ["Mathe"], count: 12, seconds: 720 },
      { name: "Logik", cats: ["Logik"], count: 12, seconds: 600 },
      { name: "Deutsch", cats: ["Deutsch"], count: 10, seconds: 360 },
      { name: "Englisch", cats: ["Englisch"], count: 10, seconds: 360 },
      { name: "IT-Grundwissen", cats: ["IT"], count: 8, seconds: 240 },
      { name: "Wirtschaft", cats: ["BWL"], count: 6, seconds: 180 },
      { name: "Konzentration", cats: ["Konzentration"], count: 12, seconds: 300 },
    ],
  },
};

const LEVEL_MIX = [0.25, 0.45, 0.30]; // Anteil leicht / mittel / schwer

let E = null; // laufende Prüfung

function presetMinutes(p) {
  const secs = p.memo.seconds + p.sections.reduce((s, x) => s + x.seconds, 0) + p.memo.count * 30;
  return Math.round(secs / 60);
}

function randomLevel() {
  const r = Math.random();
  return r < LEVEL_MIX[0] ? 1 : r < LEVEL_MIX[0] + LEVEL_MIX[1] ? 2 : 3;
}

// Fragen für einen Abschnitt: Level-Mischung, bevorzugt noch nicht gesehene Fragen
function pickQuestions(cats, count, history, used) {
  const pool = QUESTIONS.filter(q => cats.includes(q.cat) && !q.memo);
  const picked = [];
  for (let i = 0; i < count; i++) {
    const level = randomLevel();
    let candidates = pool.filter(q => q.level === level && !used.has(q.id));
    if (!candidates.length) candidates = pool.filter(q => !used.has(q.id));
    if (!candidates.length) break;
    const q = chooseByHistory(candidates, history);
    used.add(q.id);
    picked.push(q);
  }
  return picked;
}

function buildExam(presetKey) {
  const preset = PRESETS[presetKey];
  const history = loadProgress().fragen;
  const used = new Set();
  const sections = preset.sections.map(sec => {
    const extra = examExtras(sec, used);
    const fromPool = pickQuestions(sec.cats, sec.count - extra.length, history, used);
    return { ...sec, questions: shuffle([...fromPool, ...extra]) };
  });

  // Merkblatt: mehrere Merkfragen, deren Inhalte zusammen am Anfang gezeigt werden
  const memoPool = QUESTIONS.filter(q => q.memo);
  const memoQs = [];
  const memoUsed = new Set();
  const onlyNumbers = m => /^[\d\s–-]+$/.test(m);
  while (memoQs.length < preset.memo.count && memoUsed.size < memoPool.length) {
    const q = chooseByHistory(memoPool.filter(x => !memoUsed.has(x.id)), history);
    memoUsed.add(q.id);
    // höchstens eine reine Zahlenfolge pro Merkblatt, sonst verwechselt man sie zu leicht
    if (onlyNumbers(q.memo) && memoQs.some(m => onlyNumbers(m.memo))) continue;
    memoQs.push(q);
  }
  sections.push({ name: "Merkfähigkeit", cats: ["Merkfähigkeit"], seconds: memoQs.length * 30, questions: memoQs, isMemo: true });

  for (const sec of sections) {
    sec.orders = sec.questions.map(q => shuffledOrder(q));
    sec.answers = sec.questions.map(() => -1);
    sec.usedSeconds = 0;
  }
  return { presetKey, preset, sections, memoQs, sectionIndex: 0, qIndex: 0, startedAt: Date.now() };
}

// ---------------------------------------------------------------------------
// Ansichten
// ---------------------------------------------------------------------------

function showIntro() {
  const last = loadProgress().pruefungen.slice(-3).reverse();
  render(`
    <h2>Prüfungssimulation</h2>
    <section class="card">
      <p>So nah wie möglich am echten Online-Test:</p>
      <ul class="hints">
        <li>Jeder Abschnitt hat ein <strong>eigenes Zeitlimit</strong>. Läuft die Zeit ab, geht es automatisch weiter.</li>
        <li><strong>Kein Feedback</strong> während der Prüfung – die Auswertung kommt am Ende.</li>
        <li>Innerhalb eines Abschnitts kannst du vor- und zurückspringen und Antworten ändern.</li>
        <li>Am Anfang prägst du dir ein <strong>Merkblatt</strong> ein. Die Fragen dazu kommen erst ganz am Ende.</li>
        <li>Unbeantwortete Fragen zählen als falsch – im Zweifel lieber raten.</li>
      </ul>
    </section>
    ${Object.entries(PRESETS).map(([key, p]) => `
      <button class="menu-item wide" data-preset="${key}" style="margin-top:10px">
        <strong>${p.name} · ca. ${presetMinutes(p)} Minuten</strong>
        <span>${p.sections.map(s => `${s.name} (${s.count})`).join(" · ")} · Merkfähigkeit (${p.memo.count})</span>
      </button>`).join("")}
    ${last.length ? `
      <section class="card">
        <h3>Letzte Prüfungen</h3>
        ${last.map(x => `<p>${esc(x.datum)} · ${esc(x.variante)}: <strong>${x.prozent} %</strong></p>`).join("")}
      </section>` : ""}
    <button class="btn ghost" id="back">Zurück</button>
  `);
  on("[data-preset]", "click", e => {
    E = buildExam(e.currentTarget.dataset.preset);
    showMemoSheet();
  });
  on("#back", "click", () => go("start"));
}

function showMemoSheet() {
  const end = Date.now() + E.preset.memo.seconds * 1000;
  render(`
    <div class="qhead"><span>Merkphase</span><span id="clock"></span></div>
    <div class="progress" style="margin-top:8px"><div id="bar" style="width:100%"></div></div>
    <p class="qtext">Präge dir alle Informationen ein. Die Fragen dazu kommen am Ende der Prüfung.</p>
    ${E.memoQs.map((q, i) => `<div class="memo" style="font-size:19px;padding:16px">${i + 1}.\n${esc(q.memo)}</div>`).join("")}
    <button class="btn" id="done">Fertig eingeprägt – Prüfung starten</button>
  `);
  const tick = () => {
    const left = Math.max(0, Math.round((end - Date.now()) / 1000));
    document.getElementById("clock").textContent = formatDuration(left);
    document.getElementById("bar").style.width = `${(left / E.preset.memo.seconds) * 100}%`;
    if (left <= 0) startSection();
  };
  tick();
  startTick(tick, 500);
  on("#done", "click", () => {
    if (confirm("Merkphase wirklich beenden? Du kannst dir die Informationen danach nicht mehr ansehen.")) startSection();
  });
}

function startSection() {
  const sec = E.sections[E.sectionIndex];
  E.qIndex = 0;
  E.sectionStart = Date.now();
  E.sectionEnd = Date.now() + sec.seconds * 1000;
  showExamQuestion();
}

function showExamQuestion() {
  const sec = E.sections[E.sectionIndex];
  const q = sec.questions[E.qIndex];
  const answered = sec.answers.filter(a => a >= 0).length;
  render(`
    <div class="qhead">
      <span>Abschnitt ${E.sectionIndex + 1}/${E.sections.length}: <strong>${esc(sec.name)}</strong></span>
      <span id="clock" class="badge"></span>
    </div>
    <div class="progress" style="margin-top:8px"><div id="bar"></div></div>
    <div class="qdots">
      ${sec.questions.map((_, i) => `<button class="qdot ${i === E.qIndex ? "current" : ""} ${sec.answers[i] >= 0 ? "done" : ""}" data-q="${i}">${i + 1}</button>`).join("")}
    </div>
    ${sec.isMemo ? `<p class="muted small">Frage zu Merkblatt-Punkt ${E.qIndex + 1}</p>` : ""}
    ${questionBodyHtml(q, sec.orders[E.qIndex])}
    <div class="btn-row">
      <button class="btn secondary" id="prev" ${E.qIndex === 0 ? "disabled" : ""}>Zurück</button>
      <button class="btn secondary" id="nextQ" ${E.qIndex === sec.questions.length - 1 ? "disabled" : ""}>Weiter</button>
    </div>
    <button class="btn" id="submit">Abschnitt abgeben (${answered}/${sec.questions.length} beantwortet)</button>
    <button class="btn ghost" id="abort">Prüfung abbrechen</button>
  `);
  on("#abort", "click", () => {
    if (confirm("Prüfung abbrechen? Das Ergebnis wird nicht gespeichert.")) go("start");
  });

  const chosen = sec.answers[E.qIndex];
  if (chosen >= 0) app.querySelector(`.opt[data-i="${chosen}"]`)?.classList.add("chosen");

  on(".opt", "click", e => {
    sec.answers[E.qIndex] = Number(e.currentTarget.dataset.i);
    // kurz markieren, dann automatisch zur nächsten offenen Frage
    app.querySelectorAll(".opt").forEach(b => b.classList.toggle("chosen", b === e.currentTarget));
    setTimeout(() => {
      if (E.qIndex < sec.questions.length - 1) E.qIndex += 1;
      showExamQuestion();
    }, 250);
  });
  on("[data-q]", "click", e => { E.qIndex = Number(e.currentTarget.dataset.q); showExamQuestion(); });
  on("#prev", "click", () => { E.qIndex -= 1; showExamQuestion(); });
  on("#nextQ", "click", () => { E.qIndex += 1; showExamQuestion(); });
  on("#submit", "click", () => {
    const open = sec.answers.filter(a => a < 0).length;
    if (open && !confirm(`${open} Frage(n) sind noch unbeantwortet und zählen als falsch. Abschnitt trotzdem abgeben?`)) return;
    finishSection();
  });

  const tick = () => {
    const left = Math.max(0, Math.round((E.sectionEnd - Date.now()) / 1000));
    const clock = document.getElementById("clock");
    if (!clock) return;
    clock.textContent = `⏱ ${formatDuration(left)}`;
    clock.style.color = left <= 30 ? "var(--bad)" : "";
    document.getElementById("bar").style.width = `${(left / sec.seconds) * 100}%`;
    if (left <= 0) {
      stopTick();
      alert(`Die Zeit für „${sec.name}“ ist abgelaufen. Es geht mit dem nächsten Abschnitt weiter.`);
      finishSection();
    }
  };
  tick();
  startTick(tick, 500);
}

function finishSection() {
  stopTick();
  const sec = E.sections[E.sectionIndex];
  sec.usedSeconds = Math.min(sec.seconds, Math.round((Date.now() - E.sectionStart) / 1000));
  E.sectionIndex += 1;
  if (E.sectionIndex < E.sections.length) showSectionBreak();
  else showExamResult();
}

function showSectionBreak() {
  const sec = E.sections[E.sectionIndex];
  render(`
    <h2>Abschnitt ${E.sectionIndex + 1} von ${E.sections.length}</h2>
    <section class="card">
      <p class="qtext" style="margin:0 0 6px">${esc(sec.name)}</p>
      <p class="muted">${sec.questions.length} Fragen · ${formatDuration(sec.seconds)}</p>
      ${sec.isMemo ? `<p>Jetzt kommen die Fragen zu deinem Merkblatt vom Anfang.</p>` : ""}
    </section>
    <button class="btn" id="go">Abschnitt starten</button>
  `);
  on("#go", "click", startSection);
}

function showExamResult() {
  const dayBefore = dailyStatus();
  let total = 0, correct = 0;
  const sectionResults = E.sections.map(sec => {
    let right = 0;
    sec.questions.forEach((q, i) => {
      const ok = sec.answers[i] === q.correct;
      if (ok) right += 1;
      recordAnswer(q, ok);
    });
    total += sec.questions.length;
    correct += right;
    return { name: sec.name, richtig: right, gesamt: sec.questions.length, sekunden: sec.usedSeconds };
  });
  const pct = total ? Math.round((correct / total) * 100) : 0;

  const data = loadProgress();
  data.pruefungen.push({ datum: nowStamp().slice(0, 16), variante: E.preset.name, prozent: pct, richtig: correct, gesamt: total, abschnitte: sectionResults });
  saveProgress(data);

  const verdict = pct >= 80 ? "Sehr stark – so kannst du in den echten Test gehen."
    : pct >= 65 ? "Solide. Schau dir die schwächsten Abschnitte noch einmal gezielt an."
      : pct >= 50 ? "Ausbaufähig. Übe die rot markierten Abschnitte gezielt im Übungsmodus."
        : "Da ist noch Luft nach oben – mit gezieltem Üben der schwachen Bereiche wird das schnell besser.";

  render(`
    <h2 class="center">Prüfung beendet</h2>
    <div class="big">${pct} %</div>
    <p class="center muted">${correct} von ${total} richtig · ${E.preset.name}</p>
    <p class="center">${verdict}</p>
    <section class="card">
      <h3>Abschnitte</h3>
      ${sectionResults.map(s => {
        const p = Math.round((s.richtig / s.gesamt) * 100);
        return `<div class="bar-row"><span>${esc(s.name)}</span>
          <div class="bar"><div style="width:${p}%;background:${barColor(p)}"></div></div>
          <span class="bar-val">${s.richtig}/${s.gesamt}</span></div>`;
      }).join("")}
      <p class="small muted" style="margin-top:8px">Richtwert, keine offizielle Grenze: Ab etwa 70 % gilt ein Einstellungstest meist als gut bestanden.</p>
    </section>
    <button class="btn" id="review">Fragen durchgehen</button>
    <button class="btn secondary" id="home">Zum Start</button>
  `);
  on("#review", "click", () => showReview(true));
  on("#home", "click", () => go("start"));
  const dayAfter = dailyStatus();
  if (!dayBefore.erreicht && dayAfter.erreicht) toast(`🎯 Tagesziel erreicht! Serie: ${dayAfter.serie} ${dayAfter.serie === 1 ? "Tag" : "Tage"}`);
}

function showReview(onlyWrong) {
  const items = [];
  E.sections.forEach(sec => sec.questions.forEach((q, i) => {
    const ok = sec.answers[i] === q.correct;
    if (!onlyWrong || !ok) items.push({ sec, q, chosen: sec.answers[i], ok });
  }));
  render(`
    <h2>Durchsicht</h2>
    <div class="segmented" style="margin-bottom:12px">
      <button id="fWrong" class="${onlyWrong ? "on" : ""}">Nur Fehler</button>
      <button id="fAll" class="${onlyWrong ? "" : "on"}">Alle Fragen</button>
    </div>
    ${items.length ? items.map(({ sec, q, chosen, ok }) => `
      <section class="card">
        <div class="cat">${esc(sec.name)}</div>
        ${q.memo ? `<p class="small muted">Merkblatt: ${esc(q.memo)}</p>` : ""}
        ${q.text ? `<p class="small muted">Lesetext: ${esc(q.text.slice(0, 120))} …</p>` : ""}
        <p><strong>${esc(q.q)}</strong></p>
        ${q.stemHtml ? `<div class="stem">${q.stemHtml}</div>` : ""}
        <p class="${ok ? "trend-up" : "trend-down"}">Deine Antwort: ${esc(answerText(q, chosen))}</p>
        ${ok ? "" : `<p class="trend-up">Richtig: ${esc(answerText(q, q.correct))}</p>`}
        ${q.optHtml && !ok ? `<div class="optgrid review">${q.optHtml.map((h, i) => `<div class="opt fig ${i === q.correct ? "correct" : i === chosen ? "wrong" : ""}"><span class="optlabel">${i + 1}</span>${h}</div>`).join("")}</div>` : ""}
        <p class="small">${esc(q.explain)}</p>
        ${cardForQuestion(q) ? `<button class="link" data-card="${cardForQuestion(q).id}">📖 Spickzettel: ${esc(cardForQuestion(q).title)}</button>` : ""}
      </section>`).join("") : `<p class="center trend-up">Keine Fehler – stark!</p>`}
    <button class="btn" id="home">Zum Start</button>
  `);
  on("[data-card]", "click", e => openCardOverlay(CARDS.find(c => c.id === e.currentTarget.dataset.card)));
  on("#fWrong", "click", () => showReview(true));
  on("#fAll", "click", () => showReview(false));
  on("#home", "click", () => go("start"));
}

screen("pruefung", showIntro);
