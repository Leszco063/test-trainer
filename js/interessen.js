// Interessenstest mit Berufs-Matching – der echte Telekom-Test enthält einen Berufs-Interessenstest
// und zeigt einen Passungswert für den Wunschberuf plus Alternativen. Das hier ist eine vereinfachte Übung.

import { esc, shuffle } from "./util.js";
import { render, on, screen, go } from "./ui.js";

const PROFILES = {
  S: { name: "Fachinformatiker/in Systemintegration", desc: "Netzwerke, Server, IT-Support, IT-Sicherheit" },
  A: { name: "Fachinformatiker/in Anwendungsentwicklung", desc: "Programmieren, Software und Apps entwickeln" },
  E: { name: "IT-System-Elektroniker/in", desc: "Hardware, Installation und Technik vor Ort" },
  K: { name: "Kaufmännische Berufe", desc: "Kundenberatung, Vertrieb, Angebote und Prozesse" },
};

// Jedes Profil kommt genau sechsmal vor
const PAIRS = [
  [["S", "Ein Firmennetzwerk einrichten"], ["A", "Eine App programmieren"]],
  [["E", "Kabel verlegen und Anschlüsse montieren"], ["K", "Kunden zu Tarifen beraten"]],
  [["S", "Einen Server aufsetzen und überwachen"], ["A", "Eine Webseite mit eigenen Funktionen entwickeln"]],
  [["E", "Einen defekten Rechner mit Messgeräten untersuchen"], ["K", "Ein Angebot für einen Kunden kalkulieren"]],
  [["S", "Einem Kollegen am Telefon bei einem PC-Problem helfen"], ["K", "Die Kosten eines Projekts planen"]],
  [["A", "Einen Fehler im Programmcode suchen"], ["E", "Eine Telefonanlage beim Kunden installieren"]],
  [["S", "Sicherheitsregeln für die IT eines Büros festlegen"], ["A", "Daten aus einer Datenbank auswerten und aufbereiten"]],
  [["E", "Unterwegs bei Kunden vor Ort arbeiten"], ["K", "Im Büro Verträge und Abläufe betreuen"]],
  [["S", "Neue Laptops für ein Team einrichten und verteilen"], ["E", "Elektrische Schaltungen prüfen"]],
  [["A", "Ein Programm schreiben, das lästige Aufgaben automatisiert"], ["K", "Mit Kunden über ihre Wünsche verhandeln"]],
  [["S", "Backups und Zugriffsrechte verwalten"], ["A", "Eine Benutzeroberfläche gestalten"]],
  [["E", "Hardware zusammenbauen und in Betrieb nehmen"], ["K", "Umsatzzahlen auswerten und präsentieren"]],
];

let T = null;

function showIntro() {
  render(`
    <h2>Interessenstest</h2>
    <section class="card">
      <p>Der Telekom-Onlinetest enthält einen <strong>Berufs-Interessenstest</strong>. Am Ende gibt es einen Passungswert für den Wunschberuf und Vorschläge für passende Alternativen.</p>
      <p>Hier wählst du bei ${PAIRS.length} Paaren, was du <strong>lieber</strong> tun würdest – spontan und ehrlich. Wenn dir beides gleich gut oder schlecht gefällt, wähle „beides gleich“.</p>
      <p class="small muted">Vereinfachte Übung zum Kennenlernen des Formats. Nützlich auch fürs Interview: Wenn die Telekom mit dir über dein Ergebnis spricht, solltest du erklären können, warum du Systemintegration willst.</p>
    </section>
    <button class="btn" id="go">Starten</button>
    <button class="btn ghost" id="back">Zurück</button>
  `);
  on("#go", "click", () => {
    T = { pairs: shuffle(PAIRS).map(p => shuffle(p)), index: 0, score: { S: 0, A: 0, E: 0, K: 0 } };
    showPair();
  });
  on("#back", "click", () => go("start"));
}

function showPair() {
  const [a, b] = T.pairs[T.index];
  render(`
    <div class="qhead"><span>Frage ${T.index + 1} / ${T.pairs.length}</span></div>
    <div class="progress" style="margin-top:8px"><div style="width:${(T.index / T.pairs.length) * 100}%"></div></div>
    <p class="statement">Was würdest du lieber tun?</p>
    <div class="scale">
      <button class="opt" data-pick="0">${esc(a[1])}</button>
      <button class="opt" data-pick="1">${esc(b[1])}</button>
      <button class="opt muted" data-pick="both">beides gleich</button>
    </div>
    <button class="btn ghost" id="cancel">Abbrechen</button>
  `);
  on("[data-pick]", "click", e => {
    const pick = e.currentTarget.dataset.pick;
    if (pick === "both") { T.score[a[0]] += 0.5; T.score[b[0]] += 0.5; }
    else T.score[[a, b][Number(pick)][0]] += 1;
    T.index += 1;
    if (T.index < T.pairs.length) showPair();
    else showResult();
  });
  on("#cancel", "click", () => go("start"));
}

function showResult() {
  const ranked = Object.entries(T.score)
    .map(([key, v]) => ({ key, pct: Math.round((v / 6) * 100) }))
    .sort((x, y) => y.pct - x.pct);
  const s = ranked.find(r => r.key === "S");
  const hint = ranked[0].key === "S"
    ? "Dein Interessenprofil passt am besten zur Systemintegration – genau dein Wunschberuf."
    : `Am stärksten ist bei dir ${PROFILES[ranked[0].key].name}. Das ist kein Problem – überleg dir aber, wie du im Interview erklärst, warum du Systemintegration gewählt hast.`;
  render(`
    <h2>Dein Interessenprofil</h2>
    <section class="card">
      ${ranked.map(r => `
        <div class="bar-row"><span class="small"><strong>${esc(PROFILES[r.key].name)}</strong><br><span class="muted">${esc(PROFILES[r.key].desc)}</span></span>
          <div class="bar"><div style="width:${r.pct}%;background:${r.key === "S" ? "var(--accent)" : "var(--info)"}"></div></div>
          <span class="bar-val">${r.pct}%</span></div>`).join("")}
    </section>
    <section class="card"><p>${esc(hint)}</p><p class="small muted">Passung Systemintegration: ${s.pct} %. Vereinfachte Übung, keine offizielle Auswertung.</p></section>
    <button class="btn" id="again">Nochmal</button>
    <button class="btn secondary" id="home">Zum Start</button>
  `);
  on("#again", "click", showIntro);
  on("#home", "click", () => go("start"));
}

screen("interessen", showIntro);
