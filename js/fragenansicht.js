// Darstellung einer Frage (Text, Lesetext, Grafik, Antwortknöpfe) – genutzt von Übung und Prüfung.

import { esc } from "./util.js";

// order: Reihenfolge der Antwort-Indizes (gemischt), damit man sich keine Position merkt
export function questionBodyHtml(q, order) {
  const passage = q.text ? `<div class="passage">${esc(q.text)}</div>` : "";
  const stem = q.stemHtml ? `<div class="stem">${q.stemHtml}</div>` : "";
  let options;
  if (q.optHtml) {
    options = `<div class="optgrid">${order.map((i, k) => `
      <button class="opt fig" data-i="${i}" aria-label="Antwort ${"ABCD"[k]}">
        <span class="optlabel">${"ABCD"[k]}</span>${q.optHtml[i]}
      </button>`).join("")}</div>`;
  } else {
    options = order.map(i => `<button class="opt" data-i="${i}">${esc(q.opts[i])}</button>`).join("");
  }
  return `${passage}<p class="qtext">${esc(q.q)}</p>${stem}<div id="opts">${options}</div>`;
}

export function shuffledOrder(q) {
  const order = q.opts.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

// Nach der Antwort: richtige Antwort grün, gewählte falsche rot, alle Knöpfe sperren
export function markAnswer(root, q, chosen) {
  root.querySelectorAll(".opt").forEach(btn => {
    const i = Number(btn.dataset.i);
    btn.disabled = true;
    if (i === q.correct) btn.classList.add("correct");
    else if (i === chosen) btn.classList.add("wrong");
  });
}

// Kurztext einer Frage für Listen (Prüfungsauswertung, gemeldete Fragen)
export function answerText(q, index) {
  if (index < 0 || index === undefined || index === null) return "keine Antwort";
  return q.optHtml ? `Antwort ${q.optLabels ? q.optLabels[index] : index + 1}` : q.opts[index];
}
