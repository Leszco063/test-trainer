// Statistik-Ansicht mit Verlauf, Trefferquoten, bearbeiteten Fragen und Export/Import.

import { QUESTIONS } from "./fragen.js";
import { POOL_CATEGORIES } from "./config.js";
import { esc } from "./util.js";
import { render, on, barColor, screen, go } from "./ui.js";
import { loadProgress, importProgress, categoryWeakness, historySummary, boxStats, dailyStatus } from "./speicher.js";

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

  const coverHtml = POOL_CATEGORIES.map(cat => {
    const qs = QUESTIONS.filter(q => q.cat === cat);
    const { seen, wrong } = historySummary(data.fragen, qs);
    return `<span class="${wrong ? "warn-text" : ""}">${esc(cat)}: ${seen}/${qs.length}${wrong ? ` (${wrong} offen)` : ""}</span>`;
  }).join("");

  const exams = data.pruefungen.slice(-5).reverse();
  const examHtml = exams.length
    ? exams.map(x => `
        <div class="bar-row"><span class="small">${esc(x.datum.slice(5, 10).split("-").reverse().join("."))} · ${esc(x.variante)}</span>
          <div class="bar"><div style="width:${x.prozent}%;background:${barColor(x.prozent)}"></div></div>
          <span class="bar-val">${x.prozent} Pkt</span></div>`).join("")
    : `<p class="muted">Noch keine Prüfungssimulation gemacht.</p>`;

  const boxes = boxStats(data.fragen);
  const boxLabels = ["Noch nie gehabt", "Box 1 · wackelig", "Box 2", "Box 3", "Box 4", "Box 5 · gelernt"];
  const boxColors = ["var(--track)", "var(--bad)", "var(--lvl2)", "var(--lvl2)", "var(--ok)", "var(--ok)"];
  const boxHtml = boxes.map((n, i) => `
    <div class="bar-row"><span class="small">${boxLabels[i]}</span>
      <div class="bar"><div style="width:${(n / QUESTIONS.length) * 100}%;background:${boxColors[i]}"></div></div>
      <span class="bar-val">${n}</span></div>`).join("");

  const day = dailyStatus(data);
  const activeDays = Object.keys(data.tage).length;
  const totalAnswers = Object.values(data.tage).reduce((s, t) => s + t.anzahl, 0);

  render(`
    <h2>Deine Statistik</h2>
    <section class="card">
      <h3>Dranbleiben</h3>
      <div class="grid2">
        <span>Aktuelle Serie: <strong>${day.serie} ${day.serie === 1 ? "Tag" : "Tage"}</strong></span>
        <span>Rekord: <strong>${day.rekord} ${day.rekord === 1 ? "Tag" : "Tage"}</strong></span>
        <span>Übungstage: <strong>${activeDays}</strong></span>
        <span>Aufgaben gesamt: <strong>${totalAnswers}</strong></span>
      </div>
    </section>
    <section class="card">
      <h3>Lernstand (Leitner-Boxen)</h3>
      ${boxHtml}
      <p class="small muted" style="margin-top:8px">Richtig beantwortet → eine Box weiter, falsch → zurück in Box 1. Wiederholt wird nach 0, 1, 3, 7 und 16 Tagen.</p>
    </section>
    <section class="card"><h3>Verlauf der letzten Runden</h3>${historyHtml}</section>
    <section class="card"><h3>Prüfungssimulationen</h3>${examHtml}</section>
    <section class="card"><h3>Trefferquote je Bereich</h3>${catHtml}</section>
    <section class="card"><h3>Bearbeitete Fragen</h3><div class="grid2">${coverHtml}</div></section>
    <button class="menu-item wide" id="reports" style="width:100%;margin:12px 0">
      <strong>Gemeldete Fragen (${data.meldungen.length})</strong>
      <span>Liste ansehen und an mich weitergeben</span>
    </button>
    <section class="card">
      <h3>Fortschritt sichern</h3>
      <p class="small muted">Als Datei speichern, auf ein anderes Gerät übertragen oder vom alten PC-Programm übernehmen (telekom_trainer_fortschritt.json).</p>
      <button class="btn secondary" id="export">Fortschritt exportieren</button>
      <button class="btn secondary" id="import">Fortschritt importieren</button>
      <input type="file" id="importFile" accept=".json,application/json" hidden>
    </section>
    <button class="btn" id="back">Zurück</button>
  `);

  on("#back", "click", () => go("start"));
  on("#reports", "click", () => go("meldungen"));
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
        if (!confirm("Der aktuelle Fortschritt auf diesem Gerät wird durch die Datei ersetzt. Fortfahren?")) return;
        importProgress(imported);
        showStats();
      } catch (err) {
        alert("Die Datei konnte nicht gelesen werden. Ist es eine telekom_trainer_fortschritt.json?");
      }
    };
    reader.readAsText(file);
  });
}

screen("statistik", showStats);
