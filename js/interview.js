// Interview-Trainer: typische Fragen mit Tipps, eigene Stichpunkte speichern, Übungsmodus mit Stoppuhr.

import { GROUPS, INTERVIEW, GENERAL_TIPS } from "./interview-daten.js";
import { esc, rand, formatDuration } from "./util.js";
import { render, on, startTick, screen, go } from "./ui.js";
import { loadProgress, saveProgress } from "./speicher.js";

function notes() {
  return loadProgress().interview;
}

function saveNote(id, patch) {
  const data = loadProgress();
  data.interview[id] = { ...(data.interview[id] || {}), ...patch };
  saveProgress(data);
}

function showOverview() {
  const n = notes();
  const prepared = INTERVIEW.filter(x => n[x.id] && n[x.id].notiz).length;
  const confident = INTERVIEW.filter(x => n[x.id] && n[x.id].sicher).length;
  render(`
    <h2>Interview-Trainer</h2>
    <p class="muted small">Vorbereitung auf das Best Fit Interview: ${prepared}/${INTERVIEW.length} Antworten notiert · ${confident} sitzen sicher</p>
    <button class="btn" id="practice">Übungsmodus: zufällige Frage</button>
    <button class="btn secondary" id="tips">So bereitest du dich vor (STAR-Methode)</button>
    ${GROUPS.map((g, gi) => `
      <section class="card">
        <h3>${esc(g)}</h3>
        ${INTERVIEW.filter(x => x.group === gi).map(x => {
          const s = n[x.id] || {};
          const mark = s.sicher ? `<span class="trend-up">✓</span>` : s.notiz ? `<span class="muted">✎</span>` : `<span>›</span>`;
          return `<button class="list-item" data-q="${x.id}">${esc(x.q)}${mark}</button>`;
        }).join("")}
      </section>`).join("")}
    <button class="btn ghost" id="back">Zurück</button>
  `);
  on("[data-q]", "click", e => showQuestion(e.currentTarget.dataset.q));
  on("#practice", "click", practice);
  on("#tips", "click", showTips);
  on("#back", "click", () => go("start"));
}

function showTips() {
  render(`
    <h2>So bereitest du dich vor</h2>
    <section class="card lernkarte">${GENERAL_TIPS}</section>
    <button class="btn" id="back">Zurück zur Übersicht</button>
  `);
  on("#back", "click", showOverview);
}

function detailHtml(item) {
  return `
    <section class="card">
      <h3>Worauf es ankommt</h3>
      <p>${esc(item.ziel)}</p>
      ${item.star ? `<p class="small muted">Tipp: Mit der STAR-Methode antworten (Situation – Aufgabe – Aktion – Resultat).</p>` : ""}
    </section>
    <section class="card lernkarte">
      <h3>Tipps</h3>
      <ul>${item.tipps.map(t => `<li>${esc(t)}</li>`).join("")}</ul>
      <h3 style="margin-top:14px">Bausteine für deine Antwort</h3>
      <ul>${item.bausteine.map(b => `<li>${esc(b)}</li>`).join("")}</ul>
      <p class="small muted">Platzhalter in [eckigen Klammern] mit eigenen, echten Beispielen füllen.</p>
    </section>`;
}

function showQuestion(id) {
  const idx = INTERVIEW.findIndex(x => x.id === id);
  const item = INTERVIEW[idx];
  const s = notes()[id] || {};
  render(`
    <div class="cat">${esc(GROUPS[item.group])}</div>
    <h2>${esc(item.q)}</h2>
    ${detailHtml(item)}
    <section class="card">
      <h3>Deine Stichpunkte</h3>
      <textarea id="note" rows="6" placeholder="Stichpunkte für deine Antwort – nicht ausformulieren, frei sprechen üben.">${esc(s.notiz || "")}</textarea>
      <div class="row" style="margin-top:6px">
        <div>Antwort sitzt sicher</div>
        <label class="switch"><input type="checkbox" id="sure" ${s.sicher ? "checked" : ""}><span></span></label>
      </div>
      <p class="small muted" id="saved">Wird automatisch gespeichert.</p>
    </section>
    <div class="btn-row">
      <button class="btn secondary" id="prev" ${idx === 0 ? "disabled" : ""}>Vorherige</button>
      <button class="btn secondary" id="nextQ" ${idx === INTERVIEW.length - 1 ? "disabled" : ""}>Nächste</button>
    </div>
    <button class="btn ghost" id="back">Zur Übersicht</button>
  `);
  let timer = null;
  on("#note", "input", e => {
    clearTimeout(timer);
    const value = e.target.value;
    timer = setTimeout(() => {
      saveNote(id, { notiz: value });
      document.getElementById("saved").textContent = "Gespeichert ✓";
    }, 400);
  });
  on("#sure", "change", e => saveNote(id, { sicher: e.target.checked }));
  on("#prev", "click", () => showQuestion(INTERVIEW[idx - 1].id));
  on("#nextQ", "click", () => showQuestion(INTERVIEW[idx + 1].id));
  on("#back", "click", showOverview);
}

// Übungsmodus: Frage laut beantworten, Zeit läuft mit, danach mit Tipps und Notizen vergleichen
function practice() {
  const n = notes();
  const open = INTERVIEW.filter(x => !(n[x.id] && n[x.id].sicher));
  const item = rand(open.length ? open : INTERVIEW);
  const start = Date.now();
  render(`
    <div class="cat">${esc(GROUPS[item.group])}</div>
    <p class="statement">„${esc(item.q)}“</p>
    <p class="center muted small">Antworte laut, als säße dir jemand gegenüber. Ziel: etwa 1–2 Minuten.</p>
    <div class="timer" id="clock" style="font-size:28px">0 s</div>
    <button class="btn" id="done">Fertig – Tipps ansehen</button>
    <button class="btn ghost" id="back">Übungsmodus beenden</button>
  `);
  startTick(() => {
    const secs = Math.round((Date.now() - start) / 1000);
    const el = document.getElementById("clock");
    el.textContent = formatDuration(secs);
    el.style.color = secs > 150 ? "var(--warn)" : "";
  }, 500);
  on("#done", "click", () => practiceReview(item, Math.round((Date.now() - start) / 1000)));
  on("#back", "click", showOverview);
}

function practiceReview(item, secs) {
  const s = notes()[item.id] || {};
  const timing = secs < 30 ? "Eher kurz – versuch, ein konkretes Beispiel einzubauen."
    : secs > 150 ? "Recht lang – versuch, auf den Punkt zu kommen."
      : "Gute Länge.";
  render(`
    <div class="cat">${esc(GROUPS[item.group])}</div>
    <h2>${esc(item.q)}</h2>
    <p class="muted">Deine Zeit: <strong>${formatDuration(secs)}</strong> · ${timing}</p>
    ${s.notiz ? `<section class="card"><h3>Deine Stichpunkte</h3><p style="white-space:pre-line">${esc(s.notiz)}</p></section>` : ""}
    ${detailHtml(item)}
    <div class="btn-row">
      <button class="btn secondary" id="again">Nochmal üben</button>
      <button class="btn" id="sure">Saß gut ✓</button>
    </div>
    <button class="btn ghost" id="edit">Stichpunkte bearbeiten</button>
    <button class="btn ghost" id="back">Zur Übersicht</button>
  `);
  on("#again", "click", practice);
  on("#sure", "click", () => { saveNote(item.id, { sicher: true }); practice(); });
  on("#edit", "click", () => showQuestion(item.id));
  on("#back", "click", showOverview);
}

screen("interview", showOverview);
