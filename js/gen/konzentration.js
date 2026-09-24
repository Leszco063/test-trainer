// Generator für Konzentrationsaufgaben: Kopfrechnen, Zeichen zählen, Zeichenfolgen vergleichen,
// Zahlen nach Bedingung zählen, identische Paare finden.

import { rand, randInt, shuffle, esc } from "../util.js";
import { textQuestion } from "./gemeinsam.js";

const CAT = "Konzentration";
const mono = text => `<div class="mono">${esc(text)}</div>`;

function nearby(answer, spread = [1, 2, -1, -2, 10, -10]) {
  return shuffle(spread).map(d => answer + d);
}

// Kopfrechnen
function mentalMath(level) {
  if (level === 1) {
    const a = randInt(12, 89), b = randInt(11, 59);
    if (Math.random() < 0.5) {
      return textQuestion({ cat: CAT, level, q: `Rechne im Kopf: ${a} + ${b} = ?`, answer: a + b, distractors: nearby(a + b), explain: `${a} + ${b} = ${a + b}.` });
    }
    const [x, y] = a > b ? [a, b] : [b + 40, a];
    return textQuestion({ cat: CAT, level, q: `Rechne im Kopf: ${x} − ${y} = ?`, answer: x - y, distractors: nearby(x - y), explain: `${x} − ${y} = ${x - y}.` });
  }
  if (level === 2) {
    if (Math.random() < 0.5) {
      const a = randInt(12, 49), b = randInt(3, 9);
      return textQuestion({ cat: CAT, level, q: `Rechne im Kopf: ${a} × ${b} = ?`, answer: a * b, distractors: [a * b + b, a * b - b, ...nearby(a * b)],
        explain: `${a} × ${b} = ${Math.floor(a / 10) * 10} × ${b} + ${a % 10} × ${b} = ${Math.floor(a / 10) * 10 * b} + ${(a % 10) * b} = ${a * b}.` });
    }
    const b = randInt(3, 9), res = randInt(12, 30), a = b * res;
    return textQuestion({ cat: CAT, level, q: `Rechne im Kopf: ${a} ÷ ${b} = ?`, answer: res, distractors: nearby(res, [1, -1, 2, -2, 3]),
      explain: `${b} × ${res} = ${a}, also ${a} ÷ ${b} = ${res}.` });
  }
  if (Math.random() < 0.5) {
    // Punkt vor Strich – der typische Fehler ist, von links nach rechts zu rechnen
    const a = randInt(5, 30), b = randInt(3, 9), c = randInt(3, 9), d = randInt(2, 20);
    const answer = a + b * c - d;
    const leftToRight = (a + b) * c - d;
    return textQuestion({ cat: CAT, level, q: `Rechne im Kopf: ${a} + ${b} × ${c} − ${d} = ?`, answer, distractors: [leftToRight, a + b * (c - d), ...nearby(answer)],
      explain: `Punkt vor Strich: ${b} × ${c} = ${b * c}. Dann ${a} + ${b * c} − ${d} = ${answer}.` });
  }
  const a = randInt(12, 29), b = randInt(12, 29);
  return textQuestion({ cat: CAT, level, q: `Rechne im Kopf: ${a} × ${b} = ?`, answer: a * b, distractors: [a * b + 10, a * b - 10, a * b + a, a * b - b],
    explain: `${a} × ${b} = ${a} × ${b - (b % 10)} + ${a} × ${b % 10} = ${a * (b - (b % 10))} + ${a * (b % 10)} = ${a * b}.` });
}

// Einen Buchstaben in einer Reihe ähnlicher Buchstaben zählen (b, d, p, q)
function countLetters(level) {
  const target = rand(["b", "d", "p", "q"]);
  const len = level === 1 ? 12 : level === 2 ? 20 : 28;
  const letters = Array.from({ length: len }, () => rand(["b", "d", "p", "q"]));
  const groups = [];
  for (let i = 0; i < len; i += 4) groups.push(letters.slice(i, i + 4).join(""));
  const answer = letters.filter(l => l === target).length;
  return textQuestion({ cat: CAT, level, q: `Wie oft kommt der Buchstabe „${target}“ vor?`, answer, distractors: nearby(answer, [1, -1, 2, -2, 3]),
    explain: `Es sind ${answer}-mal „${target}“. Tipp: in Vierergruppen zählen und die Zwischensummen merken: ${groups.map(g => g.split("").filter(l => l === target).length).join(" + ")} = ${answer}.`,
    extra: { stemHtml: mono(groups.join(" ")) } });
}

// Zeichenfolgen vergleichen
const LOOKALIKE = { 0: "O", O: "0", 1: "I", I: "1", 8: "B", B: "8", 5: "S", S: "5", 2: "Z", Z: "2", 6: "G", G: "6" };
const CHARS = "ABCDEFGHKLMNPQRSTUVWXYZ0123456789";

