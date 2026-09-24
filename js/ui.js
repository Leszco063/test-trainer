// Gemeinsame Oberflächen-Helfer: Bildschirm zeichnen, Timer, Navigation zwischen Ansichten.

export const app = document.getElementById("app");

let tickTimer = null;

export function stopTick() {
  if (tickTimer) clearInterval(tickTimer);
  tickTimer = null;
}

export function startTick(fn, ms = 1000) {
  stopTick();
  tickTimer = setInterval(fn, ms);
}

export function render(html) {
  stopTick();
  app.innerHTML = html;
  window.scrollTo(0, 0);
}

export function on(selector, event, handler) {
  app.querySelectorAll(selector).forEach(el => el.addEventListener(event, handler));
}

export function barColor(pct) {
  return pct >= 70 ? "var(--ok)" : pct >= 50 ? "var(--lvl2)" : "var(--bad)";
}

// Jede Ansicht meldet sich mit einem Namen an; so müssen sich die Module nicht gegenseitig importieren.
const screens = {};

export function screen(name, fn) {
  screens[name] = fn;
}

export function go(name, ...args) {
  screens[name](...args);
}
