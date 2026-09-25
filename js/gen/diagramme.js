// Generator für Diagramm- und Tabellenaufgaben: Werte ablesen, vergleichen, Summen,
// Durchschnitt und Prozent. Die Zahlen sind so gewählt, dass man ohne Taschenrechner auskommt.

import { rand, randInt, shuffle, esc, fmt } from "../util.js";
import { textQuestion, genId } from "./gemeinsam.js";

const CAT = "Diagramme";
const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun"];
const MONTHS_LONG = ["Januar", "Februar", "März", "April", "Mai", "Juni"];

const BAR_TOPICS = [
  "Neue Glasfaseranschlüsse pro Monat",
  "Störungsmeldungen pro Monat",
  "Verkaufte Router pro Monat",
  "Anfragen an die Hotline pro Monat (in Hundert)",
  "Neue Mobilfunkverträge pro Monat",
];

function nearby(answer, spread) {
  return shuffle(spread).map(d => answer + d);
}

// ---------------------------------------------------------------------------
// Balkendiagramm
// ---------------------------------------------------------------------------

function barChartSvg(title, values, showLabels) {
  const w = 340, h = 230, left = 40, top = 28, bottom = 28, right = 8;
  const max = 120;
  const plotH = h - top - bottom, plotW = w - left - right;
  const y = v => top + plotH - (v / max) * plotH;
  let grid = "";
  for (let v = 0; v <= max; v += 10) {
    const major = v % 20 === 0;
    grid += `<line x1="${left}" x2="${w - right}" y1="${y(v)}" y2="${y(v)}" stroke="currentColor" stroke-opacity="${major ? 0.25 : 0.1}"/>`;
    if (major) grid += `<text x="${left - 6}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="currentColor" fill-opacity="0.7">${v}</text>`;
  }
  const slot = plotW / values.length;
  const bars = values.map((v, i) => {
    const x = left + i * slot + slot * 0.18;
    const bw = slot * 0.64;
    return `<rect x="${x}" y="${y(v)}" width="${bw}" height="${y(0) - y(v)}" rx="3" fill="var(--accent)"/>`
      + (showLabels ? `<text x="${x + bw / 2}" y="${y(v) - 5}" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor">${v}</text>` : "")
      + `<text x="${x + bw / 2}" y="${h - 9}" text-anchor="middle" font-size="12" fill="currentColor">${MONTHS[i]}</text>`;
  }).join("");
  return `<svg class="chart-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">
    <text x="${w / 2}" y="15" text-anchor="middle" font-size="13" font-weight="700" fill="currentColor">${esc(title)}</text>
    ${grid}${bars}</svg>`;
}

