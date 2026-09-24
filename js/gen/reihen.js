// Generator für Zahlenreihen (Bereich Logik). Jede Reihe folgt einer klaren Regel,
// die Ablenker entstehen aus naheliegenden, aber falschen Fortsetzungen.

import { rand, randInt, fmt } from "../util.js";
import { textQuestion } from "./gemeinsam.js";

function seriesQ(level, terms, answer, distractors, rule) {
  return textQuestion({
    cat: "Logik",
    level,
    q: `Wie geht die Reihe weiter? ${terms.map(t => fmt(t)).join(", ")}, ...`,
    answer,
    distractors,
    explain: `${rule} Die nächste Zahl ist ${fmt(answer)}.`,
    format: v => fmt(v),
  });
}

function arithmetic(level) {
  const d = level === 1 ? rand([2, 3, 4, 5, 6, 7, 8, 9, 10, -3, -4, -5]) : rand([7, 8, 9, 11, 12, 13, 15, -6, -7, -9, -11]);
  const start = d > 0 ? randInt(1, 30) : randInt(90, 150);
  const t = Array.from({ length: 6 }, (_, i) => start + i * d);
  const next = start + 6 * d;
  return seriesQ(level, t, next, [next + 1, next - 1, next + d, next - d, t[5] * 2],
    `Es wird immer ${d > 0 ? "+" : "−"}${Math.abs(d)} gerechnet.`);
}

function geometric(level) {
  const f = level === 1 ? rand([2, 3]) : rand([2, 3, 4]);
  const start = level === 1 ? randInt(1, 5) : randInt(2, 7);
  const t = Array.from({ length: 5 }, (_, i) => start * f ** i);
  const next = start * f ** 5;
  return seriesQ(level, t, next, [next + t[4], t[4] + (t[4] - t[3]), next - f, next * f],
    `Jede Zahl wird mit ${f} multipliziert.`);
}

function growingDifference(level) {
  const start = randInt(1, 20);
  const d0 = randInt(1, 4);
  const step = level === 2 ? 1 : rand([2, 3]);
  const t = [start];
  for (let i = 0; i < 5; i++) t.push(t[i] + d0 + i * step);
  const lastDiff = d0 + 4 * step;
  const next = t[5] + lastDiff + step;
  return seriesQ(level, t, next, [t[5] + lastDiff, next + 1, next - 1, next + step],
    `Die Abstände wachsen jeweils um ${step}: ${Array.from({ length: 6 }, (_, i) => `+${d0 + i * step}`).join(", ")}.`);
}

function alternating(level) {
  const a = randInt(2, 9);
  let b;
  do { b = randInt(1, 8); } while (b === a);
  const start = randInt(5, 30);
  const t = [start];
  for (let i = 0; i < 6; i++) t.push(i % 2 === 0 ? t[i] + a : t[i] - b);
  const next = 6 % 2 === 0 ? t[6] + a : t[6] - b;
  return seriesQ(level, t, next, [t[6] - b, next + 1, next - 1, t[6] + a + b],
    `Abwechselnd +${a} und −${b}.`);
}

function multiplyAdd(level) {
  const f = rand([2, 3]);
  const c = rand([1, 2, -1, 3]);
  const start = randInt(1, 5);
  const t = [start];
  for (let i = 0; i < 4; i++) t.push(t[i] * f + c);
  const next = t[4] * f + c;
  return seriesQ(level, t, next, [t[4] * f, next + c, next - 2 * c, t[4] + (t[4] - t[3])],
    `Jede Zahl wird mal ${f} genommen und dann ${c > 0 ? `+${c}` : `−${-c}`} gerechnet.`);
}

function interleaved(level) {
  // zwei verschränkte Reihen: Positionen 1,3,5,... und 2,4,6,...
  const a0 = randInt(1, 10), da = randInt(2, 6);
  const b0 = randInt(20, 40), db = -randInt(1, 4);
  const t = [];
  for (let i = 0; i < 7; i++) t.push(i % 2 === 0 ? a0 + (i / 2) * da : b0 + ((i - 1) / 2) * db);
  const next = b0 + 3 * db; // Position 8 gehört zur zweiten Reihe
  const wrongOther = a0 + 4 * da;
  return seriesQ(level, t, next, [wrongOther, next - 1, next + 1, t[6] + da],
    `Zwei Reihen sind ineinander verschränkt: jede zweite Zahl ${da > 0 ? "+" : ""}${da} (${a0}, ${a0 + da}, …) und dazwischen ${db} (${b0}, ${b0 + db}, …). Als Nächstes ist die zweite Reihe dran.`);
}

function squares(level) {
  const off = rand([0, 1, -1, 2]);
  const s = randInt(1, 4);
  const t = Array.from({ length: 5 }, (_, i) => (s + i) ** 2 + off);
  const next = (s + 5) ** 2 + off;
  return seriesQ(level, t, next, [next - 1, next + 1, t[4] + (t[4] - t[3]), (s + 5) * 2 + off],
    `Quadratzahlen${off ? ` ${off > 0 ? "+" : "−"} ${Math.abs(off)}` : ""}: ${Array.from({ length: 5 }, (_, i) => `${s + i}²${off ? (off > 0 ? "+" : "−") + Math.abs(off) : ""}`).join(", ")}.`);
}

const BY_LEVEL = {
  1: [arithmetic, geometric],
  2: [arithmetic, geometric, growingDifference, alternating],
  3: [growingDifference, alternating, multiplyAdd, interleaved, squares],
};

export function generateSeries(level) {
  return rand(BY_LEVEL[level])(level);
}
