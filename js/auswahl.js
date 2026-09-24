// Auswahl der nächsten Frage: passendes Level, neue Fragen zuerst,
// fällige Wiederholungen (Leitner-System) eingestreut.

import { rand, dateKey } from "./util.js";
import { REPEAT_SHARE } from "./config.js";
import { withBox, isDue } from "./speicher.js";

export function chooseByHistory(candidates, history) {
  const today = dateKey();
  const unseen = candidates.filter(q => !history[q.id]);
  const due = candidates.filter(q => history[q.id] && isDue(history[q.id], today));

  if (due.length && (!unseen.length || Math.random() < REPEAT_SHARE)) {
    // die wackeligsten Fragen (niedrigste Box) zuerst
    const minBox = Math.min(...due.map(q => withBox(history[q.id]).box));
    return rand(due.filter(q => withBox(history[q.id]).box === minBox));
  }
  if (unseen.length) return rand(unseen);
  // Alles schon gesehen und nichts fällig: die, deren Termin am nächsten liegt
  const soonest = candidates.slice().sort((a, b) => withBox(history[a.id]).faellig.localeCompare(withBox(history[b.id]).faellig));
  return rand(soonest.slice(0, 3));
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
