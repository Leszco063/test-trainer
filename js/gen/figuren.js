// Generator für Figurenaufgaben: Figurenreihen, 3×3-Matrizen und "Welche Figur passt nicht?".
// Jede Aufgabe wird aus Regeln gebaut; die Erklärung beschreibt genau diese Regeln.

import { rand, randInt, shuffle } from "../util.js";
import { figKey, figureSvg, sequenceSvg, matrixSvg, FILL_NAMES } from "./figur.js";
import { genId } from "./gemeinsam.js";

const SHAPE_NAMES = { circle: "Kreis", arrow: "Pfeil", clock: "Uhr" };
const POLY_NAMES = { 3: "Dreieck", 4: "Viereck", 5: "Fünfeck", 6: "Sechseck", 7: "Siebeneck", 8: "Achteck" };

function shapeName(f) {
  return f.shape === "poly" ? POLY_NAMES[f.sides] : SHAPE_NAMES[f.shape];
}

export function describe(f) {
  const parts = [shapeName(f)];
  if (f.shape === "arrow" || f.shape === "clock") parts.push(`${f.shape === "clock" ? "Zeiger" : "Spitze"} bei ${((f.rot % 360) + 360) % 360}°`);
  parts.push(FILL_NAMES[f.shape === "clock" && f.fill === 2 ? 1 : f.fill]);
  parts.push(f.dots === 1 ? "1 Punkt" : `${f.dots} Punkte`);
  return parts.join(", ");
}

const clone = f => ({ ...f });

function rotText(step) {
  return `${Math.abs(step)}° ${step > 0 ? "im Uhrzeigersinn" : "gegen den Uhrzeigersinn"}`;
}

// zufällige kleine Änderung – Notlösung, falls die Regel-Ablenker nicht reichen
function tweak(f) {
  const v = clone(f);
  const what = rand(["fill", "dots", "rot"]);
  if (what === "fill") v.fill = (v.fill + randInt(1, 2)) % 3;
  if (what === "dots") v.dots = Math.max(0, v.dots + rand([-1, 1, 2]));
  if (what === "rot") v.rot += rand([45, 90, 180]);
  return v;
}

function uniqueDistractors(answer, candidates, n = 3) {
  const seen = new Set([figKey(answer)]);
  const out = [];
  for (const c of shuffle(candidates)) {
    const k = figKey(c);
    if (seen.has(k) || c.dots < 0 || c.dots > 9) continue;
    seen.add(k);
    out.push(c);
    if (out.length === n) return out;
  }
  for (let guard = 0; out.length < n && guard < 200; guard++) {
    const c = tweak(rand([answer, ...out]));
    const k = figKey(c);
    if (!seen.has(k) && c.dots <= 9) { seen.add(k); out.push(c); }
  }
  return out;
}

function figureQuestion({ level, q, stemHtml, answer, distractors, explain }) {
  const figs = [answer, ...uniqueDistractors(answer, distractors)];
  const order = shuffle([0, 1, 2, 3]);
  const opts = order.map(i => figs[i]);
  return {
    id: genId("fig"),
    cat: "Figuren",
    level,
    q,
    stemHtml,
    optHtml: opts.map(figureSvg),
    opts: opts.map(describe),
    correct: order.indexOf(0),
    explain,
    gen: true,
  };
}

// ---------------------------------------------------------------------------
// Figurenreihe
// ---------------------------------------------------------------------------

