// Situational Judgement Test: 8 Zustimmungspunkte auf vier Reaktionen verteilen – wie im
// Telekom-Onlinetest. Auswertung als Orientierung, nicht als offizielle Bewertung.

import { SJT, SJT_POINTS, VALUE_LABELS } from "./sjt-daten.js";
import { esc, shuffle } from "./util.js";
import { render, on, screen, go } from "./ui.js";

const VALUE_COLORS = { 2: "var(--ok)", 1: "var(--info)", 0: "var(--muted)", "-1": "var(--bad)" };

// Kennzahlen einer Runde: Anteil der Punkte auf sehr konstruktiven bzw. ungünstigen Reaktionen
export function sjtSummary(results) {
  const total = results.length * SJT_POINTS;
  let best = 0, bad = 0;
  for (const { item, alloc } of results) {
    item.options.forEach((o, i) => {
      if (o.wert === 2) best += alloc[i];
      if (o.wert === -1) bad += alloc[i];
    });
  }
  return { bestPct: total ? Math.round((best / total) * 100) : 0, badPct: total ? Math.round((bad / total) * 100) : 0 };
}

// Einen Block von Situationen durchlaufen; onDone(results) wird am Ende aufgerufen
export function runSjtBlock(items, onDone, title = "Situationen") {
  const results = [];
  let index = 0;

  const show = () => {
    const item = items[index];
    const order = shuffle(item.options.map((_, i) => i));
    const alloc = item.options.map(() => 0);
    const draw = () => {
      const left = SJT_POINTS - alloc.reduce((a, b) => a + b, 0);
      render(`
        <div class="qhead"><span>${esc(title)} ${index + 1} / ${items.length}</span></div>
        <div class="progress" style="margin-top:8px"><div style="width:${(index / items.length) * 100}%"></div></div>
        <p class="qtext">${esc(item.situation)}</p>
        <p class="muted small">Verteile ${SJT_POINTS} Punkte: Je mehr Punkte, desto eher würdest du so reagieren.</p>
        ${order.map(i => `
          <div class="sjt-option">
            <p>${esc(item.options[i].text)}</p>
            <div class="stepper">
              <button data-minus="${i}" ${alloc[i] === 0 ? "disabled" : ""} aria-label="weniger">−</button>
              <output>${alloc[i]}</output>
              <button data-plus="${i}" ${left === 0 ? "disabled" : ""} aria-label="mehr">+</button>
            </div>
          </div>`).join("")}
        <p class="center ${left ? "warn-text" : "trend-up"}"><strong>${left ? `Noch ${left} Punkt${left === 1 ? "" : "e"} zu verteilen` : "Alle Punkte verteilt ✓"}</strong></p>
        <button class="btn" id="next" ${left ? "disabled" : ""}>${index + 1 < items.length ? "Weiter" : "Auswertung"}</button>
      `);
      on("[data-plus]", "click", e => { alloc[Number(e.currentTarget.dataset.plus)] += 1; draw(); });
      on("[data-minus]", "click", e => { alloc[Number(e.currentTarget.dataset.minus)] -= 1; draw(); });
      on("#next", "click", () => {
        results.push({ item, alloc: alloc.slice() });
        index += 1;
        if (index < items.length) show();
        else onDone(results);
      });
    };
    draw();
  };
  show();
}

export function sjtReviewHtml(results) {
  return results.map(({ item, alloc }) => `
    <section class="card">
      <p><strong>${esc(item.situation)}</strong></p>
      ${item.options.map((o, i) => `
        <div class="sjt-review">
          <span class="sjt-points">${alloc[i]}</span>
          <div>
            <p>${esc(o.text)}</p>
            <p class="small"><span style="color:${VALUE_COLORS[o.wert]};font-weight:700">${VALUE_LABELS[o.wert]}</span> – ${esc(o.warum)}</p>
          </div>
        </div>`).join("")}
    </section>`).join("");
}

function showIntro() {
  render(`
    <h2>Situationen (SJT)</h2>
    <section class="card">
      <p>Im Telekom-Onlinetest gibt es einen <strong>Situational Judgement Test</strong>: kurze Situationen aus dem Arbeitsalltag mit je vier Reaktionen. Du verteilst <strong>${SJT_POINTS} Zustimmungspunkte</strong> – je mehr Punkte, desto eher würdest du so handeln.</p>
      <p>Offiziell gibt es kein Richtig oder Falsch. Arbeitgeber achten aber erkennbar auf ein paar Dinge:</p>
      <ul class="hints">
        <li><strong>Direkt und respektvoll kommunizieren</strong> – erst mit der Person selbst reden, dann eskalieren.</li>
        <li><strong>Kundenorientierung</strong> – das Problem des Kunden ernst nehmen und realistisch lösen.</li>
        <li><strong>Verantwortung übernehmen</strong> – Fehler und Verzögerungen früh ansprechen.</li>
        <li><strong>Regeln einhalten</strong> – Datenschutz, IT-Sicherheit, ehrliche Zeiterfassung.</li>
        <li><strong>Selbstständig, aber abgesichert</strong> – erst selbst versuchen, dann gezielt fragen.</li>
      </ul>
      <p class="small muted">Die Auswertung hier ist eine Orientierung, wie solche Reaktionen typischerweise gesehen werden – nicht die echte Telekom-Bewertung. Antworte im echten Test ehrlich; widersprüchliche Muster fallen auf.</p>
    </section>
    <button class="btn" id="go">8 Situationen üben</button>
    <button class="btn ghost" id="back">Zurück</button>
  `);
  on("#go", "click", () => runSjtBlock(shuffle(SJT).slice(0, 8), showResult));
  on("#back", "click", () => go("start"));
}

function showResult(results) {
  const { bestPct, badPct } = sjtSummary(results);
  const verdict = bestPct >= 60 && badPct <= 5 ? "Deine Reaktionen passen gut zu dem, was Arbeitgeber meist erwarten."
    : badPct > 15 ? "Einige Punkte liegen auf eher ungünstigen Reaktionen – schau dir die Begründungen unten an."
      : "Solide – bei manchen Situationen gibt es noch konstruktivere Reaktionen.";
  render(`
    <h2>Auswertung</h2>
    <section class="card">
      <div class="bar-row"><span>Sehr konstruktiv</span><div class="bar"><div style="width:${bestPct}%;background:var(--ok)"></div></div><span class="bar-val">${bestPct}%</span></div>
      <div class="bar-row"><span>Eher ungünstig</span><div class="bar"><div style="width:${badPct}%;background:var(--bad)"></div></div><span class="bar-val">${badPct}%</span></div>
      <p style="margin-top:8px">${verdict}</p>
      <p class="small muted">Anteil deiner Punkte auf den jeweiligen Reaktionen. Orientierung, keine offizielle Bewertung.</p>
    </section>
    ${sjtReviewHtml(results)}
    <button class="btn" id="again">Nochmal üben</button>
    <button class="btn secondary" id="home">Zum Start</button>
  `);
  on("#again", "click", () => runSjtBlock(shuffle(SJT).slice(0, 8), showResult));
  on("#home", "click", () => go("start"));
}

screen("sjt", showIntro);
