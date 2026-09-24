// Zeichnet abstrakte Figuren als SVG (für Figurenreihen, Matrizen, "passt nicht").
// Eine Figur: { shape: "circle" | "poly" | "arrow" | "clock", sides, rot, fill, dots }
//   fill: 0 = leer, 1 = grau, 2 = voll   ·   dots: Anzahl Punkte unter der Figur
// Farben über currentColor, damit Hell- und Dunkelmodus automatisch passen.

export const FILL_NAMES = ["leer", "grau", "ausgefüllt"];

// Eindeutiger Schlüssel für das, was man SIEHT (Symmetrien berücksichtigt)
export function figKey(f) {
  let rot = ((f.rot % 360) + 360) % 360;
  if (f.shape === "circle") rot = 0;
  if (f.shape === "poly") rot = rot % (360 / f.sides);
  const fill = f.shape === "clock" && f.fill === 2 ? 1 : f.fill;
  return [f.shape, f.shape === "poly" ? f.sides : 0, rot, fill, f.dots].join("|");
}

function fillAttrs(fill) {
  if (fill === 0) return `fill="none"`;
  if (fill === 1) return `fill="currentColor" fill-opacity="0.35"`;
  return `fill="currentColor"`;
}

function polyPoints(n, cx, cy, r, rot) {
  const pts = [];
  const offset = n === 4 ? 45 : 0; // Viereck gerade stellen statt als Raute
  for (let k = 0; k < n; k++) {
    const a = ((-90 + rot + offset + (360 * k) / n) * Math.PI) / 180;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}

// Nur die Formelemente, zentriert auf (cx, cy) mit Radius r
export function shapeElements(f, cx, cy, r) {
  const stroke = `stroke="currentColor" stroke-width="${Math.max(2, r / 10).toFixed(1)}" stroke-linejoin="round"`;
  let out = "";
  if (f.shape === "circle") {
    out = `<circle cx="${cx}" cy="${cy}" r="${r}" ${fillAttrs(f.fill)} ${stroke}/>`;
  } else if (f.shape === "poly") {
    out = `<polygon points="${polyPoints(f.sides, cx, cy, r, f.rot)}" ${fillAttrs(f.fill)} ${stroke}/>`;
  } else if (f.shape === "arrow") {
    const d = `M ${cx} ${cy - r} L ${cx + 0.62 * r} ${cy - 0.05 * r} L ${cx + 0.24 * r} ${cy - 0.05 * r} L ${cx + 0.24 * r} ${cy + r} `
      + `L ${cx - 0.24 * r} ${cy + r} L ${cx - 0.24 * r} ${cy - 0.05 * r} L ${cx - 0.62 * r} ${cy - 0.05 * r} Z`;
    out = `<g transform="rotate(${f.rot} ${cx} ${cy})"><path d="${d}" ${fillAttrs(f.fill)} ${stroke}/></g>`;
  } else if (f.shape === "clock") {
    const handFill = f.fill === 2 ? 1 : f.fill; // voller Kreis würde den Zeiger verdecken
    out = `<circle cx="${cx}" cy="${cy}" r="${r}" ${fillAttrs(handFill)} ${stroke}/>`
      + `<g transform="rotate(${f.rot} ${cx} ${cy})"><line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - r * 0.82}" stroke="currentColor" stroke-width="${(r / 6).toFixed(1)}" stroke-linecap="round"/>`
      + `<circle cx="${cx}" cy="${cy}" r="${(r / 8).toFixed(1)}" fill="currentColor"/></g>`;
  }
  return out;
}

function dotElements(n, cx, y, spacing) {
  let out = "";
  const start = cx - ((n - 1) * spacing) / 2;
  for (let i = 0; i < n; i++) out += `<circle cx="${(start + i * spacing).toFixed(1)}" cy="${y}" r="${(spacing * 0.32).toFixed(1)}" fill="currentColor"/>`;
  return out;
}

// Figur in einer Zelle der Größe size, Ursprung (x, y)
export function cellElements(f, x, y, size) {
  const hasDots = f.dots > 0;
  const cx = x + size / 2;
  const cy = y + (hasDots ? size * 0.42 : size / 2);
  const r = size * (hasDots ? 0.28 : 0.34);
  const spacing = Math.min(size * 0.11, (size * 0.8) / Math.max(1, f.dots));
  return shapeElements(f, cx, cy, r) + (hasDots ? dotElements(f.dots, cx, y + size * 0.86, spacing) : "");
}

export function figureSvg(f) {
  return `<svg class="fig-svg" viewBox="0 0 100 100" role="img" aria-label="Figur">${cellElements(f, 0, 0, 100)}</svg>`;
}

function questionMark(x, y, size) {
  return `<text x="${x + size / 2}" y="${y + size * 0.64}" text-anchor="middle" font-size="${size * 0.5}" font-weight="700" fill="currentColor">?</text>`;
}

function frame(x, y, size) {
  return `<rect x="${x + 2}" y="${y + 2}" width="${size - 4}" height="${size - 4}" rx="8" fill="var(--fig-bg)" stroke="currentColor" stroke-opacity="0.25"/>`;
}

// Reihe von Figuren, am Ende ein Fragezeichen
export function sequenceSvg(figs) {
  const size = 100;
  const n = figs.length + 1;
  let body = "";
  figs.forEach((f, i) => { body += frame(i * size, 0, size) + cellElements(f, i * size, 0, size); });
  body += frame(figs.length * size, 0, size) + questionMark(figs.length * size, 0, size);
  return `<svg class="fig-svg" viewBox="0 0 ${n * size} ${size}" role="img" aria-label="Figurenreihe">${body}</svg>`;
}

// 3×3-Matrix, fehlende Zelle = null
export function matrixSvg(grid) {
  const size = 100;
  let body = "";
  grid.forEach((row, r) => row.forEach((f, c) => {
    body += frame(c * size, r * size, size) + (f ? cellElements(f, c * size, r * size, size) : questionMark(c * size, r * size, size));
  }));
  return `<svg class="fig-svg" viewBox="0 0 ${3 * size} ${3 * size}" role="img" aria-label="Figurenmatrix" style="max-width:300px">${body}</svg>`;
}
