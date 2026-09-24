// Situational Judgement Test (SJT): Situationen aus dem Arbeitsalltag mit vier Reaktionen.
// Im echten Telekom-Test verteilt man 8 Zustimmungspunkte auf die vier Möglichkeiten.
// Offiziell gibt es kein Richtig/Falsch. Die Einstufung hier ("wert") ist eine Orientierung,
// wie Arbeitgeber solche Reaktionen typischerweise sehen – nicht die Telekom-Auswertung:
//   2 = sehr konstruktiv · 1 = in Ordnung · 0 = eher passiv · -1 = eher schädlich

export const SJT_POINTS = 8;

export const VALUE_LABELS = {
  2: "sehr konstruktiv",
  1: "in Ordnung",
  0: "eher passiv",
  "-1": "eher ungünstig",
};

export const SJT = [
  {
    id: "kritik", situation: "Dein Ausbilder kritisiert deine Arbeit. Du hältst die Kritik aber nicht für berechtigt.",
    options: [
      { text: "Ich frage ruhig nach, was genau gemeint ist, und erkläre sachlich meine Sicht.", wert: 2, warum: "Klärt Missverständnisse und zeigt, dass du Kritik ernst nimmst." },
      { text: "Ich nehme die Kritik hin, sage nichts und arbeite weiter.", wert: 0, warum: "Vermeidet Konflikt, aber das Missverständnis bleibt bestehen." },
      { text: "Ich widerspreche sofort und sage, dass die Kritik unfair ist.", wert: -1, warum: "Wirkt abwehrend und wenig lernbereit." },
      { text: "Ich denke erst in Ruhe darüber nach und suche später das Gespräch.", wert: 1, warum: "Besonnen – wichtig ist, dass das Gespräch dann auch wirklich stattfindet." },
    ],
  },
  {
    id: "ladenschluss", situation: "Im Shop kommt kurz vor Feierabend ein Kunde mit einem komplizierten Problem zu seinem Vertrag.",
    options: [
      { text: "Ich höre zu, kläre das Wichtigste und biete für den Rest einen Rückruf oder Termin an.", wert: 2, warum: "Kundenorientiert und trotzdem realistisch." },
      { text: "Ich bitte ihn, morgen wiederzukommen.", wert: 0, warum: "Nachvollziehbar, wirkt aber abweisend." },
      { text: "Ich empfehle schnell irgendeine Lösung, damit er zufrieden geht.", wert: -1, warum: "Eine vorschnelle, falsche Lösung schadet dem Kunden und dem Unternehmen." },
      { text: "Ich frage eine Kollegin, die heute länger da ist, ob sie übernehmen kann.", wert: 1, warum: "Gute Idee, wenn es ordentlich übergeben wird." },
    ],
  },
  {
    id: "frist", situation: "Du merkst, dass du eine Aufgabe nicht rechtzeitig fertig bekommst.",
    options: [
      { text: "Ich sage früh Bescheid und schlage vor, was ich bis wann schaffe.", wert: 2, warum: "Transparent und lösungsorientiert – so kann das Team planen." },
      { text: "Ich arbeite heimlich länger, damit es niemand merkt.", wert: 1, warum: "Engagiert, aber auf Dauer keine Lösung und ohne Absprache." },
      { text: "Ich gebe zum Termin ab, was fertig ist, ohne etwas zu sagen.", wert: -1, warum: "Überrascht das Team im schlechtesten Moment." },
      { text: "Ich bitte einen Kollegen, einen Teil zu übernehmen, ohne den Ausbilder zu informieren.", wert: 0, warum: "Hilft kurzfristig, umgeht aber die Planung." },
    ],
  },
  {
    id: "teamkollege", situation: "Ein Kollege in deinem Projektteam erledigt seine Aufgaben kaum, die Arbeit bleibt an dir hängen.",
    options: [
      { text: "Ich spreche ihn direkt und freundlich darauf an.", wert: 2, warum: "Der direkte Weg zuerst – oft gibt es einen Grund, den man nicht kennt." },
      { text: "Ich wende mich an den Ausbilder, wenn ein Gespräch nichts ändert.", wert: 1, warum: "Richtig als zweiter Schritt." },
      { text: "Ich übernehme seine Aufgaben stillschweigend mit.", wert: 0, warum: "Löst das Problem nicht und überlastet dich." },
      { text: "Ich beschwere mich im Team-Chat über ihn.", wert: -1, warum: "Stellt ihn öffentlich bloß und vergiftet die Stimmung." },
    ],
  },
  {
    id: "neueaufgabe", situation: "Du sollst etwas einrichten, das du noch nie gemacht hast. Alle Kollegen sind gerade beschäftigt.",
    options: [
      { text: "Ich lese mich in die Anleitung ein, probiere es und frage später gezielt nach.", wert: 2, warum: "Selbstständig und trotzdem abgesichert." },
      { text: "Ich warte, bis jemand Zeit hat.", wert: 0, warum: "Sicher, aber du verlierst Zeit und lernst weniger." },
      { text: "Ich lege einfach los, auch an Stellen, bei denen ich unsicher bin.", wert: -1, warum: "Kann bei Systemen echten Schaden anrichten." },
      { text: "Ich schreibe einem Kollegen eine kurze Frage per Chat.", wert: 1, warum: "Stört wenig und bringt dich weiter." },
    ],
  },
  {
    id: "technikertermin", situation: "Eine Kundin ruft verärgert an, weil ihr Techniker-Termin ausgefallen ist.",
    options: [
      { text: "Ich zeige Verständnis, entschuldige mich und vereinbare verbindlich einen neuen Termin.", wert: 2, warum: "Nimmt den Ärger ernst und löst das Problem." },
      { text: "Ich erkläre, dass ich persönlich nichts dafür kann.", wert: 0, warum: "Stimmt vielleicht, hilft der Kundin aber nicht." },
      { text: "Ich verbinde sie ohne Erklärung an eine andere Abteilung.", wert: -1, warum: "Die Kundin fühlt sich abgeschoben." },
      { text: "Ich kläre, ob es eine kleine Entschädigung gibt, und biete sie an.", wert: 1, warum: "Gute Geste – zusätzlich zur eigentlichen Lösung." },
    ],
  },
  {
    id: "eigenerfehler", situation: "Du entdeckst einen Fehler in einer Arbeit, die du schon abgegeben hast.",
    options: [
      { text: "Ich melde den Fehler sofort und korrigiere ihn.", wert: 2, warum: "Ehrlich und verantwortungsvoll – Fehler früh zu melden verhindert größeren Schaden." },
      { text: "Ich korrigiere ihn heimlich, ohne etwas zu sagen.", wert: 1, warum: "Der Fehler ist weg, aber andere haben vielleicht schon damit gearbeitet." },
      { text: "Ich warte ab, ob es jemand bemerkt.", wert: 0, warum: "Der Fehler kann weiterwirken." },
      { text: "Ich hoffe, dass es niemandem auffällt, und sage nichts.", wert: -1, warum: "Wirkt unehrlich, wenn es herauskommt." },
    ],
  },
  {
    id: "neueazubi", situation: "Eine neue Auszubildende findet sich in den ersten Tagen nicht zurecht.",
    options: [
      { text: "Ich biete ihr Hilfe an und zeige ihr die wichtigsten Abläufe.", wert: 2, warum: "Teamfähig – so wärst du am Anfang auch gern behandelt worden." },
      { text: "Ich sage ihr, sie soll den Ausbilder fragen.", wert: 0, warum: "Nicht falsch, aber wenig hilfsbereit." },
      { text: "Ich kümmere mich um meine Aufgaben – sie wird es schon lernen.", wert: -1, warum: "Wirkt gleichgültig." },
      { text: "Ich schicke ihr nach Feierabend ein paar Tipps.", wert: 1, warum: "Nett gemeint, persönlich zeigen hilft aber meist mehr." },
    ],
  },
  {
    id: "meeting", situation: "Im Teammeeting wird eine Lösung beschlossen, die du für schlechter hältst.",
    options: [
      { text: "Ich bringe meine Bedenken sachlich mit Argumenten ein und trage die Entscheidung danach mit.", wert: 2, warum: "Meinung vertreten und trotzdem loyal zum Team." },
      { text: "Ich sage nichts.", wert: 0, warum: "Dein Wissen geht dem Team verloren." },
      { text: "Ich setze die Aufgabe trotzdem auf meine Art um.", wert: -1, warum: "Untergräbt die Absprache im Team." },
      { text: "Ich spreche nach dem Meeting unter vier Augen mit der Teamleitung.", wert: 1, warum: "Diplomatisch, aber das Team hört die Argumente nicht." },
    ],
  },
  {
    id: "datenschutz", situation: "Ein Anrufer möchte die Vertragsdaten seiner Mutter wissen. Er klingt glaubwürdig und in Eile.",
    options: [
      { text: "Ich lehne freundlich ab, erkläre den Datenschutz und nenne ihm den richtigen Weg (z. B. Vollmacht).", wert: 2, warum: "Schützt die Kundin und bleibt trotzdem freundlich." },
      { text: "Ich gebe die Daten heraus, weil er glaubwürdig wirkt.", wert: -1, warum: "Datenschutzverstoß – genau so funktioniert Social Engineering." },
      { text: "Ich lege auf.", wert: 0, warum: "Die Daten sind sicher, aber der Anrufer bekommt keine Hilfe." },
      { text: "Ich frage kurz eine erfahrene Kollegin, wie ich vorgehen soll.", wert: 1, warum: "Gut, wenn man unsicher ist." },
    ],
  },
  {
    id: "zweiaufgaben", situation: "Zwei Kollegen geben dir gleichzeitig eine dringende Aufgabe.",
    options: [
      { text: "Ich informiere beide und kläre die Reihenfolge mit dem Ausbilder oder im Team.", wert: 2, warum: "Transparente Priorisierung statt Raten." },
      { text: "Ich erledige zuerst die Aufgabe des ranghöheren Kollegen.", wert: 0, warum: "Rang ist nicht automatisch gleich Dringlichkeit." },
      { text: "Ich arbeite an beiden gleichzeitig.", wert: -1, warum: "Am Ende ist oft keine richtig fertig." },
      { text: "Ich erledige die schnellere Aufgabe zuerst und sage dem anderen Bescheid.", wert: 1, warum: "Pragmatisch und kommuniziert." },
    ],
  },
  {
    id: "idee", situation: "Du hast eine Idee, wie ein Ablauf in deinem Team einfacher werden könnte.",
    options: [
      { text: "Ich bereite die Idee kurz vor und schlage sie im passenden Moment vor.", wert: 2, warum: "Eigeninitiative mit Respekt vor dem Team." },
      { text: "Ich behalte sie für mich – ich bin ja nur Azubi.", wert: 0, warum: "Frische Blicke von Azubis sind oft wertvoll." },
      { text: "Ich ändere den Ablauf einfach selbst.", wert: -1, warum: "Ohne Absprache entsteht Chaos." },
      { text: "Ich bespreche die Idee zuerst mit einem Kollegen.", wert: 1, warum: "Guter Test, bevor man sie vorstellt." },
    ],
  },
  {
    id: "vorort", situation: "Bei einem Einsatz beim Kunden stellst du fest: Das WLAN-Problem liegt an seinem eigenen Laptop, nicht am Anschluss.",
    options: [
      { text: "Ich erkläre ihm verständlich die Ursache und gebe Tipps, wie er es lösen kann.", wert: 2, warum: "Hilfsbereit, ohne den Rahmen des Auftrags zu sprengen." },
      { text: "Ich sage, dass das nicht meine Aufgabe ist, und gehe.", wert: -1, warum: "Korrekt, aber der Kunde bleibt ratlos und unzufrieden." },
      { text: "Ich repariere den Laptop ausführlich, obwohl weitere Termine warten.", wert: 0, warum: "Nett, aber andere Kunden warten dann umsonst." },
      { text: "Ich verweise ihn an den Support des Laptop-Herstellers.", wert: 1, warum: "Richtige Stelle – mit einer kurzen Erklärung noch besser." },
    ],
  },
  {
    id: "berufsschule", situation: "Eine Klassenarbeit in der Berufsschule ist schlecht ausgefallen.",
    options: [
      { text: "Ich schaue mir meine Fehler an, frage die Lehrkraft und plane, wie ich es aufhole.", wert: 2, warum: "Ursache verstehen und gezielt handeln." },
      { text: "Ich hake es ab – die nächste wird schon besser.", wert: -1, warum: "Ohne Änderung wiederholt sich das Ergebnis." },
      { text: "Ich frage Mitschüler mit guten Noten, wie sie gelernt haben.", wert: 1, warum: "Gute Idee zum Lernen von anderen." },
      { text: "Ich lerne beim nächsten Mal einfach länger.", wert: 0, warum: "Mehr Zeit hilft nur, wenn die Methode stimmt." },
    ],
  },
  {
    id: "zeiterfassung", situation: "Ein Kollege bittet dich, für ihn seine Arbeitszeit einzutragen, obwohl er noch nicht da ist.",
    options: [
      { text: "Ich lehne freundlich ab und erkläre, warum ich das nicht mache.", wert: 2, warum: "Ehrlich und trotzdem kollegial." },
      { text: "Ich mache es dieses eine Mal.", wert: -1, warum: "Falsche Zeiterfassung ist ein ernster Verstoß." },
      { text: "Ich lehne ab und informiere sofort die Teamleitung.", wert: 1, warum: "Korrekt, aber zuerst ein direktes Wort wäre fairer." },
      { text: "Ich reagiere einfach nicht auf die Nachricht.", wert: 0, warum: "Weicht der Situation aus." },
    ],
  },
  {
    id: "phishing", situation: "Du bekommst eine Mail: Dein Passwort läuft heute ab, bitte über den Link bestätigen.",
    options: [
      { text: "Ich klicke nicht und leite die Mail an die IT-Sicherheit weiter.", wert: 2, warum: "Schützt dich und warnt andere." },
      { text: "Ich klicke, um zu prüfen, ob es echt ist.", wert: -1, warum: "Genau das wollen Angreifer." },
      { text: "Ich lösche die Mail.", wert: 0, warum: "Du bist sicher, aber Kollegen bekommen dieselbe Mail." },
      { text: "Ich frage Kollegen, ob sie die Mail auch bekommen haben.", wert: 1, warum: "Sinnvoll – danach sollte sie aber an die IT gehen." },
    ],
  },
];
