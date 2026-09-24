// Startbildschirm: Fortschritt, Einstellungen für die Übungsrunde und Menü zu allen Bereichen.

import { QUESTIONS } from "./fragen.js";
import { CATEGORIES, LEVEL_NAMES, TIMER_SECONDS } from "./config.js";
import { esc } from "./util.js";
import { render, on, screen, go } from "./ui.js";
import { loadProgress, loadSettings, saveSettings, historySummary, categoryWeakness, trend, dueQuestions, boxStats, LEARNED_BOX, dailyStatus } from "./speicher.js";

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

const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

function dailyCard() {
  const d = dailyStatus();
  const pct = Math.min(100, (d.heute / d.ziel) * 100);
  return `
    <section class="card daily">
      <div class="daily-top">
        <div><strong>Heute: ${d.heute} / ${d.ziel}</strong> <span class="muted small">Aufgaben</span></div>
        <div class="streak ${d.serie ? "" : "muted"}">${d.serie ? "🔥" : "○"} ${d.serie} ${d.serie === 1 ? "Tag" : "Tage"}</div>
      </div>
      <div class="progress" style="margin:8px 0 10px"><div style="width:${pct}%;${d.erreicht ? "background:var(--ok)" : ""}"></div></div>
      <div class="week">
        ${d.woche.map((w, i) => {
          const [y, m, day] = w.key.split("-").map(Number);
          const label = WEEKDAYS[new Date(y, m - 1, day).getDay()];
          return `<span class="day ${w.erreicht ? "met" : w.anzahl ? "partly" : ""} ${i === 6 ? "today" : ""}" title="${w.anzahl} Aufgaben">${label}</span>`;
        }).join("")}
      </div>
      <div class="row small" style="padding-bottom:0">
        <span class="muted">${d.erreicht ? "Ziel für heute geschafft ✓" : `Noch ${d.ziel - d.heute} bis zum Tagesziel`}</span>
        <div class="stepper small-stepper">
          <button id="goalMinus" aria-label="Tagesziel verringern">−</button>
          <output>${d.ziel}</output>
          <button id="goalPlus" aria-label="Tagesziel erhöhen">+</button>
        </div>
      </div>
    </section>`;
}

function showStart() {
  const settings = loadSettings();
  const data = loadProgress();
  const { seen } = historySummary(data.fragen);
  const due = dueQuestions(data.fragen).length;
  const learned = boxStats(data.fragen)[LEARNED_BOX];

  render(`
    <h1>Einstellungstest-Trainer</h1>
    <p class="muted small">${QUESTIONS.length} Fragen · bearbeitet: ${seen} · gelernt: ${learned} · heute fällig: ${due}</p>
    ${dailyCard()}

    <nav class="menu">
      <button class="menu-item wide" data-go="pruefung"><strong>Prüfungssimulation</strong><span>Wie der echte Test: Abschnitte mit Zeitlimit, Auswertung am Ende</span></button>
      <button class="menu-item" data-go="lernen"><strong>Spickzettel</strong><span>Formeln, Regeln und Tricks zum Nachlesen</span></button>
      <button class="menu-item" data-go="interview"><strong>Interview</strong><span>Best Fit Interview vorbereiten und üben</span></button>
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
      ${due ? `<button class="btn warn" id="faellig">Heute fällig: ${due} wiederholen</button>` : ""}
    </section>

    <h3 style="margin-top:18px">Persönlichkeit & Situationen</h3>
    <nav class="menu">
      <button class="menu-item" data-go="sjt"><strong>Situationen (SJT)</strong><span>8 Punkte auf 4 Reaktionen verteilen</span></button>
      <button class="menu-item" data-go="persoenlichkeit"><strong>Persönlichkeit</strong><span>Skalenfragen ohne richtig/falsch</span></button>
      <button class="menu-item" data-go="interessen"><strong>Interessen</strong><span>Berufs-Matching wie im Test</span></button>
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
  on("#faellig", "click", () => go("uebung", "faellig"));
  const setGoal = n => {
    settings.dailyGoal = Math.max(10, Math.min(200, n));
    saveSettings(settings);
    showStart();
  };
  on("#goalMinus", "click", () => setGoal(settings.dailyGoal - 10));
  on("#goalPlus", "click", () => setGoal(settings.dailyGoal + 10));
  on("[data-go]", "click", e => go(e.currentTarget.dataset.go));
}

screen("start", showStart);