function barChart(level) {
  const title = rand(BAR_TOPICS);
  let values;
  // eindeutiges Maximum und Minimum, Werte in Zehnerschritten (gut ablesbar)
  do {
    values = Array.from({ length: 6 }, () => randInt(2, 11) * 10);
  } while (values.filter(v => v === Math.max(...values)).length > 1 || values.filter(v => v === Math.min(...values)).length > 1);
  const stemHtml = barChartSvg(title, values, level === 1);
  const idxMax = values.indexOf(Math.max(...values));
  const idxMin = values.indexOf(Math.min(...values));

  const types = level === 1 ? ["max", "min", "read"] : level === 2 ? ["diff", "sum", "read", "tfn"] : ["pct", "avg", "diff", "tfn"];
  const type = rand(types);

  if (type === "tfn") {
    // Aussage bewerten: richtig / falsch / aus dem Diagramm nicht ableitbar
    const truth = rand(["richtig", "falsch", "nicht ableitbar"]);
    let statement, why;
    if (truth === "nicht ableitbar") {
      [statement, why] = rand([
        [`Im Juli lag der Wert über ${values[5]}.`, "Das Diagramm endet im Juni – über Juli sagt es nichts."],
        [`Der Umsatz in Euro war im ${MONTHS_LONG[idxMax]} am höchsten.`, "Das Diagramm zeigt Stückzahlen, keine Euro-Beträge."],
        [`Im ${MONTHS_LONG[idxMin]} waren die meisten Mitarbeiter im Urlaub.`, "Über die Gründe für die Werte enthält das Diagramm keine Angaben."],
        [`Im Vorjahr lagen alle Werte niedriger.`, "Das Diagramm enthält keine Vorjahreswerte."],
      ]);
    } else {
      let a, b;
      do { a = randInt(0, 5); b = randInt(0, 5); } while (a === b || values[a] === values[b]);
      const aHigher = values[a] > values[b];
      const claimHigher = truth === "richtig" ? aHigher : !aHigher;
      statement = `Im ${MONTHS_LONG[a]} lag der Wert ${claimHigher ? "höher" : "niedriger"} als im ${MONTHS_LONG[b]}.`;
      why = `${MONTHS_LONG[a]}: ${values[a]}, ${MONTHS_LONG[b]}: ${values[b]}.`;
    }
    const opts = ["richtig", "falsch", "nicht ableitbar"];
    return {
      id: genId(CAT), cat: CAT, level, gen: true, stemHtml,
      q: `Bewerte die Aussage: „${statement}“`,
      opts, correct: opts.indexOf(truth),
      explain: `${truth === "nicht ableitbar" ? "Nicht ableitbar" : truth === "richtig" ? "Richtig" : "Falsch"}: ${why} Nur werten, was wirklich im Diagramm steht – Vorwissen oder Vermutungen zählen nicht.`,
    };
  }

  if (type === "max" || type === "min") {
    const idx = type === "max" ? idxMax : idxMin;
    return textQuestion({ cat: CAT, level, q: `In welchem Monat war der Wert am ${type === "max" ? "höchsten" : "niedrigsten"}?`,
      answer: MONTHS_LONG[idx], distractors: shuffle(MONTHS_LONG.filter((_, i) => i !== idx)),
      explain: `Der ${type === "max" ? "höchste" : "niedrigste"} Balken gehört zum ${MONTHS_LONG[idx]} (${values[idx]}).`, extra: { stemHtml } });
  }
  if (type === "read") {
    const i = randInt(0, 5);
    return textQuestion({ cat: CAT, level, q: `Welcher Wert wurde im ${MONTHS_LONG[i]} erreicht?`, answer: values[i],
      distractors: nearby(values[i], [10, -10, 20, -20, 5]),
      explain: `Der Balken für ${MONTHS_LONG[i]} endet bei ${values[i]}.${level > 1 ? " Tipp: Die feinen Linien sind Zehnerschritte." : ""}`, extra: { stemHtml } });
  }
  if (type === "diff") {
    let a, b;
    do { a = randInt(0, 5); b = randInt(0, 5); } while (a >= b || values[a] === values[b]);
    const d = values[b] - values[a];
    return textQuestion({ cat: CAT, level, q: `Um wie viel hat sich der Wert von ${MONTHS_LONG[a]} bis ${MONTHS_LONG[b]} verändert?`,
      answer: `${d > 0 ? "+" : "−"}${Math.abs(d)}`,
      distractors: [`${d > 0 ? "−" : "+"}${Math.abs(d)}`, `${d > 0 ? "+" : "−"}${Math.abs(d) + 10}`, `${d > 0 ? "+" : "−"}${Math.abs(d) + 20}`, `${d > 0 ? "+" : "−"}${Math.max(0, Math.abs(d) - 10)}`],
      explain: `${MONTHS_LONG[a]}: ${values[a]}, ${MONTHS_LONG[b]}: ${values[b]}. Veränderung: ${values[b]} − ${values[a]} = ${d > 0 ? "+" : "−"}${Math.abs(d)}.`, extra: { stemHtml } });
  }
  if (type === "sum") {
    const sum = values[0] + values[1] + values[2];
    return textQuestion({ cat: CAT, level, q: "Wie groß ist die Summe im ersten Quartal (Januar bis März)?", answer: sum,
      distractors: nearby(sum, [10, -10, 20, -20, 30]),
      explain: `${values[0]} + ${values[1]} + ${values[2]} = ${sum}.`, extra: { stemHtml } });
  }
  if (type === "avg") {
    // Durchschnitt soll glatt sein: letzten Wert passend setzen (Chart neu zeichnen)
    let vals;
    do {
      vals = Array.from({ length: 5 }, () => randInt(2, 11) * 10);
      const need = 6 * rand([50, 60, 70, 80]) - vals.reduce((s, v) => s + v, 0);
      vals.push(need);
    } while (vals[5] < 20 || vals[5] > 110 || vals[5] % 10 !== 0);
    const avg = vals.reduce((s, v) => s + v, 0) / 6;
    return textQuestion({ cat: CAT, level, q: "Wie hoch ist der Durchschnitt von Januar bis Juni?", answer: avg,
      distractors: nearby(avg, [5, -5, 10, -10]),
      explain: `Summe: ${vals.join(" + ")} = ${vals.reduce((s, v) => s + v, 0)}. Geteilt durch 6 Monate = ${avg}.`,
      extra: { stemHtml: barChartSvg(title, vals, false) } });
  }
  // Prozentuale Veränderung mit glatten Werten
  const pairs = [[40, 50, 25], [50, 60, 20], [80, 100, 25], [40, 60, 50], [50, 40, -20], [100, 80, -20], [80, 60, -25], [60, 90, 50], [20, 30, 50], [100, 110, 10]];
  const [from, to, pct] = rand(pairs);
  const vals = values.slice();
  const a = randInt(0, 3), b = randInt(a + 1, 5);
  vals[a] = from;
  vals[b] = to;
  return textQuestion({ cat: CAT, level, q: `Um wie viel Prozent hat sich der Wert von ${MONTHS_LONG[a]} bis ${MONTHS_LONG[b]} verändert?`,
    answer: `${pct > 0 ? "+" : "−"}${Math.abs(pct)} %`,
    distractors: [`${pct > 0 ? "+" : "−"}${Math.round((Math.abs(to - from) / to) * 1000) / 10} %`.replace(".", ","), `${pct > 0 ? "−" : "+"}${Math.abs(pct)} %`, `${pct > 0 ? "+" : "−"}${Math.abs(to - from)} %`, `${pct > 0 ? "+" : "−"}${Math.abs(pct) + 5} %`],
    explain: `${MONTHS_LONG[a]}: ${from}, ${MONTHS_LONG[b]}: ${to}. Veränderung ${to - from} bezogen auf den ALTEN Wert ${from}: ${to - from} ÷ ${from} = ${pct} %.`,
    extra: { stemHtml: barChartSvg(title, vals, false) } });
}

