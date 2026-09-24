// Spickzettel-Ansicht: Übersicht aller Lernkarten, einzelne Karte, und ein Overlay,
// das sich über einer laufenden Übung öffnen lässt, ohne sie zu beenden.

import { CARDS } from "./lernkarten.js";
import { esc } from "./util.js";
import { render, on, screen, go } from "./ui.js";

function showOverview() {
  const cats = [...new Set(CARDS.map(c => c.cat))];
  render(`
    <h2>Spickzettel</h2>
    <p class="muted small">Kurz und knapp das Wichtigste – vor dem Üben durchlesen oder nachschlagen, wenn etwas nicht klappt.</p>
    ${cats.map(cat => `
      <section class="card">
        <h3>${esc(cat)}</h3>
        ${CARDS.filter(c => c.cat === cat).map(c => `<button class="list-item" data-card="${c.id}">${esc(c.title)}<span>›</span></button>`).join("")}
      </section>`).join("")}
    <button class="btn ghost" id="back">Zurück</button>
  `);
  on("[data-card]", "click", e => showCard(e.currentTarget.dataset.card));
  on("#back", "click", () => go("start"));
}

function showCard(id) {
  const card = CARDS.find(c => c.id === id);
  const practiceCat = card.cat === "Test-Taktik" ? null : card.cat;
  render(`
    <div class="cat">${esc(card.cat)}</div>
    <h2>${esc(card.title)}</h2>
    <section class="card lernkarte">${card.html}</section>
    ${practiceCat ? `<button class="btn" id="practice">${esc(practiceCat)} jetzt üben</button>` : ""}
    <button class="btn secondary" id="back">Alle Spickzettel</button>
  `);
  on("#practice", "click", () => go("uebung", "normal", { cats: [practiceCat] }));
  on("#back", "click", showOverview);
}

// Overlay über der aktuellen Ansicht (z. B. mitten in einer Übung)
export function openCardOverlay(card) {
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = `
    <div class="overlay-sheet" role="dialog" aria-modal="true" aria-label="${esc(card.title)}">
      <div class="overlay-head">
        <strong>${esc(card.title)}</strong>
        <button class="overlay-close" aria-label="Schließen">✕</button>
      </div>
      <div class="lernkarte">${card.html}</div>
      <button class="btn" data-close>Zurück zur Aufgabe</button>
    </div>`;
  const close = () => overlay.remove();
  overlay.addEventListener("click", e => {
    if (e.target === overlay || e.target.closest(".overlay-close") || e.target.closest("[data-close]")) close();
  });
  document.body.appendChild(overlay);
}

screen("lernen", showOverview);
