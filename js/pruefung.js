// Prüfungssimulation nach dem Vorbild des Telekom-Onlinetests (laut Testhersteller und
// Erfahrungsberichten): Blöcke mit eigenem Zeitlimit, kein Zurückspringen, Probeaufgabe vor
// jedem Block, Pausen zwischen den Blöcken, Merkblatt am Anfang, SJT am Ende, Punktwert von 100.

import { QUESTIONS } from "./fragen.js";
import { esc, shuffle, nowStamp, formatDuration } from "./util.js";
import { app, render, on, startTick, stopTick, barColor, screen, go, toast } from "./ui.js";
import { loadProgress, saveProgress, recordAnswer, dailyStatus } from "./speicher.js";
import { chooseByHistory } from "./auswahl.js";
import { questionBodyHtml, shuffledOrder, answerText } from "./fragenansicht.js";
import { examExtras, exampleQuestion } from "./pruefung-extras.js";
import { CARDS, cardForQuestion } from "./lernkarten.js";
import { openCardOverlay } from "./lernen.js";
import { openReportOverlay } from "./meldungen.js";
import { buildSheet, sheetSvg, sheetText, sheetQuestions } from "./gen/merkblatt.js";
import { SJT } from "./sjt-daten.js";
import { runSjtBlock, sjtSummary, sjtReviewHtml } from "./sjt.js";

export const PRESETS = {
  kurz: {
    name: "Kurz",
    minutes: 35,
    memo: { floors: 3, sheetQuestions: 2, poolMemos: 1, seconds: 90 },
    sjt: 4,
    sections: [
      { name: "Rechentextaufgaben", cats: ["Mathe"], count: 5, seconds: 300 },
      { name: "Diagrammanalyse", cats: ["Diagramme"], count: 3, seconds: 240 },
      { name: "Logik & Figuren", cats: ["Logik"], count: 6, seconds: 300 },
      { name: "Sprache", cats: ["Deutsch", "Textverständnis"], count: 5, seconds: 240 },
      { name: "Englisch", cats: ["Englisch"], count: 4, seconds: 150 },
      { name: "IT-Grundwissen", cats: ["IT"], count: 5, seconds: 180 },
      { name: "Konzentration", cats: ["Konzentration"], count: 6, seconds: 180 },
    ],
  },
  echt: {
    name: "Wie im echten Test",
    minutes: 90,
    memo: { floors: 4, sheetQuestions: 4, poolMemos: 2, seconds: 180 },
    sjt: 8,
    sections: [
      { name: "Rechentextaufgaben", cats: ["Mathe"], count: 10, seconds: 720 },
      { name: "Diagrammanalyse", cats: ["Diagramme"], count: 6, seconds: 480 },
      { name: "Logik & Figuren", cats: ["Logik"], count: 12, seconds: 600 },
      { name: "Sprache", cats: ["Deutsch", "Textverständnis"], count: 10, seconds: 480 },
      { name: "Englisch", cats: ["Englisch"], count: 8, seconds: 300 },
      { name: "IT-Grundwissen", cats: ["IT"], count: 10, seconds: 360 },
      { name: "Wirtschaft", cats: ["BWL"], count: 6, seconds: 180 },
      { name: "Konzentration", cats: ["Konzentration"], count: 12, seconds: 300 },
    ],
  },
};

const LEVEL_MIX = [0.25, 0.45, 0.30]; // Anteil leicht / mittel / schwer

let E = null; // laufende Prüfung

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