function genSeries(level) {
  const shape = rand(["arrow", "clock", "poly", "poly"]);
  const base = { shape, sides: shape === "poly" ? rand([3, 4]) : 0, rot: 0, fill: rand([0, 1, 2]), dots: 0 };
  if (shape === "clock" && base.fill === 2) base.fill = 0;

  const possible = ["dots", "fill"];
  if (shape === "poly") possible.push("sides");
  else possible.push("rot", "rot"); // Drehung bei Pfeil/Uhr bevorzugen
  const nRules = level === 1 ? 1 : level === 2 ? 2 : 3;
  const rules = [...new Set(shuffle(possible))].slice(0, nRules);

  const p = {};
  if (rules.includes("rot")) {
    p.rotStep = level === 1 ? rand([90, -90]) : rand([45, -45, 90, -90, 135]);
    base.rot = rand([0, 45, 90, 180, 270]);
  }
  if (rules.includes("sides")) {
    p.sidesStep = level === 3 && Math.random() < 0.5 ? -1 : 1;
    base.sides = p.sidesStep === 1 ? 3 : 8;
  }
  if (rules.includes("dots")) {
    if (level === 1) { p.dotsStep = 1; base.dots = 1; }
    else if (level === 2) { p.dotsStep = rand([1, -1]); base.dots = p.dotsStep === 1 ? randInt(0, 2) : randInt(5, 6); }
    else { p.dotsStep = rand([2, -1, 2]); base.dots = p.dotsStep === 2 ? randInt(0, 1) : randInt(5, 6); }
  } else {
    base.dots = rand([0, 0, 1, 2]);
  }
  if (rules.includes("fill")) {
    const fills = shape === "clock" ? [0, 1] : [0, 1, 2];
    p.fillCycle = level === 3 && shape !== "clock" ? shuffle([0, 1, 2]) : shuffle(fills).slice(0, 2);
  }

  const seq = [];
  for (let i = 0; i < 5; i++) {
    const f = clone(base);
    if (p.rotStep !== undefined) f.rot = base.rot + i * p.rotStep;
    if (p.sidesStep !== undefined) f.sides = base.sides + i * p.sidesStep;
    if (p.dotsStep !== undefined) f.dots = base.dots + i * p.dotsStep;
    if (p.fillCycle) f.fill = p.fillCycle[i % p.fillCycle.length];
    seq.push(f);
  }
  const answer = seq[4];
  const prev = seq[3];

  const explainParts = [];
  const distractors = [];
  if (p.rotStep !== undefined) {
    explainParts.push(`${shape === "clock" ? "Der Zeiger" : "Der Pfeil"} dreht sich jedes Mal um ${rotText(p.rotStep)}.`);
    distractors.push({ ...answer, rot: prev.rot }, { ...answer, rot: prev.rot - p.rotStep }, { ...answer, rot: answer.rot + 180 });
  }
  if (p.sidesStep !== undefined) {
    explainParts.push(`Die Zahl der Ecken ${p.sidesStep > 0 ? "steigt" : "sinkt"} jeweils um 1 (${seq.map(f => f.sides).join(" → ")}).`);
    distractors.push({ ...answer, sides: prev.sides }, { ...answer, sides: answer.sides + p.sidesStep });
  }
  if (p.dotsStep !== undefined) {
    explainParts.push(`Die Anzahl der Punkte ${p.dotsStep > 0 ? "steigt" : "sinkt"} jeweils um ${Math.abs(p.dotsStep)} (${seq.map(f => f.dots).join(" → ")}).`);
    distractors.push({ ...answer, dots: prev.dots }, { ...answer, dots: answer.dots + 1 }, { ...answer, dots: answer.dots - 1 });
  }
  if (p.fillCycle) {
    explainParts.push(p.fillCycle.length === 2
      ? `Die Füllung wechselt immer ab: ${FILL_NAMES[p.fillCycle[0]]} ↔ ${FILL_NAMES[p.fillCycle[1]]}.`
      : `Die Füllung wiederholt sich im Dreierrhythmus: ${p.fillCycle.map(x => FILL_NAMES[x]).join(" → ")}.`);
    distractors.push({ ...answer, fill: prev.fill }, ...[0, 1, 2].filter(x => x !== answer.fill).map(x => ({ ...answer, fill: x })));
  }
  // auch unveränderte Merkmale leicht verändern, damit man auf alles achten muss
  if (p.dotsStep === undefined) distractors.push({ ...answer, dots: answer.dots + 1 });
  if (!p.fillCycle) distractors.push({ ...answer, fill: (answer.fill + 1) % 3 });

  return figureQuestion({
    level,
    q: "Welche Figur setzt die Reihe fort?",
    stemHtml: sequenceSvg(seq.slice(0, 4)),
    answer,
    distractors,
    explain: `${explainParts.join(" ")} Gesucht ist also: ${describe(answer)}.`,
  });
}

// ---------------------------------------------------------------------------
// 3×3-Matrix
// ---------------------------------------------------------------------------

const MATRIX_SHAPES = [
  { shape: "circle", sides: 0 },
  { shape: "poly", sides: 3 },
  { shape: "poly", sides: 4 },
  { shape: "poly", sides: 5 },
  { shape: "poly", sides: 6 },
];

