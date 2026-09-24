// Fragen für das Vorstellungsgespräch (Best Fit Interview) mit Hinweisen und Antwort-Bausteinen.
// "bausteine" sind Anregungen passend zum eigenen Werdegang (Kfz-Mechatronik -> IT) –
// Platzhalter in [eckigen Klammern] mit eigenen, echten Beispielen füllen.

export const GROUPS = [
  "Einstieg & Motivation",
  "Stärken & Schwächen",
  "Situationen (STAR)",
  "IT-Interesse & Fachliches",
  "Abschluss & Rahmen",
];

export const INTERVIEW = [
  // ---------------- Einstieg & Motivation ----------------
  {
    id: "vorstellen", group: 0, q: "Erzähl uns etwas über dich.",
    ziel: "Ein roter Faden in 1–2 Minuten: Wer bist du, was machst du gerade, warum sitzt du hier?",
    tipps: [
      "Nicht den Lebenslauf vorlesen – drei Stationen reichen: aktuell, Wechselmotiv, Ziel.",
      "Mit dem Bezug zur Stelle enden, nicht mit Hobbys.",
      "Vorher laut üben und die Zeit stoppen.",
    ],
    bausteine: [
      "„Ich mache gerade meine Ausbildung zum Kfz-Mechatroniker, die ich im März 2027 abschließe.“",
      "„Am meisten Spaß macht mir dabei die Fehlersuche in der Fahrzeugelektronik – [konkretes Beispiel].“",
      "„Dabei habe ich gemerkt, dass mich die IT dahinter mehr interessiert als die Mechanik. Deshalb bewerbe ich mich als Fachinformatiker für Systemintegration.“",
    ],
  },
  {
    id: "warumfisi", group: 0, q: "Warum möchtest du Fachinformatiker für Systemintegration werden?",
    ziel: "Echtes Interesse und eine Vorstellung davon, was der Beruf ist.",
    tipps: [
      "Konkret werden: Netzwerke, Server, Fehlersuche, Anwender unterstützen.",
      "Zeigen, dass du den Unterschied zur Anwendungsentwicklung kennst (Systemintegration = Infrastruktur, nicht hauptsächlich Programmieren).",
      "Ein Erlebnis nennen, bei dem dich IT gepackt hat.",
    ],
    bausteine: [
      "„Mich reizt, Systeme zum Laufen zu bringen und Störungen systematisch einzugrenzen – das mache ich in der Werkstatt schon mit Steuergeräten und Diagnosetestern.“",
      "„Ich habe mir [z. B. eine eigene Lern-App gebaut / einen PC zusammengebaut / mein Heimnetz eingerichtet] und dabei gemerkt, dass ich an so etwas stundenlang dranbleiben kann.“",
    ],
  },
  {
    id: "wechsel", group: 0, q: "Warum wechselst du nach der Kfz-Ausbildung in die IT?",
    ziel: "Die wichtigste Frage für dich: Ist der Wechsel durchdacht – oder eine Flucht? Bringst du etwas mit?",
    tipps: [
      "Positiv formulieren: Du gehst ZU etwas hin, nicht VON etwas weg.",
      "Die Kfz-Ausbildung als Vorteil darstellen, nicht als Umweg: Du schließt sie ab und bringst Erfahrung mit.",
      "Übertragbare Fähigkeiten nennen: systematische Fehlersuche, Kundenkontakt, Sorgfalt, Arbeiten nach Vorgaben, Arbeitsschutz.",
      "Moderne Fahrzeuge sind rollende Rechner: Steuergeräte, Bussysteme, Software-Updates – eine echte Brücke zur IT.",
    ],
    bausteine: [
      "„Ich bringe meine Ausbildung bewusst zu Ende, weil ich Dinge abschließe, die ich anfange.“",
      "„Bei der Diagnose arbeite ich schon heute mit Steuergeräten, Bussystemen und Software-Updates. Genau dieser Teil hat mich am meisten interessiert.“",
      "„In der Werkstatt habe ich gelernt, Fehler Schritt für Schritt einzugrenzen, statt zu raten – das ist im IT-Support genauso.“",
      "„Durch den Kundenkontakt weiß ich, wie man Technik verständlich erklärt.“",
    ],
  },
  {
    id: "warumtelekom", group: 0, q: "Warum möchtest du zur Telekom?",
    ziel: "Hast du dich mit dem Unternehmen beschäftigt – oder ist es eine von vielen Bewerbungen?",
    tipps: [
      "Vorher auf telekom.com/karriere und in aktuellen Nachrichten informieren – was davon spricht dich wirklich an?",
      "Bezug zu deiner Arbeit herstellen: große, moderne Netzinfrastruktur, z. B. Glasfaser- und 5G-Ausbau – genau das Umfeld eines Systemintegrators.",
      "Nichts auswendig Gelerntes aufsagen, sondern 1–2 Punkte, die dir wirklich wichtig sind.",
      "Keine Aussagen machen, die du nicht belegen kannst.",
    ],
    bausteine: [
      "„Bei der Telekom lerne ich IT dort, wo die Infrastruktur für Millionen Kunden läuft – [z. B. Netz, Rechenzentren].“",
      "„Mich hat angesprochen, dass [etwas, das du selbst auf der Karriereseite gelesen hast].“",
      "„Mir ist wichtig, nach der Ausbildung Perspektiven zu haben und mich weiterentwickeln zu können.“",
    ],
  },
  {
    id: "wissenausbildung", group: 0, q: "Was weißt du über die Ausbildung zum Fachinformatiker für Systemintegration?",
    ziel: "Hast du dich informiert, worauf du dich einlässt?",
    tipps: [
      "Dauer: in der Regel 3 Jahre, Betrieb und Berufsschule.",
      "Inhalte: Netzwerke, Server und Betriebssysteme, IT-Sicherheit, Datenschutz, Kundenberatung und Support, Projekte.",
      "Prüfung: gestreckte Abschlussprüfung in zwei Teilen (Teil 1 etwa zur Mitte der Ausbildung, Teil 2 am Ende mit betrieblichem Projekt).",
      "Unterschied zur Anwendungsentwicklung kennen.",
    ],
    bausteine: [
      "„Als Systemintegrator plane und betreue ich IT-Systeme und Netzwerke – vom Einrichten eines Arbeitsplatzes bis zur Fehlersuche im Netz.“",
      "„Ich weiß, dass es eine gestreckte Abschlussprüfung gibt und im zweiten Teil ein eigenes Projekt dokumentiert wird.“",
    ],
  },
  {
    id: "fuenfjahre", group: 0, q: "Wo siehst du dich in fünf Jahren?",
    ziel: "Hast du Ziele – und passen sie zum Unternehmen?",
    tipps: [
      "Realistisch und im Unternehmen bleiben: Ausbildung gut abschließen, übernommen werden, sich spezialisieren.",
      "Interesse an Weiterbildung zeigen (z. B. Netzwerk- oder Sicherheitszertifikate).",
      "Nicht: „Dann bin ich weg“ oder „Chef“.",
    ],
    bausteine: [
      "„Ich möchte die Ausbildung gut abschließen und danach im Team bleiben – am liebsten im Bereich [Netzwerk / IT-Sicherheit / Server].“",
      "„Ich kann mir gut vorstellen, mich mit Weiterbildungen zu spezialisieren.“",
    ],
  },

  // ---------------- Stärken & Schwächen ----------------
  {
    id: "staerken", group: 1, q: "Was sind deine Stärken?",
    ziel: "2–3 Stärken, die zur Stelle passen – jeweils mit Beleg.",
    tipps: [
      "Nicht aufzählen, sondern belegen: Stärke + kurzes Beispiel.",
      "Passend zum Beruf: analytisches Denken, Geduld bei der Fehlersuche, Lernbereitschaft, Kundenkontakt.",
      "Deine Noten liefern Belege: Deutsch 2 und Englisch 2 (B2) helfen bei Dokumentation und englischen Fachtexten.",
    ],
    bausteine: [
      "„Ich bleibe bei Problemen dran. [Beispiel: Fehler, den du nach längerer Suche gefunden hast.]“",
      "„Ich kann Dinge verständlich erklären – das brauche ich täglich im Kundengespräch.“",
      "„Englisch fällt mir leicht – ich habe B2-Niveau, das hilft bei englischer Dokumentation.“",
    ],
  },
  {
    id: "schwaeche", group: 1, q: "Was ist eine Schwäche von dir?",
    ziel: "Selbstreflexion: Kennst du dich – und arbeitest du daran?",
    tipps: [
      "Eine echte, aber nicht jobkritische Schwäche wählen.",
      "Immer mit dem, was du dagegen tust, enden.",
      "Keine Schein-Schwächen wie „Ich bin zu perfektionistisch“ – das wirkt auswendig gelernt.",
    ],
    bausteine: [
      "„Ich neige dazu, [z. B. zu viele Dinge gleichzeitig anzufangen]. Inzwischen [z. B. schreibe ich mir Prioritäten auf und arbeite sie nacheinander ab].“",
    ],
  },
  {
    id: "noten", group: 1, q: "Deine Noten in den praktischen Lernfeldern sind nicht so gut – woran liegt das?",
    ziel: "Umgang mit Schwächen: Ehrlich, reflektiert, ohne Ausreden oder Schuldzuweisungen.",
    tipps: [
      "Ruhig bleiben – die Frage ist keine Falle, sondern ein Test, wie du mit Kritik umgehst.",
      "Ehrlich einordnen: Was hat dir gefehlt, was hast du daraus gelernt?",
      "Überleitung zur Motivation: Was dich wirklich interessiert, darin bist du gut (theoretische Fächer, Diagnose-Denken).",
      "Nicht über Lehrer oder Betrieb schimpfen.",
    ],
    bausteine: [
      "„Ehrlich gesagt hat mich das rein Mechanische weniger gepackt als die Elektronik und Diagnose – und das merkt man an den Noten.“",
      "„Gelernt habe ich daraus, dass ich in einem Beruf besser bin, der mich wirklich interessiert – deshalb der Wechsel.“",
      "„In den Fächern, die mich interessieren, bin ich deutlich besser – [z. B. Politik/Gesellschaft 1, Deutsch 2].“",
    ],
  },
  {
    id: "stress", group: 1, q: "Wie gehst du mit Stress und Zeitdruck um?",
    ziel: "Belastbarkeit – z. B. bei Störungen, wenn viele Kunden gleichzeitig warten.",
    tipps: [
      "Konkrete Strategie nennen: priorisieren, Ruhe bewahren, kommunizieren.",
      "Beispiel aus der Werkstatt: volle Auftragslage, Kunde wartet auf sein Auto.",
    ],
    bausteine: [
      "„Wenn viel los ist, verschaffe ich mir erst einen Überblick und entscheide, was wirklich dringend ist.“",
      "„Wenn ich merke, dass ein Termin nicht zu halten ist, sage ich früh Bescheid, statt zu hoffen.“",
    ],
  },
  {
    id: "kritik", group: 1, q: "Wie gehst du mit Kritik um?",
    ziel: "Bist du lernfähig – oder fühlst du dich schnell angegriffen?",
    tipps: [
      "Zeigen, dass du Kritik als Hilfe siehst.",
      "Beispiel: Kritik vom Ausbilder, was du daraufhin geändert hast.",
    ],
    bausteine: [
      "„Ich höre erst zu und frage nach, wenn ich etwas nicht verstehe. [Beispiel: Rückmeldung vom Ausbilder und was du geändert hast.]“",
    ],
  },

  // ---------------- Situationen (STAR) ----------------
  {
    id: "problem", group: 2, q: "Erzähl von einer Situation, in der du ein schwieriges Problem gelöst hast.",
    ziel: "Wie gehst du systematisch vor? Hier punktet deine Diagnose-Erfahrung.",
    star: true,
    tipps: [
      "STAR-Methode: Situation – Aufgabe – Aktion – Resultat.",
      "Den Schwerpunkt auf DEINE Aktion legen: Welche Schritte, in welcher Reihenfolge, warum?",
      "Ein Werkstatt-Fall eignet sich perfekt: sporadischer Fehler, Fehlerspeicher, Messen, Eingrenzen.",
    ],
    bausteine: [
      "S: „Ein Kunde kam mit [Fehlerbild], der Fehler trat nur manchmal auf.“",
      "T: „Ich sollte die Ursache finden, ohne auf Verdacht Teile zu tauschen.“",
      "A: „Ich habe [Fehlerspeicher ausgelesen, Stecker geprüft, gemessen …] und so eingegrenzt.“",
      "R: „Ursache war [X]. Seitdem gehe ich bei sporadischen Fehlern immer so vor.“",
    ],
  },
  {
    id: "konflikt", group: 2, q: "Beschreibe einen Konflikt im Team und wie du damit umgegangen bist.",
    ziel: "Teamfähigkeit und Kommunikation.",
    star: true,
    tipps: [
      "Einen echten, aber nicht dramatischen Konflikt wählen.",
      "Nicht schlecht über andere reden – sachlich bleiben.",
      "Zeigen, dass du das Gespräch gesucht hast und was dabei herauskam.",
    ],
    bausteine: [
      "„Ein Kollege und ich hatten unterschiedliche Vorstellungen, wie [Aufgabe] gemacht werden soll. Ich habe ihn in Ruhe darauf angesprochen …“",
    ],
  },
  {
    id: "kunde", group: 2, q: "Wie reagierst du, wenn ein Kunde unfreundlich ist?",
    ziel: "Kundenorientierung – im IT-Support und bei der Telekom zentral.",
    star: true,
    tipps: [
      "Ruhig bleiben, zuhören, nicht persönlich nehmen.",
      "Verständnis zeigen, Problem zusammenfassen, realistische Lösung anbieten.",
      "Beispiel aus der Werkstatt: verärgerter Kunde an der Annahme.",
    ],
    bausteine: [
      "„Ich lasse den Kunden erst ausreden. Meistens ärgert er sich ja über die Situation, nicht über mich.“",
      "„Dann fasse ich das Problem zusammen und sage ehrlich, was ich tun kann und wann.“",
    ],
  },
  {
    id: "nichtweiter", group: 2, q: "Was machst du, wenn du bei einer Aufgabe nicht weiterkommst?",
    ziel: "Selbstständigkeit – aber auch, dass du rechtzeitig fragst.",
    tipps: [
      "Die Reihenfolge zeigt Reife: erst selbst recherchieren (Doku, Handbuch, Internet), dann gezielt fragen.",
      "Nicht stundenlang allein festhängen, aber auch nicht sofort fragen.",
    ],
    bausteine: [
      "„Zuerst versuche ich es selbst – Dokumentation, Herstellerinfos, Internet. Wenn ich nach einer angemessenen Zeit nicht weiterkomme, frage ich gezielt und sage, was ich schon probiert habe.“",
    ],
  },
  {
    id: "fehler", group: 2, q: "Erzähl von einem Fehler, den du gemacht hast.",
    ziel: "Ehrlichkeit und Lernfähigkeit.",
    star: true,
    tipps: [
      "Einen echten, kleinen Fehler nennen – und offen dazu stehen.",
      "Wichtig ist der Schluss: Was hast du daraus gelernt, was machst du seitdem anders?",
    ],
    bausteine: [
      "„[Fehler, z. B. etwas nicht noch einmal kontrolliert.] Ich habe es sofort meinem Ausbilder gesagt, und seitdem [prüfe ich …] immer doppelt.“",
    ],
  },

  // ---------------- IT-Interesse & Fachliches ----------------
  {
    id: "privatit", group: 3, q: "Wie beschäftigst du dich privat mit IT?",
    ziel: "Echtes Interesse über die Bewerbung hinaus.",
    tipps: [
      "Nur erzählen, was stimmt – Nachfragen kommen bestimmt.",
      "Projekte zählen mehr als „Ich zocke gern“.",
      "Diese Lern-App ist ein gutes Beispiel – sag dazu ehrlich, dass du sie mit KI-Unterstützung gebaut hast, und was du dabei gelernt hast (Web-App, GitHub, Offline-Funktion, Tests).",
    ],
    bausteine: [
      "„Für die Vorbereitung auf den Einstellungstest habe ich mir mit Hilfe einer KI eine eigene Lern-App gebaut. Dabei habe ich gelernt, wie eine Web-App aufgebaut ist, was GitHub ist und wie man eine App offline nutzbar macht.“",
      "„[Weitere eigene Projekte: PC-Bau, Heimnetz, Raspberry Pi, …]“",
    ],
  },
  {
    id: "router", group: 3, q: "Erkläre einem Laien, was ein Router macht.",
    ziel: "Kannst du Technik verständlich erklären? Wichtig für Kundenkontakt.",
    tipps: [
      "Ohne Fachbegriffe starten, ein Bild aus dem Alltag nutzen.",
      "Kurz halten – Nachfragen abwarten.",
    ],
    bausteine: [
      "„Der Router ist wie die Poststelle eines Hauses: Er verbindet das Heimnetz mit dem Internet und sorgt dafür, dass jedes Paket beim richtigen Gerät ankommt.“",
      "Fachlich: verbindet verschiedene Netze, arbeitet mit IP-Adressen (OSI-Schicht 3), oft mit DHCP, WLAN und Firewall kombiniert.",
    ],
  },
  {
    id: "dnsdhcp", group: 3, q: "Was ist der Unterschied zwischen DNS und DHCP?",
    ziel: "Kleine Fachfrage – zeigt, ob du dich vorbereitet hast.",
    tipps: [
      "Kurz und sicher antworten, dann ein Beispiel.",
      "Wenn du etwas nicht weißt: ehrlich sagen und erklären, wie du es herausfinden würdest.",
    ],
    bausteine: [
      "„DNS übersetzt Namen wie telekom.de in IP-Adressen – wie ein Telefonbuch. DHCP verteilt automatisch IP-Adressen an Geräte, wenn sie ins Netz kommen – wie der Empfang im Hotel, der die Zimmernummer vergibt.“",
    ],
  },
  {
    id: "themen", group: 3, q: "Welche aktuellen IT-Themen interessieren dich?",
    ziel: "Bist du neugierig und informiert?",
    tipps: [
      "1–2 Themen nennen, zu denen du wirklich etwas sagen kannst.",
      "Passend zur Telekom: Glasfaserausbau, 5G, IT-Sicherheit, Cloud, KI.",
      "Eine eigene Meinung oder Frage dazu macht die Antwort stark.",
    ],
    bausteine: [
      "„Mich interessiert IT-Sicherheit, z. B. [Phishing, Ransomware] – gerade, weil der Mensch oft die größte Schwachstelle ist.“",
      "„Spannend finde ich auch, wie sich Autos und IT verbinden: Software-Updates übers Netz, vernetzte Fahrzeuge.“",
    ],
  },

  // ---------------- Abschluss & Rahmen ----------------
  {
    id: "arbeitstag", group: 4, q: "Wie stellst du dir einen typischen Arbeitstag vor?",
    ziel: "Realistische Vorstellung vom Beruf.",
    tipps: [
      "Mischung nennen: Tickets bearbeiten, Arbeitsplätze einrichten, Netzwerk betreuen, dokumentieren, im Team abstimmen, Berufsschule.",
      "Zeigen, dass dir klar ist: Nicht jeder Tag ist spannend, Dokumentation gehört dazu.",
    ],
    bausteine: [
      "„Ich stelle mir eine Mischung aus Support-Anfragen, Projekten wie dem Einrichten neuer Geräte und Dokumentation vor – und dass ich anfangs viel über die Schulter schaue.“",
    ],
  },
  {
    id: "freizeit", group: 4, q: "Was machst du in deiner Freizeit?",
    ziel: "Persönlichkeit – und ob du einen Ausgleich hast.",
    tipps: [
      "Ehrlich und kurz, gern mit einem Detail, über das man ins Gespräch kommt.",
      "Teamsport oder Ehrenamt zeigen Teamfähigkeit – aber nichts erfinden.",
    ],
    bausteine: ["„[Deine Hobbys] – das ist mein Ausgleich zur Arbeit.“"],
  },
  {
    id: "warumdu", group: 4, q: "Warum sollten wir gerade dich nehmen?",
    ziel: "Deine Zusammenfassung – das Wichtigste in 30 Sekunden.",
    tipps: [
      "Drei Punkte: Motivation, Vorerfahrung, Eigenschaft.",
      "Selbstbewusst, aber nicht überheblich.",
    ],
    bausteine: [
      "„Ich bringe eine abgeschlossene Ausbildung mit, in der ich systematische Fehlersuche und Kundenkontakt gelernt habe. Ich wechsle ganz bewusst in die IT, weil mich genau das interessiert – und ich bleibe dran, wenn es schwierig wird.“",
    ],
  },
  {
    id: "rueckfragen", group: 4, q: "Hast du noch Fragen an uns?",
    ziel: "Immer Fragen haben! Das zeigt Interesse. Nicht nach Urlaub oder Gehalt als Erstes fragen.",
    tipps: [
      "„In welchen Bereichen oder Teams werde ich während der Ausbildung eingesetzt?“",
      "„Wie läuft das Business Match ab?“",
      "„Wie ist die Berufsschule organisiert – Blockunterricht oder einzelne Tage?“",
      "„Welche Möglichkeiten gibt es, nach der Ausbildung übernommen zu werden?“",
      "„Was schätzen Ihre aktuellen Azubis besonders?“",
      "„Wie geht es nach diesem Gespräch weiter?“",
    ],
    bausteine: ["Zwei bis drei Fragen vorbereiten – falls eine schon beantwortet wurde, hast du noch eine."],
  },
];