// Merkblatt: Gebäudeplan (Grafik) plus einige kurze Merkinhalte aus dem Fragenpool
function buildMemo(preset, history) {
  const sheet = buildSheet(preset.memo.floors);
  const parts = [{ html: sheetSvg(sheet), text: sheetText(sheet) }];
  const questions = sheetQuestions(sheet, preset.memo.sheetQuestions, 2).map(q => ({ ...q, memo: sheetText(sheet), memoRef: 1 }));

  // Keine Merkinhalte mit Stockwerken, Räumen oder Abteilungen – sonst würden Fragen zum Gebäudeplan mehrdeutig
  const memoPool = QUESTIONS.filter(q => q.memo && !/OG|EG|Raum|Standort|Mitarbeiter|Einkauf|Vertrieb|Personal|Technik/.test(q.memo));
  const used = new Set();
  const onlyNumbers = m => /^[\d\s–-]+$/.test(m);
  while (parts.length - 1 < preset.memo.poolMemos && used.size < memoPool.length) {
    const q = chooseByHistory(memoPool.filter(x => !used.has(x.id)), history);
    used.add(q.id);
    if (onlyNumbers(q.memo) && questions.some(x => x.memoRef > 1 && onlyNumbers(x.memo))) continue;
    parts.push({ html: null, text: q.memo });
    questions.push({ ...q, memoRef: parts.length });
  }
  return { parts, questions };
}

function buildExam(presetKey) {
  const preset = PRESETS[presetKey];
  const history = loadProgress().fragen;
  const used = new Set();
  const sections = preset.sections.map(sec => {
    const extra = examExtras(sec);
    const fromPool = pickQuestions(sec.cats, sec.count - extra.length, history, used);
    return { ...sec, questions: shuffle([...fromPool, ...extra]), example: exampleQuestion(sec, used) };
  });

  const memo = buildMemo(preset, history);
  sections.push({
    name: "Merkfähigkeit", cats: ["Merkfähigkeit"], seconds: memo.questions.length * 30,
    questions: memo.questions, isMemo: true,
  });

  for (const sec of sections) {
    sec.orders = sec.questions.map(q => shuffledOrder(q));
    sec.answers = sec.questions.map(() => -1);
    sec.usedSeconds = 0;
  }
  return {
    presetKey, preset, sections, memo,
    sjtItems: shuffle(SJT).slice(0, preset.sjt), sjtResults: [],
    sectionIndex: 0, qIndex: 0,
  };
}

// ---------------------------------------------------------------------------
// Ansichten
// ---------------------------------------------------------------------------