// ---------------------------------------------------------------------------
// Kreisdiagramm
// ---------------------------------------------------------------------------

const PIE_COLORS = ["var(--accent)", "var(--info)", "var(--lvl2)", "var(--ok)"];
const PIE_TOPICS = [
  ["Wie Kunden die Hotline kontaktieren", ["Telefon", "Chat", "E-Mail", "App"]],
  ["Gründe für Störungsmeldungen", ["Router", "Leitung", "WLAN", "Sonstiges"]],
  ["Genutzte Tarife", ["S", "M", "L", "XL"]],
];

function pieSvg(title, labels, pcts) {
  const cx = 90, cy = 110, r = 72;
  let angle = -90, slices = "", legend = "";
  pcts.forEach((p, i) => {
    const a1 = angle, a2 = angle + (p / 100) * 360;
    const large = a2 - a1 > 180 ? 1 : 0;
    const pt = a => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
    const [x1, y1] = pt(a1), [x2, y2] = pt(a2);
    slices += `<path d="M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z" fill="${PIE_COLORS[i]}" stroke="var(--card)" stroke-width="2"/>`;
    legend += `<rect x="190" y="${58 + i * 28}" width="14" height="14" rx="3" fill="${PIE_COLORS[i]}"/>`
      + `<text x="212" y="${70 + i * 28}" font-size="13" fill="currentColor">${esc(labels[i])}: ${p} %</text>`;
    angle = a2;
  });
  return `<svg class="chart-svg" viewBox="0 0 340 200" role="img" aria-label="${esc(title)}">
    <text x="170" y="16" text-anchor="middle" font-size="13" font-weight="700" fill="currentColor">${esc(title)}</text>
    ${slices}${legend}</svg>`;
}

function pieChart(level) {
  const [title, labels] = rand(PIE_TOPICS);
  let pcts;
  do {
    const a = randInt(2, 9) * 5, b = randInt(2, 8) * 5, c = randInt(1, 6) * 5;
    pcts = [a, b, c, 100 - a - b - c];
  } while (pcts[3] < 5 || new Set(pcts).size < 4);
  const total = rand([200, 400, 500, 800, 1000, 1200, 2000]);
  const i = randInt(0, 3);
  const stemHtml = pieSvg(title, labels, pcts);
  if (level === 1) {
    const top = pcts.indexOf(Math.max(...pcts));
    return textQuestion({ cat: CAT, level, q: "Welcher Anteil ist am größten?", answer: labels[top], distractors: labels.filter((_, k) => k !== top),
      explain: `${labels[top]} hat mit ${pcts[top]} % das größte Stück.`, extra: { stemHtml } });
  }
  if (level === 2) {
    const n = (total * pcts[i]) / 100;
    return textQuestion({ cat: CAT, level, q: `Insgesamt wurden ${fmt(total)} Fälle erfasst. Wie viele davon entfallen auf „${labels[i]}“?`, answer: n,
      distractors: [pcts[i], n * 2, n / 2, n + total / 20, n - total / 20].map(Math.round),
      format: v => fmt(v), explain: `${pcts[i]} % von ${fmt(total)} = ${fmt(total)} × ${fmt(pcts[i] / 100)} = ${fmt(n)}.`, extra: { stemHtml } });
  }
  let j;
  do { j = randInt(0, 3); } while (j === i);
  const diff = ((pcts[i] - pcts[j]) * total) / 100;
  return textQuestion({ cat: CAT, level, q: `Bei ${fmt(total)} Fällen: Wie viele Fälle mehr oder weniger hat „${labels[i]}“ als „${labels[j]}“?`,
    answer: `${diff >= 0 ? "+" : "−"}${fmt(Math.abs(diff))}`,
    distractors: [`${diff >= 0 ? "−" : "+"}${fmt(Math.abs(diff))}`, `${diff >= 0 ? "+" : "−"}${Math.abs(pcts[i] - pcts[j])}`, `${diff >= 0 ? "+" : "−"}${fmt(Math.abs(diff) + total / 20)}`, `${diff >= 0 ? "+" : "−"}${fmt(Math.abs(diff) * 2)}`],
    explain: `Unterschied: ${pcts[i]} % − ${pcts[j]} % = ${pcts[i] - pcts[j]} Prozentpunkte. ${pcts[i] - pcts[j]} % von ${fmt(total)} = ${fmt(diff)}.`, extra: { stemHtml } });
}

