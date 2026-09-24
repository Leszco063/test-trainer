// "Frage melden": fehlerhafte oder unklare Fragen vormerken und später gesammelt weitergeben.

import { esc, nowStamp } from "./util.js";
import { render, on, screen, go, toast } from "./ui.js";
import { loadProgress, saveProgress } from "./speicher.js";

const REASONS = ["Antwort falsch", "Frage unklar", "Tippfehler", "Sonstiges"];

function isReported(q) {
  return loadProgress().meldungen.some(m => m.id === q.id);
}

// Kompakte, lesbare Kopie der Frage – auch generierte Aufgaben bleiben so nachvollziehbar
function snapshot(q, chosen) {
  return {
    id: q.id,
    bereich: q.cat,
    level: q.level,
    frage: q.q,
    text: q.text || q.memo || "",
    antworten: q.opts,
    richtig: q.opts[q.correct],
    gewaehlt: chosen >= 0 ? q.opts[chosen] : null,
    erklaerung: q.explain,
    generiert: !!q.gen,
  };
}

export function openReportOverlay(q, chosen, onDone) {
  if (isReported(q)) {
    toast("Diese Frage ist schon gemeldet.");
    return;
  }
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = `
    <div class="overlay-sheet" role="dialog" aria-modal="true" aria-label="Frage melden">
      <div class="overlay-head"><strong>Frage melden</strong><button class="overlay-close" aria-label="Schließen">✕</button></div>
      <p class="small muted">${esc(q.q)}</p>
      <p><strong>Was stimmt nicht?</strong></p>
      <div class="chips">${REASONS.map((r, i) => `<button class="chip ${i === 0 ? "on" : ""}" data-reason="${esc(r)}">${esc(r)}</button>`).join("")}</div>
      <textarea id="reportNote" rows="3" placeholder="Optional: Was ist dir aufgefallen?"></textarea>
      <button class="btn" id="reportSave">Melden</button>
    </div>`;
  let reason = REASONS[0];
  const close = () => overlay.remove();
  overlay.addEventListener("click", e => {
    if (e.target === overlay || e.target.closest(".overlay-close")) close();
    const chip = e.target.closest("[data-reason]");
    if (chip) {
      reason = chip.dataset.reason;
      overlay.querySelectorAll("[data-reason]").forEach(c => c.classList.toggle("on", c === chip));
    }
    if (e.target.closest("#reportSave")) {
      const data = loadProgress();
      data.meldungen.push({ datum: nowStamp().slice(0, 16), grund: reason, notiz: overlay.querySelector("#reportNote").value.trim(), ...snapshot(q, chosen) });
      saveProgress(data);
      close();
      toast("Danke – Frage gemeldet ⚑");
      if (onDone) onDone();
    }
  });
  document.body.appendChild(overlay);
}

// Text zum Weitergeben (z. B. per WhatsApp oder Mail)
function reportText(list) {
  return list.map((m, i) => [
    `${i + 1}. [${m.bereich}, Level ${m.level}] ${m.grund}${m.generiert ? " (generierte Aufgabe)" : ""}`,
    m.text ? `   Text: ${m.text.slice(0, 300)}${m.text.length > 300 ? " …" : ""}` : null,
    `   Frage: ${m.frage}`,
    `   Antworten: ${m.antworten.join(" | ")}`,
    `   Als richtig hinterlegt: ${m.richtig}`,
    m.gewaehlt ? `   Gewählt: ${m.gewaehlt}` : null,
    m.notiz ? `   Notiz: ${m.notiz}` : null,
    m.generiert ? null : `   ID: ${m.id}`,
  ].filter(Boolean).join("\n")).join("\n\n");
}

function showReports() {
  const list = loadProgress().meldungen;
  render(`
    <h2>Gemeldete Fragen</h2>
    ${list.length ? `
      <p class="muted small">${list.length} Meldung${list.length === 1 ? "" : "en"}. Schick mir die Liste, dann korrigiere ich die Fragen.</p>
      <div class="btn-row">
        ${navigator.share ? `<button class="btn" id="share">Teilen</button>` : ""}
        <button class="btn ${navigator.share ? "secondary" : ""}" id="copy">Kopieren</button>
      </div>
      ${list.map((m, i) => `
        <section class="card">
          <div class="cat">${esc(m.bereich)} · ${esc(m.grund)}</div>
          <p><strong>${esc(m.frage)}</strong></p>
          <p class="small">Hinterlegt: ${esc(m.richtig)}${m.gewaehlt ? ` · Gewählt: ${esc(m.gewaehlt)}` : ""}</p>
          ${m.notiz ? `<p class="small muted">„${esc(m.notiz)}“</p>` : ""}
          <button class="link" data-del="${i}">Entfernen</button>
        </section>`).join("")}
      <button class="btn ghost" id="clear">Alle als erledigt entfernen</button>
    ` : `<p class="muted">Noch keine Fragen gemeldet. Nach jeder Antwort findest du den Knopf „⚑ Frage melden“.</p>`}
    <button class="btn secondary" id="back">Zurück</button>
  `);
  on("#back", "click", () => go("statistik"));
  on("#share", "click", async () => {
    try { await navigator.share({ title: "Gemeldete Fragen", text: reportText(list) }); } catch (e) { /* abgebrochen */ }
  });
  on("#copy", "click", async () => {
    try {
      await navigator.clipboard.writeText(reportText(list));
      toast("Liste kopiert");
    } catch (e) {
      prompt("Zum Kopieren markieren:", reportText(list));
    }
  });
  on("[data-del]", "click", e => {
    const data = loadProgress();
    data.meldungen.splice(Number(e.currentTarget.dataset.del), 1);
    saveProgress(data);
    showReports();
  });
  on("#clear", "click", () => {
    if (!confirm("Alle Meldungen entfernen?")) return;
    const data = loadProgress();
    data.meldungen = [];
    saveProgress(data);
    showReports();
  });
}

screen("meldungen", showReports);
