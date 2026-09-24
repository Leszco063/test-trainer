// Persönlichkeitsteil: Skalenfragen ohne richtig/falsch, nur zum Kennenlernen des Formats.
// "rev": true = umgekehrt formulierte Aussage (hohe Zustimmung spricht GEGEN die Eigenschaft).

import { esc, shuffle } from "./util.js";
import { render, on, screen, go } from "./ui.js";

const ITEMS = [
  { dim: "Teamfähigkeit", text: "Ich arbeite gern mit anderen zusammen an einer Aufgabe." },
  { dim: "Teamfähigkeit", text: "Bevor ich entscheide, frage ich gern nach der Meinung anderer." },
  { dim: "Teamfähigkeit", text: "Aufgaben erledige ich lieber komplett allein.", rev: true },
  { dim: "Teamfähigkeit", text: "Wenn Kollegen Hilfe brauchen, unterstütze ich sie, auch wenn ich selbst viel zu tun habe." },
  { dim: "Gewissenhaftigkeit", text: "Ich plane meine Aufgaben, bevor ich anfange." },
  { dim: "Gewissenhaftigkeit", text: "Ich prüfe meine Arbeit noch einmal, bevor ich sie abgebe." },
  { dim: "Gewissenhaftigkeit", text: "Termine und Fristen vergesse ich öfter mal.", rev: true },
  { dim: "Gewissenhaftigkeit", text: "An Absprachen halte ich mich, auch wenn es unbequem ist." },
  { dim: "Belastbarkeit", text: "Unter Zeitdruck bleibe ich ruhig." },
  { dim: "Belastbarkeit", text: "Kritik beschäftigt mich oft noch tagelang.", rev: true },
  { dim: "Belastbarkeit", text: "Nach einem Rückschlag probiere ich einen neuen Lösungsweg." },
  { dim: "Belastbarkeit", text: "Wenn vieles gleichzeitig anfällt, verliere ich schnell den Überblick.", rev: true },
  { dim: "Kundenorientierung", text: "Ich erkläre technische Dinge gern so, dass Laien sie verstehen." },
  { dim: "Kundenorientierung", text: "Auch bei unfreundlichen Menschen bleibe ich sachlich." },
  { dim: "Kundenorientierung", text: "Mir ist wichtig, dass das Problem für den anderen wirklich gelöst ist." },
  { dim: "Kundenorientierung", text: "Ungeduldige Nachfragen nerven mich schnell.", rev: true },
  { dim: "Lernbereitschaft", text: "Neue Technik bringe ich mir gern selbst bei." },
  { dim: "Lernbereitschaft", text: "Wenn ich etwas nicht verstanden habe, frage ich nach." },
  { dim: "Lernbereitschaft", text: "Solange etwas funktioniert, sehe ich keinen Grund, Neues dazuzulernen.", rev: true },
  { dim: "Lernbereitschaft", text: "Fehler sehe ich als Chance, etwas dazuzulernen." },
];

const SCALE_LABELS = ["Trifft gar nicht zu", "Trifft eher nicht zu", "Teils, teils", "Trifft eher zu", "Trifft voll zu"];

let PS = null;

function showIntro() {
  render(`
    <h2>Persönlichkeitsteil üben</h2>
    <section class="card">
      <p>In vielen Online-Assessments schätzt du Aussagen auf einer Skala ein – von „trifft gar nicht zu“ bis „trifft voll zu“. Richtig oder falsch gibt es nicht.</p>
      <p><strong>Worauf es ankommt:</strong></p>
      <ul class="hints">
        <li>Ehrlich und zügig antworten – nicht lange grübeln.</li>
        <li>Einheitlich bleiben: Ähnliche Aussagen kommen oft mehrfach vor, teils umgekehrt formuliert. Widersprüche fallen auf.</li>
        <li>Nicht nur Extremwerte wählen, aber auch nicht alles auf „teils, teils“.</li>
      </ul>
      <p class="small muted">${ITEMS.length} Aussagen. Die Auswertung ist nur ein Hinweis zum Format, keine echte Bewertung, und wird nicht gespeichert.</p>
    </section>
    <button class="btn" id="go">Starten</button>
    <button class="btn ghost" id="back">Zurück</button>
  `);
  on("#go", "click", start);
  on("#back", "click", () => go("start"));
}

