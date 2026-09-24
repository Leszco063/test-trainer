// Startbildschirm: Fortschritt, Einstellungen für die Übungsrunde und Menü zu allen Bereichen.

import { QUESTIONS } from "./fragen.js";
import { CATEGORIES, LEVEL_NAMES, TIMER_SECONDS } from "./config.js";
import { esc } from "./util.js";
import { render, on, screen, go } from "./ui.js";
import { loadProgress, loadSettings, saveSettings, historySummary, categoryWeakness, trend } from "./speicher.js";

// Chrome/Edge am PC bieten an, die Web-App wie ein Programm zu installieren
let installPrompt = null;
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  installPrompt = e;
  renderInstallButton();
});

function renderInstallButton() {
  const slot = document.getElementById("installSlot");
  if (!slot) return;
  slot.innerHTML = installPrompt ? `<button class="btn secondary" id="install">Als App auf diesem PC installieren</button>` : "";
  const btn = document.getElementById("install");
  if (btn) btn.addEventListener("click", async () => {
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    renderInstallButton();
  });
}

function progressCard(data) {
  if (!data.runs.length) return "";
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
  return `
    <section class="card">
      <h3>Dein Fortschritt</h3>
      <p>Letzte Runden: <strong>${last}</strong></p>
      ${trendHtml}${weakHtml}
    </section>`;
}

function showStart() {
  const settings = loadSettings();
  const data = loadProgress();
  const { seen, wrong } = historySummary(data.fragen);

  render(`
    <h1>Einstellungstest-Trainer</h1>
    <p class="muted small">${QUESTIONS.length} Fragen · bearbeitet: ${seen} · zuletzt falsch: ${wrong}</p>

    <nav class="menu">
      <button class="menu-item wide" data-go="pruefung"><strong>Prüfungssimulation</strong><span>Wie der echte Test: Abschnitte mit Zeitlimit, Auswertung am Ende</span></button>
    </nav>
    ${progressCard(data)}

    <section class="card">
      <h3>Übungsrunde</h3>
      <div class="chips">
        ${CATEGORIES.map(c => `<button class="chip ${settings.cats[c] ? "on" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("")}
      </div>
      <div class="row" style="margin-top:8px">
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
        <div>Zeitdruck<div class="muted small">${TIMER_SECONDS} Sekunden pro Frage</div></div>
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
      <button class="btn" id="start">Übung starten</button>
      ${wrong ? `<button class="btn warn" id="fehler">Fehler wiederholen (${wrong})</button>` : ""}
    </section>

    <nav class="menu">
      <button class="menu-item" data-go="persoenlichkeit"><strong>Persönlichkeitsteil</strong><span>Skalenfragen ohne richtig/falsch</span></button>
      <button class="menu-item" data-go="statistik"><strong>Statistik</strong><span>Verlauf, Prüfungen, Fortschritt sichern</span></button>
    </nav>
    <div id="installSlot"></div>
  `);
  renderInstallButton();

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
    document.querySelectorAll("[data-level]").forEach(b => b.classList.toggle("on", Number(b.dataset.level) === settings.level));
    saveSettings(settings);
  });
  on("#timer", "change", e => { settings.timer = e.target.checked; saveSettings(settings); });
  const setCount = n => {
    settings.count = Math.max(5, Math.min(100, n));
    document.getElementById("count").textContent = settings.count;
    saveSettings(settings);
  };
  on("#minus", "click", () => setCount(settings.count - 5));
  on("#plus", "click", () => setCount(settings.count + 5));
  on("#start", "click", () => go("uebung", "normal"));
  on("#fehler", "click", () => go("uebung", "fehler"));
  on("[data-go]", "click", e => go(e.currentTarget.dataset.go));
}

screen("start", showStart);
