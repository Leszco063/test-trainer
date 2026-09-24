// Einstiegspunkt: lädt alle Ansichten (sie melden sich selbst an) und zeigt den Start.

import { go } from "./ui.js";
import "./start.js";
import "./uebung.js";
import "./statistik.js";
import "./persoenlichkeit.js";
import "./pruefung.js";
import "./lernen.js";
import "./meldungen.js";
import "./interview.js";
import "./sjt.js";
import "./interessen.js";

go("start");

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