function genMatrix(level) {
  const shapes = shuffle(MATRIX_SHAPES).slice(0, 3);
  const dotsStart = level === 3 ? rand([1, 2]) : 1;
  const colDots = [0, 1, 2].map(c => dotsStart + c);
  const constFill = rand([0, 2]);
  const rowFill = shuffle([0, 1, 2]);
  const latin = level === 3;

  const cell = (r, c) => ({
    ...(latin ? shapes[(r + c) % 3] : shapes[r]),
    rot: 0,
    fill: level === 1 ? constFill : rowFill[r],
    dots: colDots[c],
  });
  const grid = [0, 1, 2].map(r => [0, 1, 2].map(c => (r === 2 && c === 2 ? null : cell(r, c))));
  const answer = cell(2, 2);

  const otherShapes = shapes.filter(s => s.shape !== answer.shape || s.sides !== answer.sides);
  const distractors = [
    ...otherShapes.map(s => ({ ...answer, ...s })),
    { ...answer, dots: answer.dots - 1 },
    { ...answer, dots: answer.dots + 1 },
    ...[0, 1, 2].filter(x => x !== answer.fill).map(x => ({ ...answer, fill: x })),
  ];

  const parts = [];
  if (latin) parts.push(`In jeder Zeile kommt jede der drei Formen genau einmal vor – in der unteren Zeile fehlt noch: ${shapeName(answer)}.`);
  else parts.push(`Jede Zeile hat ihre eigene Form (unten: ${shapeName(answer)}).`);
  parts.push(`Die Punkte steigen von links nach rechts: ${colDots.join(" – ")}.`);
  if (level > 1) parts.push(`Die Füllung ist pro Zeile gleich (unten: ${FILL_NAMES[answer.fill]}).`);

  return figureQuestion({
    level,
    q: "Welche Figur gehört in das leere Feld?",
    stemHtml: matrixSvg(grid),
    answer,
    distractors,
    explain: `${parts.join(" ")} Gesucht ist also: ${describe(answer)}.`,
  });
}

// ---------------------------------------------------------------------------
// Welche Figur passt nicht?
// ---------------------------------------------------------------------------

function genOddOneOut(level) {
  const polys = shuffle([3, 4, 5, 6]);
  const fills = shuffle([0, 0, 2, 2]); // Füllung darf kein Hinweis sein
  let figs, oddIndex, explain;

  if (level === 1) {
    if (Math.random() < 0.5) {
      const dir = rand([0, 90, 180, 270]);
      const oddDir = dir + rand([90, 180, 270]);
      // Füllung und Punkte so verteilt, dass alle vier verschieden aussehen,
      // aber keine Figur allein durch Füllung oder Punkte auffällt
      const looks = shuffle([[0, 1], [0, 2], [2, 1], [2, 2]]);
      figs = looks.map(([fill, dots]) => ({ shape: "arrow", sides: 0, rot: dir, fill, dots }));
      oddIndex = randInt(0, 3);
      figs[oddIndex].rot = oddDir;
      explain = "Drei Pfeile zeigen in dieselbe Richtung, einer nicht. Füllung und Punkte spielen keine Rolle.";
    } else {
      figs = polys.map(s => ({ shape: "poly", sides: s, rot: 0, fill: 2, dots: 0 }));
      oddIndex = randInt(0, 3);
      figs[oddIndex].fill = 0;
      explain = "Drei Figuren sind ausgefüllt, eine nicht. Die Form spielt keine Rolle.";
    }
  } else if (level === 2) {
    figs = polys.map((s, i) => ({ shape: "poly", sides: s, rot: 0, fill: fills[i], dots: s }));
    oddIndex = randInt(0, 3);
    figs[oddIndex].dots += rand([-1, 1]);
    explain = "Bei drei Figuren ist die Anzahl der Punkte gleich der Anzahl der Ecken. Bei einer nicht.";
  } else {
    // 7 oder 9: dann hat keine "normale" Figur zufällig gleich viele Punkte wie Ecken
    const sum = rand([7, 9]);
    figs = polys.map((s, i) => ({ shape: "poly", sides: s, rot: 0, fill: fills[i], dots: sum - s }));
    oddIndex = randInt(0, 3);
    figs[oddIndex].dots += rand([-1, 1]);
    if (figs[oddIndex].dots < 0) figs[oddIndex].dots += 2;
    explain = `Bei drei Figuren ergeben Ecken + Punkte zusammen genau ${sum}. Bei einer nicht.`;
  }

  return {
    id: genId("fig"),
    cat: "Figuren",
    level,
    q: "Welche Figur passt nicht zu den anderen?",
    optHtml: figs.map(figureSvg),
    opts: figs.map(describe),
    correct: oddIndex,
    explain: `${explain} Die unpassende Figur: ${describe(figs[oddIndex])}.`,
    gen: true,
  };
}

export function generateFigure(level) {
  const r = Math.random();
  if (r < 0.45) return genSeries(level);
  if (r < 0.8) return genMatrix(level);
  return genOddOneOut(level);
}