function showIntro() {
  const last = loadProgress().pruefungen.slice(-3).reverse();
  render(`
    <h2>Prüfungssimulation</h2>
    <section class="card">
      <p>Aufgebaut wie der Telekom-Onlinetest nach Angaben des Testherstellers und Erfahrungsberichten:</p>
      <ul class="hints">
        <li>Mehrere <strong>Blöcke mit eigenem Zeitlimit</strong> – läuft die Zeit ab, geht es automatisch weiter.</li>
        <li><strong>Kein Zurückspringen:</strong> Antwort wählen, dann „Weiter“. Unbeantwortete Fragen zählen als falsch.</li>
        <li>Vor jedem Block eine <strong>Beispielaufgabe</strong>, dazwischen kannst du <strong>kurz Pause</strong> machen.</li>
        <li>Am Anfang ein <strong>Merkblatt</strong> mit Gebäudeplan – die Fragen dazu kommen am Ende.</li>
        <li>Zum Schluss der <strong>Situational Judgement Test</strong> (8 Punkte auf 4 Reaktionen verteilen).</li>
        <li>Stift und Papier für Nebenrechnungen bereitlegen, ruhigen Ort suchen.</li>
      </ul>
    </section>
    ${Object.entries(PRESETS).map(([key, p]) => `
      <button class="menu-item wide" data-preset="${key}" style="margin-top:10px;width:100%">
        <strong>${p.name} · ca. ${p.minutes} Minuten</strong>
        <span>${p.sections.map(s => `${s.name} (${s.count})`).join(" · ")} · Merkfähigkeit · Situationen (${p.sjt})</span>
      </button>`).join("")}
    ${last.length ? `
      <section class="card">
        <h3>Letzte Prüfungen</h3>
        ${last.map(x => `<p>${esc(x.datum)} · ${esc(x.variante)}: <strong>${x.prozent} von 100 Punkten</strong></p>`).join("")}
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
    <div class="qhead"><span>Merkphase</span><span id="clock" class="badge"></span></div>
    <div class="progress" style="margin-top:8px"><div id="bar" style="width:100%"></div></div>
    <p class="qtext">Präge dir alles ein. Die Fragen dazu kommen am Ende der Prüfung.</p>
    ${E.memo.parts.map((p, i) => `
      <p class="cat" style="margin-top:12px">Merkblatt ${i + 1}</p>
      ${p.html ? `<div class="stem">${p.html}</div>` : `<div class="memo" style="font-size:19px;padding:16px">${esc(p.text)}</div>`}`).join("")}
    <button class="btn" id="done">Fertig eingeprägt – Prüfung starten</button>
  `);
  const tick = () => {
    const left = Math.max(0, Math.round((end - Date.now()) / 1000));
    const clock = document.getElementById("clock");
    if (!clock) return;
    clock.textContent = `⏱ ${formatDuration(left)}`;
    document.getElementById("bar").style.width = `${(left / E.preset.memo.seconds) * 100}%`;
    if (left <= 0) showSectionIntro();
  };
  tick();
  startTick(tick, 500);
  on("#done", "click", () => {
    if (confirm("Merkphase wirklich beenden? Du kannst dir die Informationen danach nicht mehr ansehen.")) showSectionIntro();
  });
}

// Vor jedem Block: Überblick, Beispielaufgabe mit Lösung, Pause möglich
function showSectionIntro() {
  stopTick();
  const sec = E.sections[E.sectionIndex];
  const ex = sec.example;
  render(`
    <div class="qhead"><span>Block ${E.sectionIndex + 1} von ${E.sections.length}</span><span>☕ Pause möglich</span></div>
    <h2>${esc(sec.name)}</h2>
    <p class="muted">${sec.questions.length} Aufgaben · ${formatDuration(sec.seconds)} · kein Zurückspringen</p>
    ${sec.isMemo ? `<section class="card"><p>Jetzt kommen die Fragen zu deinem Merkblatt vom Anfang.</p></section>` : ""}
    ${ex ? `
      <section class="card">
        <h3>Beispielaufgabe (zählt nicht)</h3>
        ${ex.text ? `<p class="small muted">${esc(ex.text.slice(0, 160))} …</p>` : ""}
        <p><strong>${esc(ex.q)}</strong></p>
        ${ex.stemHtml ? `<div class="stem">${ex.stemHtml}</div>` : ""}
        ${ex.optHtml
          ? `<div class="optgrid review">${ex.optHtml.map((h, i) => `<div class="opt fig ${i === ex.correct ? "correct" : ""}">${h}</div>`).join("")}</div>`
          : ex.opts.map((o, i) => `<div class="opt ${i === ex.correct ? "correct" : ""}">${esc(o)}</div>`).join("")}
        <p class="small">${esc(ex.explain)}</p>
      </section>` : ""}
    <button class="btn" id="go">Block starten – die Zeit läuft</button>
  `);
  on("#go", "click", startSection);
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
  const last = E.qIndex === sec.questions.length - 1;
  render(`
    <div class="qhead">
      <span><strong>${esc(sec.name)}</strong> · ${E.qIndex + 1}/${sec.questions.length}</span>
      <span id="clock" class="badge"></span>
    </div>
    <div class="progress" style="margin-top:8px"><div id="bar"></div></div>
    ${sec.isMemo ? `<p class="muted small">Frage zu Merkblatt ${q.memoRef}</p>` : ""}
    ${questionBodyHtml(q, sec.orders[E.qIndex])}
    <button class="btn" id="nextQ">${sec.answers[E.qIndex] >= 0 ? (last ? "Block abschließen" : "Weiter") : (last ? "Ohne Antwort abschließen" : "Überspringen")}</button>
    <button class="btn ghost" id="abort">Prüfung abbrechen</button>
  `);

  const nextBtn = document.getElementById("nextQ");
  on(".opt", "click", e => {
    sec.answers[E.qIndex] = Number(e.currentTarget.dataset.i);
    app.querySelectorAll(".opt").forEach(b => b.classList.toggle("chosen", b === e.currentTarget));
    nextBtn.textContent = last ? "Block abschließen" : "Weiter";
  });
  on("#nextQ", "click", () => {
    if (last) finishSection();
    else { E.qIndex += 1; showExamQuestion(); }
  });
  on("#abort", "click", () => {
    if (confirm("Prüfung abbrechen? Das Ergebnis wird nicht gespeichert.")) go("start");
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
      toast(`Zeit für „${sec.name}“ abgelaufen`);
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
  if (E.sectionIndex < E.sections.length) showSectionIntro();
  else showSjtIntro();
}

function showSjtIntro() {
  render(`
    <div class="qhead"><span>Letzter Teil</span><span>☕ Pause möglich</span></div>
    <h2>Situationen (SJT)</h2>
    <section class="card">
      <p>${E.sjtItems.length} Situationen aus dem Arbeitsalltag. Verteile jeweils <strong>8 Punkte</strong> auf vier Reaktionen – je mehr Punkte, desto eher würdest du so handeln.</p>
      <p class="small muted">Kein Zeitlimit, kein Richtig oder Falsch. Ehrlich und stimmig antworten.</p>
    </section>
    <button class="btn" id="go">Starten</button>
  `);
  on("#go", "click", () => runSjtBlock(E.sjtItems, results => { E.sjtResults = results; showExamResult(); }, "Situation"));
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
  const points = total ? Math.round((correct / total) * 100) : 0;
  const sjt = sjtSummary(E.sjtResults);

  const data = loadProgress();
  data.pruefungen.push({ datum: nowStamp().slice(0, 16), variante: E.preset.name, prozent: points, richtig: correct, gesamt: total, abschnitte: sectionResults, sjt });
  saveProgress(data);

  const verdict = points >= 80 ? "Sehr stark – so kannst du in den echten Test gehen."
    : points >= 65 ? "Solide. Schau dir die schwächsten Blöcke noch einmal gezielt an."
      : points >= 50 ? "Ausbaufähig. Übe die rot markierten Blöcke gezielt im Übungsmodus."
        : "Da ist noch Luft nach oben – mit gezieltem Üben der schwachen Bereiche wird das schnell besser.";

  render(`
    <h2 class="center">Prüfung beendet</h2>
    <div class="big">${points}</div>
    <p class="center muted">von 100 Punkten · ${correct} von ${total} Aufgaben richtig · ${esc(E.preset.name)}</p>
    <p class="center">${verdict}</p>
    <section class="card">
      <h3>Blöcke</h3>
      ${sectionResults.map(s => {
        const p = Math.round((s.richtig / s.gesamt) * 100);
        return `<div class="bar-row"><span>${esc(s.name)}</span>
          <div class="bar"><div style="width:${p}%;background:${barColor(p)}"></div></div>
          <span class="bar-val">${s.richtig}/${s.gesamt}</span></div>`;
      }).join("")}
      <p class="small muted" style="margin-top:8px">Die echte Bestehensgrenze der Telekom ist nicht öffentlich. In einem Forenbericht (fachinformatiker.de, 2023) wurde ein Bewerber mit 60 von 100 Punkten eingeladen und angenommen – ein Einzelfall, aber ein Hinweis, dass nicht nur der Punktwert zählt.</p>
    </section>
    <section class="card">
      <h3>Situationen (SJT)</h3>
      <div class="bar-row"><span>Sehr konstruktiv</span><div class="bar"><div style="width:${sjt.bestPct}%;background:var(--ok)"></div></div><span class="bar-val">${sjt.bestPct}%</span></div>
      <div class="bar-row"><span>Eher ungünstig</span><div class="bar"><div style="width:${sjt.badPct}%;background:var(--bad)"></div></div><span class="bar-val">${sjt.badPct}%</span></div>
      <button class="link" id="sjtReview">Situationen mit Begründungen ansehen</button>
    </section>
    <button class="btn" id="review">Aufgaben durchgehen</button>
    <button class="btn secondary" id="home">Zum Start</button>
  `);
  on("#review", "click", () => showReview(true));
  on("#sjtReview", "click", showSjtReview);
  on("#home", "click", () => go("start"));
  const dayAfter = dailyStatus();
  if (!dayBefore.erreicht && dayAfter.erreicht) toast(`🎯 Tagesziel erreicht! Serie: ${dayAfter.serie} ${dayAfter.serie === 1 ? "Tag" : "Tage"}`);
}

function showSjtReview() {
  render(`
    <h2>Situationen – Durchsicht</h2>
    ${sjtReviewHtml(E.sjtResults)}
    <button class="btn" id="back">Zurück zur Auswertung</button>
  `);
  on("#back", "click", showExamResultAgain);
}

// Ergebnis erneut anzeigen, ohne es doppelt zu speichern
function showExamResultAgain() {
  const lastExam = loadProgress().pruefungen.slice(-1)[0];
  render(`
    <h2 class="center">Prüfung beendet</h2>
    <div class="big">${lastExam.prozent}</div>
    <p class="center muted">von 100 Punkten</p>
    <button class="btn" id="review">Aufgaben durchgehen</button>
    <button class="btn secondary" id="sjtReview">Situationen ansehen</button>
    <button class="btn ghost" id="home">Zum Start</button>
  `);
  on("#review", "click", () => showReview(true));
  on("#sjtReview", "click", showSjtReview);
  on("#home", "click", () => go("start"));
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
    ${items.length ? items.map(({ sec, q, chosen, ok }, idx) => `
      <section class="card">
        <div class="cat">${esc(sec.name)}</div>
        ${q.memo ? `<p class="small muted" style="white-space:pre-line">Merkblatt: ${esc(q.memo)}</p>` : ""}
        ${q.text ? `<p class="small muted">Lesetext: ${esc(q.text.slice(0, 120))} …</p>` : ""}
        <p><strong>${esc(q.q)}</strong></p>
        ${q.stemHtml ? `<div class="stem">${q.stemHtml}</div>` : ""}
        <p class="${ok ? "trend-up" : "trend-down"}">Deine Antwort: ${esc(answerText(q, chosen))}</p>
        ${ok ? "" : `<p class="trend-up">Richtig: ${esc(answerText(q, q.correct))}</p>`}
        ${q.optHtml && !ok ? `<div class="optgrid review">${q.optHtml.map((h, i) => `<div class="opt fig ${i === q.correct ? "correct" : i === chosen ? "wrong" : ""}"><span class="optlabel">${i + 1}</span>${h}</div>`).join("")}</div>` : ""}
        <p class="small">${esc(q.explain)}</p>
        <div class="feedback-actions">
          ${cardForQuestion(q) ? `<button class="link" data-card="${cardForQuestion(q).id}">📖 Spickzettel: ${esc(cardForQuestion(q).title)}</button>` : ""}
          <button class="link muted-link" data-report="${idx}">⚑ Frage melden</button>
        </div>
      </section>`).join("") : `<p class="center trend-up">Keine Fehler – stark!</p>`}
    <button class="btn" id="home">Zum Start</button>
  `);
  on("#fWrong", "click", () => showReview(true));
  on("#fAll", "click", () => showReview(false));
  on("#home", "click", () => go("start"));
  on("[data-card]", "click", e => openCardOverlay(CARDS.find(c => c.id === e.currentTarget.dataset.card)));
  on("[data-report]", "click", e => {
    const btn = e.currentTarget;
    const { q, chosen } = items[Number(btn.dataset.report)];
    openReportOverlay(q, chosen, () => { btn.textContent = "⚑ Gemeldet"; btn.disabled = true; });
  });
}

screen("pruefung", showIntro);
