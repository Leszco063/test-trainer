// Generator für Mathe-Aufgaben: Prozentrechnung, Dreisatz, Zinsen, Brutto/Netto.
// Die falschen Antworten entstehen aus typischen Denkfehlern (z. B. falscher Grundwert).

import { rand, randInt } from "../util.js";
import { fmt, euro } from "../util.js";
import { textQuestion } from "./gemeinsam.js";

const round2 = x => Math.round(x * 100) / 100;
const isNice = x => Math.abs(x * 100 - Math.round(x * 100)) < 1e-9; // höchstens 2 Nachkommastellen

function mathQ(level, q, answer, distractors, explain, format = fmt) {
  return textQuestion({ cat: "Mathe", level, q, answer: round2(answer), distractors: distractors.map(round2), explain, format });
}

// p % von N
function percentOf(level) {
  const p = level === 1 ? rand([10, 20, 25, 50]) : level === 2 ? rand([5, 15, 30, 40, 60, 75]) : rand([12.5, 35, 45, 2.5, 17.5]);
  let n, w;
  do {
    n = level === 1 ? randInt(2, 40) * 10 : level === 2 ? randInt(4, 60) * 10 : randInt(8, 96) * 10;
    w = (n * p) / 100;
  } while (!isNice(w) || (level < 3 && !Number.isInteger(w)));
  const tip = p === 10 ? " Tipp: 10 % = Komma eine Stelle nach links." : p === 25 ? " Tipp: 25 % = ein Viertel." : p === 50 ? " Tipp: 50 % = die Hälfte." : "";
  return mathQ(level, `Wie viel sind ${fmt(p)} % von ${fmt(n)}?`, w,
    [w * 10, w / 10, n - w, w + n / 20, w - n / 20, w * 2],
    `${fmt(p)} % von ${fmt(n)} = ${fmt(n)} × ${fmt(p / 100, 4)} = ${fmt(w)}.${tip}`);
}

// Preis nach Rabatt
function discount(level) {
  const d = level === 1 ? rand([10, 20, 25, 50]) : rand([15, 30, 35, 40]);
  let price, result;
  do {
    price = level === 1 ? randInt(2, 30) * 10 : randInt(10, 120) * 5;
    result = price * (1 - d / 100);
  } while (!isNice(result) || (level === 1 && !Number.isInteger(result)));
  const item = rand(["Ein Router", "Ein Headset", "Ein Monitor", "Eine Tastatur", "Ein Tablet"]);
  return mathQ(level, `${item} kostet ${euro(price)}. Es gibt ${d} % Rabatt. Wie viel kostet es jetzt?`, result,
    [(price * d) / 100, price * (1 + d / 100), price - d, result - 5, result + 5],
    `${d} % von ${euro(price)} = ${euro(round2((price * d) / 100))}. ${euro(price)} − ${euro(round2((price * d) / 100))} = ${euro(round2(result))}.`, euro);
}

// Grundwert: W entspricht p %
function baseValue(level) {
  const p = level === 2 ? rand([4, 5, 10, 20, 25]) : rand([8, 12, 15, 40, 60, 75]);
  let total, part;
  do {
    total = randInt(4, 60) * (level === 2 ? 10 : 20);
    part = (total * p) / 100;
  } while (!Number.isInteger(part));
  const ctx = rand([
    [`${part} Azubis sind krank. Das sind ${p} % aller Azubis. Wie viele Azubis gibt es insgesamt?`, "Azubis"],
    [`${part} Kunden haben gekündigt. Das sind ${p} % aller Kunden. Wie viele Kunden gab es?`, "Kunden"],
    [`${part} Geräte sind defekt. Das sind ${p} % der Lieferung. Wie viele Geräte wurden geliefert?`, "Geräte"],
  ]);
  // Personen/Geräte gibt es nur ganzzahlig – Ablenker ebenfalls ganzzahlig halten
  return mathQ(level, ctx[0], total,
    [Math.round((part * p) / 100), Math.round(total / 2), total + part, Math.round((part * 100) / (p + 10)), total * 2, total - part],
    `${fmt(part)} = ${p} %. Also 1 % = ${fmt(part / p)} und 100 % = ${fmt(part / p)} × 100 = ${fmt(total)} ${ctx[1]}.`);
}

