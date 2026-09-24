// Merkfähigkeit mit Gebäudeplan: Stockwerke, Abteilungen, Ansprechpartner, Räume und Mitarbeiterzahlen.
// Nach Erfahrungsberichten kommen im echten Test Merkaufgaben mit Grafiken und Personendaten vor
// (z. B. Anordnung, Personenzahl, Stockwerke).

import { rand, randInt, shuffle, esc } from "../util.js";
import { genId } from "./gemeinsam.js";

const DEPTS = ["IT-Support", "Vertrieb", "Personal", "Technik", "Kundenservice", "Einkauf", "Buchhaltung", "Marketing", "Rechenzentrum", "Ausbildung"];
const NAMES = ["Frau Yilmaz", "Herr Becker", "Frau Nowak", "Herr Schulz", "Frau Wagner", "Herr Öztürk", "Frau Hoffmann", "Herr Krüger", "Frau Schmitt", "Herr Lang", "Frau Demir", "Herr Weber"];
const FLOOR_NAMES = ["EG", "1. OG", "2. OG", "3. OG", "4. OG"];

export function buildSheet(floorsCount) {
  const depts = shuffle(DEPTS).slice(0, floorsCount);
  const names = shuffle(NAMES).slice(0, floorsCount);
  const counts = new Set();
  const floors = depts.map((dept, i) => {
    let count;
    do { count = randInt(4, 38); } while (counts.has(count));
    counts.add(count);
    return { floor: FLOOR_NAMES[i], dept, person: names[i], count, room: `${i}${String(randInt(1, 25)).padStart(2, "0")}` };
  });
  return { title: `Standort ${rand(["Nord", "Süd", "West", "Ost", "Mitte"])}`, floors };
}

export function sheetSvg(sheet) {
  const rowH = 46, w = 340, top = 26;
  const n = sheet.floors.length;
  const h = top + n * rowH + 14;
  const rows = sheet.floors.slice().reverse().map((f, i) => {
    const y = top + i * rowH;
    return `<rect x="10" y="${y}" width="${w - 20}" height="${rowH - 4}" rx="4" fill="var(--fig-bg)" stroke="currentColor" stroke-opacity="0.4"/>
      <text x="20" y="${y + 18}" font-size="13" font-weight="700" fill="currentColor">${esc(f.floor)} · ${esc(f.dept)}</text>
      <text x="20" y="${y + 35}" font-size="12" fill="currentColor">${esc(f.person)} · Raum ${esc(f.room)} · ${f.count} Mitarbeiter</text>`;
  }).join("");
  return `<svg class="chart-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Gebäudeplan">
    <polygon points="10,${top - 4} ${w / 2},6 ${w - 10},${top - 4}" fill="none" stroke="currentColor" stroke-opacity="0.5"/>
    <text x="${w / 2}" y="${top - 8}" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor">${esc(sheet.title)}</text>
    ${rows}</svg>`;
}

export function sheetText(sheet) {
  return `${sheet.title}\n` + sheet.floors.map(f => `${f.floor}: ${f.dept}, ${f.person}, Raum ${f.room}, ${f.count} Mitarbeiter`).join("\n");
}

function withDistractors(answer, pool) {
  const others = [...new Set(pool)].filter(x => x !== answer);
  const opts = shuffle([answer, ...shuffle(others).slice(0, 3)]);
  return { opts, correct: opts.indexOf(answer) };
}

// Fragen zu einem Blatt; types begrenzt die Fragearten
export function sheetQuestions(sheet, n, level) {
  const f = sheet.floors;
  const makers = [
    () => { const x = rand(f); return { q: `In welchem Stockwerk ist die Abteilung ${x.dept}?`, ...withDistractors(x.floor, FLOOR_NAMES.slice(0, Math.max(4, f.length))), explain: `${x.dept} ist im ${x.floor}.` }; },
    () => { const x = rand(f); return { q: `Wer ist Ansprechpartner/in für ${x.dept}?`, ...withDistractors(x.person, [...f.map(y => y.person), ...NAMES]), explain: `${x.dept}: ${x.person}.` }; },
    () => { const x = rand(f); return { q: `Wie viele Mitarbeiter arbeiten in der Abteilung ${x.dept}?`, ...withDistractors(String(x.count), [...f.map(y => String(y.count)), String(x.count + 2), String(x.count - 3)]), explain: `${x.dept}: ${x.count} Mitarbeiter.` }; },
    () => { const x = rand(f); return { q: `In welchem Raum sitzt ${x.person}?`, ...withDistractors(x.room, [...f.map(y => y.room), x.room.split("").reverse().join("")]), explain: `${x.person} sitzt in Raum ${x.room} (${x.dept}).` }; },
    () => { const i = randInt(0, f.length - 2); return { q: `Welche Abteilung liegt direkt über ${f[i].dept}?`, ...withDistractors(f[i + 1].dept, [...f.map(y => y.dept), ...DEPTS]), explain: `${f[i].dept} ist im ${f[i].floor}, darüber im ${f[i + 1].floor} ist ${f[i + 1].dept}.` }; },
    () => { const total = f.reduce((s, y) => s + y.count, 0); return { q: "Wie viele Mitarbeiter arbeiten insgesamt im Gebäude?", ...withDistractors(String(total), [String(total + 5), String(total - 4), String(total + 10), String(total - 9)]), explain: `${f.map(y => y.count).join(" + ")} = ${total}.` }; },
  ];
  const allowed = level === 1 ? makers.slice(0, 2) : level === 2 ? makers.slice(0, 5) : makers;
  const seen = new Set();
  const out = [];
  for (let guard = 0; out.length < n && guard < 100; guard++) {
    const m = rand(allowed)();
    if (seen.has(m.q) || new Set(m.opts).size !== m.opts.length || m.opts.length < 4) continue;
    seen.add(m.q);
    out.push({ id: genId("merk"), cat: "Merkfähigkeit", level, gen: true, ...m });
  }
  return out;
}

// Für die Übungsrunde: ein Blatt, eine Frage, längere Einprägezeit
export function generateSheetQuestion(level) {
  const sheet = buildSheet(level === 1 ? 3 : level === 2 ? 4 : 5);
  const [q] = sheetQuestions(sheet, 1, level);
  if (!q) throw new Error("Keine Frage erzeugt");
  return { ...q, memo: sheetText(sheet), memoHtml: sheetSvg(sheet), memoSeconds: { 1: 20, 2: 30, 3: 40 }[level] };
}
