// Generator für Rechtschreibung als Fehleranalyse: "Welches Wort ist falsch geschrieben?"
// Vier Wörter, genau eines enthält einen typischen Fehler.

import { rand, shuffle } from "../util.js";
import { genId } from "./gemeinsam.js";

// [richtig, typischer Fehler, Level]
const WORDS = [
  ["nämlich", "nähmlich", 1], ["Maschine", "Maschiene", 1], ["Reparatur", "Reperatur", 1],
  ["Adresse", "Addresse", 1], ["Interesse", "Interresse", 1], ["Gebühr", "Gebür", 1],
  ["Paket", "Packet", 1], ["Wiederholung", "Widerholung", 1], ["Nummer", "Numer", 1],
  ["Ergebnis", "Ergebniss", 1], ["tödlich", "tötlich", 1], ["Fahrrad", "Farrad", 1],
  ["Standard", "Standart", 2], ["Entgelt", "Entgeld", 2], ["Voraussetzung", "Vorraussetzung", 2],
  ["Karriere", "Kariere", 2], ["endgültig", "entgültig", 2], ["Kenntnis", "Kentnis", 2],
  ["Bibliothek", "Bibliotek", 2], ["Diskussion", "Diskusion", 2], ["Konkurrenz", "Konkurenz", 2],
  ["Empfehlung", "Empfelung", 2], ["Zertifikat", "Zertefikat", 2], ["akzeptieren", "akzebtieren", 2],
  ["Lizenz", "Lizens", 2], ["Kommission", "Komission", 2],
  ["Rhythmus", "Rythmus", 3], ["Satellit", "Sattelit", 3], ["Ingenieur", "Ingeneur", 3],
  ["Algorithmus", "Algorhythmus", 3], ["Hierarchie", "Hirarchie", 3], ["Atmosphäre", "Athmosphäre", 3],
  ["Rhetorik", "Rethorik", 3], ["Reflexion", "Reflektion", 3], ["Gleichgültigkeit", "Gleichgültichkeit", 3],
];
// Bewusst NICHT aufgenommen: Wörter mit zwei erlaubten Schreibweisen (z. B. Portemonnaie/Portmonee).

export function generateSpelling(level) {
  const pool = WORDS.filter(w => w[2] <= level);
  const [wrongPair, ...rest] = shuffle(pool.length >= 4 ? pool : WORDS).slice(0, 4);
  const opts = shuffle([wrongPair[1], ...rest.map(w => w[0])]);
  return {
    id: genId("de"),
    cat: "Deutsch",
    level,
    q: "Welches Wort ist falsch geschrieben?",
    opts,
    correct: opts.indexOf(wrongPair[1]),
    explain: `Falsch ist „${wrongPair[1]}“ – richtig heißt es „${wrongPair[0]}“. Die anderen Wörter sind korrekt: ${rest.map(w => w[0]).join(", ")}.`,
    gen: true,
  };
}