function compareStrings(level) {
  const blocks = level === 1 ? [3, 4] : level === 2 ? [4, 4, 2] : [4, 4, 4, 2];
  const code = blocks.map(n => Array.from({ length: n }, () => rand(CHARS.split(""))).join("")).join("-");
  const variants = new Set();
  for (let guard = 0; variants.size < 6 && guard < 100; guard++) {
    const chars = code.split("");
    const idx = randInt(0, chars.length - 1);
    if (chars[idx] === "-") continue;
    const kind = rand(["swap", "look", "look"]);
    if (kind === "swap" && idx < chars.length - 1 && chars[idx + 1] !== "-" && chars[idx + 1] !== chars[idx]) {
      [chars[idx], chars[idx + 1]] = [chars[idx + 1], chars[idx]];
    } else if (LOOKALIKE[chars[idx]]) {
      chars[idx] = LOOKALIKE[chars[idx]];
    } else {
      chars[idx] = rand(CHARS.split("").filter(c => c !== chars[idx]));
    }
    const v = chars.join("");
    if (v !== code) variants.add(v);
  }
  return textQuestion({ cat: CAT, level, q: "Welche Zeichenfolge ist identisch mit der Vorlage?", answer: code, distractors: [...variants],
    explain: `Nur „${code}“ stimmt Zeichen für Zeichen überein. Achte auf vertauschte Zeichen und Verwechsler wie 0/O, 1/I, 8/B, 5/S.`,
    extra: { stemHtml: mono(code) } });
}

// Zahlen nach Bedingung zählen
function countNumbers(level) {
  const n = level === 1 ? 8 : level === 2 ? 10 : 12;
  const max = level === 1 ? 50 : 99;
  const nums = Array.from({ length: n }, () => randInt(2, max));
  const conditions = [
    ["gerade", x => x % 2 === 0, "Gerade Zahlen"],
    ["ungerade", x => x % 2 === 1, "Ungerade Zahlen"],
  ];
  if (level >= 2) {
    const limit = randInt(3, 8) * 10;
    conditions.push([`größer als ${limit}`, x => x > limit, `Größer als ${limit}`]);
    conditions.push(["durch 3 teilbar", x => x % 3 === 0, "Durch 3 teilbar"]);
  }
  if (level === 3) {
    const lo = randInt(2, 5) * 10, hi = lo + randInt(2, 4) * 10;
    conditions.push([`zwischen ${lo} und ${hi} (beide Grenzen ausgeschlossen)`, x => x > lo && x < hi, `Zwischen ${lo} und ${hi}`]);
    conditions.push(["durch 4 teilbar", x => x % 4 === 0, "Durch 4 teilbar"]);
  }
  const [label, test, name] = rand(conditions);
  const hits = nums.filter(test);
  const answer = hits.length;
  return textQuestion({ cat: CAT, level, q: `Wie viele Zahlen sind ${label}?`, answer, distractors: nearby(answer, [1, -1, 2, -2, 3]),
    explain: `${name}: ${hits.length ? hits.join(", ") : "keine"} – also ${answer}.`,
    extra: { stemHtml: mono(nums.join("   ")) } });
}

// Wie viele Paare sind identisch?
function identicalPairs(level) {
  const pairs = level === 1 ? 4 : level === 2 ? 5 : 6;
  const digits = level === 1 ? 4 : level === 2 ? 5 : 6;
  const rows = [];
  let same = 0;
  for (let i = 0; i < pairs; i++) {
    const a = Array.from({ length: digits }, () => randInt(0, 9)).join("");
    let b = a;
    if (Math.random() < 0.5) {
      const chars = a.split("");
      const idx = randInt(0, digits - 2);
      if (chars[idx] !== chars[idx + 1]) [chars[idx], chars[idx + 1]] = [chars[idx + 1], chars[idx]];
      else chars[idx] = String((Number(chars[idx]) + randInt(1, 8)) % 10);
      b = chars.join("");
    }
    if (a === b) same += 1;
    rows.push(`${a} – ${b}`);
  }
  return textQuestion({ cat: CAT, level, q: "Wie viele Zahlenpaare sind vollständig identisch?", answer: same, distractors: nearby(same, [1, -1, 2, -2, 3]),
    explain: `${same} von ${pairs} Paaren sind identisch. Bei den anderen sind Ziffern vertauscht oder verändert.`,
    extra: { stemHtml: `<div class="mono">${rows.map(esc).join("<br>")}</div>` } });
}

export function generateConcentration(level) {
  return rand([mentalMath, mentalMath, countLetters, compareStrings, countNumbers, identicalPairs])(level);
}
