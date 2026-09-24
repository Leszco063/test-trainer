// Auswahl der nächsten Frage: passendes Level, neue Fragen zuerst, Wiederholungen eingestreut.

import { rand } from "./util.js";
import { REPEAT_SHARE } from "./config.js";

export function chooseByHistory(candidates, history) {
  const unseen = candidates.filter(q => !history[q.id]);
  const wrong = candidates.filter(q => history[q.id] && history[q.id].letzte_richtig === false);
  if (wrong.length && (!unseen.length || Math.random() < REPEAT_SHARE)) return rand(wrong);
  if (unseen.length) return rand(unseen);
  const oldest = candidates.slice().sort((a, b) => (history[a.id].zuletzt || "").localeCompare(history[b.id].zuletzt || ""));
  return rand(oldest.slice(0, 3));
}

// Wählt aus dem Pool eine unbenutzte Frage im gewünschten Level (mit Ausweich-Leveln)
export function pickFromPool(pool, level, used, history) {
  const free = q => !used.has(q.id);
  let candidates = pool.filter(q => q.level === level && free(q));
  if (!candidates.length) {
    for (const fb of [level - 1, level + 1, level - 2, level + 2]) {
      if (fb < 1 || fb > 3) continue;
      candidates = pool.filter(q => q.level === fb && free(q));
      if (candidates.length) break;
    }
  }
  if (!candidates.length) candidates = pool.filter(free);
  if (!candidates.length) return null;
  return chooseByHistory(candidates, history);
}