// ---------------------------------------------------------------------------
// Tabelle
// ---------------------------------------------------------------------------

const PRODUCTS = ["Router", "Repeater", "Switch", "Mesh-Set", "Headset", "Tablet"];

function tableHtml(title, rows, cols, data) {
  return `<div class="table-wrap"><table class="data-table">
    <caption>${esc(title)}</caption>
    <tr><th></th>${cols.map(c => `<th>${esc(c)}</th>`).join("")}</tr>
    ${rows.map((r, i) => `<tr><th>${esc(r)}</th>${data[i].map(v => `<td>${fmt(v)}</td>`).join("")}</tr>`).join("")}
  </table></div>`;
}

function table(level) {
  const rows = shuffle(PRODUCTS).slice(0, 4);
  const cols = ["Q1", "Q2", "Q3", "Q4"];
  let data;
  do {
    data = rows.map(() => cols.map(() => randInt(4, 30) * 10));
  } while (new Set(data.map(r => r[2])).size < 4); // eindeutiges Maximum in Q3
  const title = "Verkaufte Geräte je Quartal (Stück)";
  const stemHtml = tableHtml(title, rows, cols, data);
  const r = randInt(0, 3);

  if (level === 1) {
    const q3 = data.map(row => row[2]);
    const top = q3.indexOf(Math.max(...q3));
    return textQuestion({ cat: CAT, level, q: "Welches Gerät wurde im 3. Quartal (Q3) am häufigsten verkauft?", answer: rows[top],
      distractors: rows.filter((_, k) => k !== top),
      explain: `In der Spalte Q3 ist ${fmt(q3[top])} der höchste Wert – das ist ${rows[top]}.`, extra: { stemHtml } });
  }
  if (level === 2) {
    const sum = data[r].reduce((s, v) => s + v, 0);
    return textQuestion({ cat: CAT, level, q: `Wie viele ${rows[r]} wurden im ganzen Jahr verkauft?`, answer: sum,
      distractors: nearby(sum, [10, -10, 100, -100, 20]), format: v => fmt(v),
      explain: `Zeile ${rows[r]}: ${data[r].map(v => fmt(v)).join(" + ")} = ${fmt(sum)}.`, extra: { stemHtml } });
  }
  // Anteil eines Geräts in einem Quartal – Werte so setzen, dass der Anteil glatt ist
  const c = randInt(0, 3);
  const shares = rand([[50, 20, 20, 10], [40, 30, 20, 10], [25, 25, 30, 20], [60, 20, 10, 10], [30, 30, 25, 15]]);
  const colTotal = rand([200, 400, 500, 1000]);
  const order = shuffle([0, 1, 2, 3]);
  order.forEach((row, k) => { data[row][c] = (colTotal * shares[k]) / 100; });
  const pct = (data[r][c] / colTotal) * 100;
  return textQuestion({ cat: CAT, level, q: `Wie viel Prozent aller in ${cols[c]} verkauften Geräte waren ${rows[r]}?`, answer: `${fmt(pct)} %`,
    distractors: [pct + 5, pct - 5, pct + 10, pct * 2, data[r][c] / 10].filter(v => v > 0 && v < 100).map(v => `${fmt(v)} %`),
    explain: `Summe ${cols[c]}: ${data.map(row => fmt(row[c])).join(" + ")} = ${fmt(colTotal)}. Anteil ${rows[r]}: ${fmt(data[r][c])} ÷ ${fmt(colTotal)} = ${fmt(pct)} %.`,
    extra: { stemHtml: tableHtml(title, rows, cols, data) } });
}

export function generateChart(level) {
  const r = Math.random();
  if (r < 0.45) return barChart(level);
  if (r < 0.7) return pieChart(level);
  return table(level);
}