// Dreisatz proportional
function ruleOfThree(level) {
  const unit = level === 1 ? randInt(2, 12) : rand([1.5, 2.5, 3.5, 4.5, 6, 7.5, 12, 15]);
  const x = randInt(2, 8);
  let z;
  do { z = randInt(3, 15); } while (z === x);
  const item = rand(["Netzwerkkabel", "USB-Sticks", "Druckerpatronen", "Adapter", "Mauspads"]);
  const y = unit * x;
  const answer = unit * z;
  return mathQ(level, `${x} ${item} kosten ${euro(y)}. Wie viel kosten ${z} ${item}?`, answer,
    [(y * x) / z, y + (z - x), answer + unit, answer - unit, y * z],
    `Ein Stück kostet ${euro(y)} ÷ ${x} = ${euro(unit)}. ${z} Stück kosten ${z} × ${euro(unit)} = ${euro(answer)}.`, euro);
}

// Dreisatz antiproportional (mehr Leute -> weniger Zeit)
function inverseRule(level) {
  let a, t, b, total;
  do {
    a = randInt(2, 8);
    t = randInt(2, 12);
    b = randInt(2, 12);
    total = a * t;
  } while (b === a || total % b !== 0);
  const answer = total / b;
  const [who, what, unit] = rand([["Techniker", "eine Netzwerkinstallation", "Stunden"], ["Monteure", "den Glasfaseranschluss einer Straße", "Tage"], ["Azubis", "die Inventur", "Stunden"]]);
  return mathQ(level, `${a} ${who} brauchen für ${what} ${t} ${unit}. Wie lange brauchen ${b} ${who}?`, answer,
    [(t * b) / a, t + (a - b), t - (a - b), total, answer + 1],
    `Gesamtarbeit: ${a} × ${t} = ${total} ${unit === "Tage" ? "Personentage" : "Personenstunden"}. Verteilt auf ${b}: ${total} ÷ ${b} = ${fmt(answer)} ${unit}.`,
    v => `${fmt(v)} ${unit}`);
}

// Einfache Zinsen
function interest(level) {
  const k = randInt(1, 20) * 500;
  const p = rand([1, 1.5, 2, 2.5, 3, 4, 5]);
  const years = level === 2 ? 1 : randInt(2, 4);
  const answer = (k * p * years) / 100;
  return mathQ(level, `${euro(k)} werden ${years === 1 ? "ein Jahr" : `${years} Jahre`} lang zu ${fmt(p)} % verzinst (ohne Zinseszins). Wie hoch sind die Zinsen insgesamt?`, answer,
    [(k * p) / 100 * (years === 1 ? 2 : 1), answer * 10, answer / 10, k + answer, answer + (k * p) / 100],
    `Zinsen pro Jahr: ${euro(k)} × ${fmt(p)} % = ${euro((k * p) / 100)}.${years > 1 ? ` Mal ${years} Jahre = ${euro(answer)}.` : ""}`, euro);
}

// Prozentuale Veränderung – Basis ist immer der ALTE Wert
function percentChange(level) {
  const up = Math.random() < 0.5;
  const p = rand([10, 20, 25, 40, 50, 60]);
  let oldV, newV;
  do {
    oldV = randInt(4, 60) * 10;
    newV = oldV * (1 + (up ? p : -p) / 100);
  } while (!Number.isInteger(newV));
  const wrongBase = Math.round((Math.abs(newV - oldV) / newV) * 1000) / 10;
  return mathQ(level, `Ein Preis ${up ? "steigt" : "sinkt"} von ${euro(oldV)} auf ${euro(newV)}. Um wie viel Prozent hat er sich verändert?`, p,
    [wrongBase, p + 5, p - 5, Math.abs(newV - oldV)],
    `Differenz: ${euro(Math.abs(newV - oldV))}. Die Basis ist der ALTE Preis: ${euro(Math.abs(newV - oldV))} ÷ ${euro(oldV)} = ${p} %. (Vom neuen Preis aus gerechnet käme fälschlich ${fmt(wrongBase)} % heraus.)`,
    v => `${fmt(v)} %`);
}

// Brutto -> Netto (19 % MwSt.)
function grossToNet(level) {
  const net = randInt(2, 40) * 50;
  const gross = net * 1.19;
  return mathQ(level, `Eine Rechnung beträgt ${euro(gross)} brutto (inklusive 19 % Mehrwertsteuer). Wie hoch ist der Nettobetrag?`, net,
    [gross * 0.81, gross - 19, net * 1.19 * 1.19, net - net * 0.19],
    `Brutto = 119 %. ${euro(gross)} ÷ 1,19 = ${euro(net)}. Nicht einfach 19 % vom Bruttobetrag abziehen – das ergibt zu wenig.`, euro);
}

const BY_LEVEL = {
  1: [percentOf, discount, ruleOfThree],
  2: [percentOf, discount, baseValue, ruleOfThree, inverseRule, interest],
  3: [percentOf, baseValue, inverseRule, interest, percentChange, grossToNet],
};

export function generateMath(level) {
  return rand(BY_LEVEL[level])(level);
}
