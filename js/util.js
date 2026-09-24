// Kleine Hilfsfunktionen ohne Bezug zur Oberfläche (laufen auch in Node für die Tests).

export function esc(text) {
  return String(text).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function rand(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pad2 = n => String(n).padStart(2, "0");

export function dateKey(d = new Date()) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function nowStamp(d = new Date()) {
  return `${dateKey(d)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

export function addDays(key, days) {
  const [y, m, d] = key.split("-").map(Number);
  return dateKey(new Date(y, m - 1, d + days));
}

// Zahlen im deutschen Format: 1.234,5
export function fmt(n, maxDigits = 2) {
  return Number(n).toLocaleString("de-DE", { maximumFractionDigits: maxDigits });
}

export function euro(n) {
  const digits = Number.isInteger(n) ? 0 : 2;
  return Number(n).toLocaleString("de-DE", { minimumFractionDigits: digits, maximumFractionDigits: 2 }) + " €";
}

export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m ? `${m}:${pad2(s)} min` : `${s} s`;
}