export const GENERAL_TIPS = `
  <h4>Die STAR-Methode</h4>
  <p>Für alle Fragen nach konkreten Situationen („Erzähl von einem Mal, als …“):</p>
  <table class="ktable">
    <tr><td>S – Situation</td><td>Wo, wann, was war los? (1–2 Sätze)</td></tr>
    <tr><td>T – Task</td><td>Was war deine Aufgabe / das Ziel?</td></tr>
    <tr><td>A – Action</td><td>Was hast DU getan? (Hauptteil, konkret)</td></tr>
    <tr><td>R – Result</td><td>Was kam heraus, was hast du gelernt?</td></tr>
  </table>
  <h4>Vorbereitung</h4>
  <ul>
    <li>Zu jeder Frage Stichpunkte notieren – nicht auswendig lernen, sondern frei sprechen üben.</li>
    <li>Antworten laut üben, am besten mit jemandem oder als Sprachnachricht an dich selbst.</li>
    <li>Eigene Bewerbung und Lebenslauf noch einmal lesen – alles darin kann Thema werden.</li>
    <li>Die Ergebnisse deines Online-Tests werden im Gespräch eventuell besprochen – überleg dir, wie du über deine stärksten und schwächsten Bereiche sprichst.</li>
    <li>Bei Video-Gesprächen: Technik vorher testen, ruhiger Raum, Kamera auf Augenhöhe.</li>
  </ul>
  <h4>Im Gespräch</h4>
  <ul>
    <li>Pünktlich (10 Minuten vorher bereit), freundlich, Blickkontakt.</li>
    <li>Kurze Denkpause ist okay – „Gute Frage, lassen Sie mich kurz überlegen.“</li>
    <li>Ehrlich bleiben: Nichts behaupten, was du nicht belegen kannst.</li>
    <li>Wenn du etwas Fachliches nicht weißt: zugeben und sagen, wie du es herausfinden würdest.</li>
  </ul>`;