function start() {
  PS = { items: shuffle(ITEMS), index: 0, answers: [] };
  showItem();
}

function showItem() {
  const item = PS.items[PS.index];
  render(`
    <div class="qhead"><span>Aussage ${PS.index + 1} / ${PS.items.length}</span></div>
    <div class="progress" style="margin-top:8px"><div style="width:${(PS.index / PS.items.length) * 100}%"></div></div>
    <p class="statement">${esc(item.text)}</p>
    <div class="scale">
      ${SCALE_LABELS.map((label, i) => `<button class="opt" data-v="${i + 1}">${label}</button>`).join("")}
    </div>
    <button class="btn ghost" id="cancel">Abbrechen</button>
  `);
  on("[data-v]", "click", e => {
    PS.answers.push({ item, value: Number(e.currentTarget.dataset.v) });
    PS.index += 1;
    if (PS.index < PS.items.length) showItem();
    else showResult();
  });
  on("#cancel", "click", () => go("start"));
}

function showResult() {
  const byDim = {};
  for (const { item, value } of PS.answers) {
    const scored = item.rev ? 6 - value : value;
    (byDim[item.dim] = byDim[item.dim] || []).push({ item, scored });
  }

  const contradictions = [];
  const rows = Object.entries(byDim).map(([dim, entries]) => {
    const avg = entries.reduce((s, e) => s + e.scored, 0) / entries.length;
    const normal = entries.filter(e => !e.item.rev).map(e => e.scored);
    if (normal.length) {
      const normalAvg = normal.reduce((a, b) => a + b, 0) / normal.length;
      entries.filter(e => e.item.rev && Math.abs(e.scored - normalAvg) >= 2).forEach(e => contradictions.push(e.item.text));
    }
    return { dim, avg };
  });

  const values = PS.answers.map(a => a.value);
  const extremes = values.filter(v => v === 1 || v === 5).length / values.length;
  const middles = values.filter(v => v === 3).length / values.length;
  const hints = [];
  if (contradictions.length) {
    hints.push(`<span class="warn-text">⚠ ${contradictions.length} Antwort(en) passen nicht zu deinen anderen Antworten im selben Bereich – das sind umgekehrt formulierte Aussagen. Genau lesen!</span><br><span class="small muted">z. B.: „${esc(contradictions[0])}“</span>`);
  } else {
    hints.push(`<span class="trend-up">✓ Deine Antworten sind in sich stimmig – auch bei umgekehrt formulierten Aussagen.</span>`);
  }
  if (extremes > 0.7) hints.push("⚠ Sehr viele Extremantworten (1 oder 5). Das kann unglaubwürdig oder übertrieben wirken.");
  if (middles > 0.5) hints.push("⚠ Sehr oft „teils, teils“. Das wirkt unentschlossen – trau dich zu klaren Aussagen.");
  const low = rows.filter(r => r.avg < 2.5).map(r => r.dim);
  if (low.length) hints.push(`ℹ Eher niedrig: ${low.map(esc).join(", ")}. Für Kundenkontakt und Teamarbeit lohnt es sich, im Interview Beispiele parat zu haben, wie du damit umgehst.`);

  render(`
    <h2>Dein Profil</h2>
    <p class="muted small">Kein Test-Ergebnis – nur eine Rückmeldung, wie deine Antworten wirken.</p>
    <section class="card">
      <h3>Ausprägung je Bereich</h3>
      ${rows.map(r => `
        <div class="bar-row"><span>${esc(r.dim)}</span>
          <div class="bar"><div style="width:${((r.avg - 1) / 4) * 100}%;background:var(--accent)"></div></div>
          <span class="bar-val">${r.avg.toFixed(1)} / 5</span></div>`).join("")}
    </section>
    <section class="card"><h3>Hinweise</h3><ul class="hints">${hints.map(h => `<li>${h}</li>`).join("")}</ul></section>
    <button class="btn" id="again">Nochmal</button>
    <button class="btn secondary" id="home">Zum Start</button>
  `);
  on("#again", "click", start);
  on("#home", "click", () => go("start"));
}

screen("persoenlichkeit", showIntro);
