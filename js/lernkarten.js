// Spickzettel: kurze Lernkarten je Bereich. "keys" helfen, nach einer falschen Antwort
// die passende Karte vorzuschlagen (Treffer im Fragen- oder Erklärungstext).

export const CARDS = [
  // ============================ MATHE ============================
  {
    id: "prozent", cat: "Mathe", title: "Prozentrechnung",
    keys: ["%", "Prozent", "Rabatt", "Aufschlag", "Anteil"],
    html: `
      <p><strong>Drei Größen:</strong> Grundwert G (das Ganze = 100 %), Prozentsatz p, Prozentwert W (der Anteil).</p>
      <table class="ktable">
        <tr><td>Prozentwert</td><td>W = G × p ÷ 100</td></tr>
        <tr><td>Grundwert</td><td>G = W × 100 ÷ p</td></tr>
        <tr><td>Prozentsatz</td><td>p = W ÷ G × 100</td></tr>
      </table>
      <h4>Schnelle Tricks</h4>
      <ul>
        <li>10 % = Komma eine Stelle nach links (350 → 35), 1 % = zwei Stellen.</li>
        <li>50 % = Hälfte, 25 % = Viertel, 20 % = Fünftel, 12,5 % = Achtel.</li>
        <li>Rabatt 20 % → Preis × 0,8. Aufschlag 25 % → Preis × 1,25.</li>
      </ul>
      <h4>Die typischen Fallen</h4>
      <ul>
        <li><strong>Veränderung in %:</strong> Basis ist immer der ALTE Wert. 200 → 250 sind +25 %, 250 → 200 sind −20 %.</li>
        <li><strong>Zweimal Prozent:</strong> Faktoren multiplizieren, nicht Prozente addieren. +10 % und dann −10 % = × 1,1 × 0,9 = × 0,99 → 1 % weniger als vorher.</li>
        <li><strong>Rückwärts:</strong> Preis nach 20 % Rabatt ist 96 € → 96 ÷ 0,8 = 120 € (nicht 96 + 20 %).</li>
      </ul>`,
  },
  {
    id: "dreisatz", cat: "Mathe", title: "Dreisatz",
    keys: ["kosten", "brauchen", "Stück", "Monteure", "Techniker", "Arbeiter", "Maschinen", "Liter", "Drucker"],
    html: `
      <p>Immer über die <strong>Einheit</strong> (1 Stück, 1 Person, 1 Stunde) gehen.</p>
      <h4>Proportional – je mehr, desto mehr</h4>
      <p>5 Kabel kosten 20 €. → 1 Kabel 4 € → 8 Kabel 32 €.<br><em>Rechnung:</em> teilen, dann malnehmen.</p>
      <h4>Antiproportional – je mehr, desto weniger</h4>
      <p>4 Techniker brauchen 6 Stunden. → Gesamtarbeit 4 × 6 = 24 Personenstunden → 3 Techniker brauchen 24 ÷ 3 = 8 Stunden.<br><em>Rechnung:</em> malnehmen, dann teilen.</p>
      <h4>Kontrollfrage</h4>
      <p>„Wenn es mehr Leute/Maschinen werden – muss das Ergebnis größer oder kleiner werden?“ Passt dein Ergebnis dazu?</p>
      <h4>Mehrere Größen</h4>
      <p>3 Maschinen machen in 4 h 360 Teile → 1 Maschine in 1 h: 360 ÷ 12 = 30 Teile → 5 Maschinen in 6 h: 5 × 6 × 30 = 900.</p>`,
  },
  {
    id: "zinsen", cat: "Mathe", title: "Zinsen, Brutto & Netto",
    keys: ["Zins", "verzinst", "brutto", "netto", "Mehrwertsteuer", "MwSt"],
    html: `
      <h4>Zinsen</h4>
      <table class="ktable">
        <tr><td>Jahreszinsen</td><td>Z = K × p ÷ 100</td></tr>
        <tr><td>über t Jahre (ohne Zinseszins)</td><td>Z = K × p × t ÷ 100</td></tr>
        <tr><td>mit Zinseszins</td><td>K<sub>n</sub> = K × (1 + p/100)<sup>n</sup></td></tr>
      </table>
      <p>Beispiel Zinseszins: 5.000 € mit 2 % → 5.100 € → 5.202 € (Zinsen auf die Zinsen).</p>
      <h4>Mehrwertsteuer</h4>
      <ul>
        <li>Regelsatz 19 %, ermäßigt 7 % (z. B. viele Lebensmittel, Bücher).</li>
        <li>Netto → Brutto: × 1,19</li>
        <li>Brutto → Netto: ÷ 1,19 (<strong>nicht</strong> 19 % abziehen!)</li>
        <li>Enthaltene MwSt: Brutto − Netto. Bei 119 € brutto sind es 19 €.</li>
      </ul>`,
  },
  {
    id: "einheiten", cat: "Mathe", title: "Brüche, Einheiten & Durchschnitt",
    keys: ["Bruch", "/", "Minuten", "Meter", "Gramm", "kg", "Durchschnitt", "GB", "MB", "Fläche", "Radius"],
    html: `
      <h4>Brüche</h4>
      <ul>
        <li>„3/4 von 120“: 120 ÷ 4 × 3 = 90 (erst teilen, dann malnehmen).</li>
        <li>Addieren nur mit gleichem Nenner: 1/4 + 1/2 = 1/4 + 2/4 = 3/4.</li>
        <li>0,5 = 1/2 · 0,25 = 1/4 · 0,75 = 3/4 · 0,2 = 1/5 · 0,125 = 1/8</li>
      </ul>
      <h4>Einheiten</h4>
      <table class="ktable">
        <tr><td>1 km</td><td>1.000 m</td></tr>
        <tr><td>1 kg</td><td>1.000 g</td></tr>
        <tr><td>1 h</td><td>60 min = 3.600 s</td></tr>
        <tr><td>1 GB</td><td>1.000 MB (im Binärsystem 1.024)</td></tr>
      </table>
      <h4>Durchschnitt & Geometrie</h4>
      <ul>
        <li>Durchschnitt = Summe ÷ Anzahl.</li>
        <li>Rechteck: Fläche = a × b, Umfang = 2a + 2b.</li>
        <li>Kreis: Fläche = π × r², Umfang = 2 × π × r (π ≈ 3,14).</li>
        <li>Geschwindigkeit: Weg = Tempo × Zeit. 120 km/h = 2 km pro Minute.</li>
      </ul>`,
  },

  // ============================ LOGIK / FIGUREN ============================
  {
    id: "reihen", cat: "Logik", title: "Zahlenreihen knacken",
    keys: ["Reihe"],
    html: `
      <p>Gehe diese Checkliste der Reihe nach durch:</p>
      <ol>
        <li><strong>Differenzen</strong> aufschreiben: 2, 6, 12, 20 → +4, +6, +8 → nächste +10.</li>
        <li>Bleiben die Differenzen nicht gleich? <strong>Differenzen der Differenzen</strong> bilden.</li>
        <li><strong>Faktoren</strong> prüfen: 3, 6, 12, 24 → × 2. Auch wachsende Faktoren: × 2, × 3, × 4 …</li>
        <li><strong>Abwechselnde Regeln</strong>: +3, −1, +3, −1 …</li>
        <li><strong>Zwei verschränkte Reihen</strong>: jede zweite Zahl einzeln betrachten.</li>
        <li><strong>Kombination</strong>: × 2 + 1 (4, 9, 19, 39 …).</li>
        <li><strong>Bekannte Folgen</strong>: Quadratzahlen 1, 4, 9, 16, 25 · Kubikzahlen 1, 8, 27, 64 · Fibonacci 1, 1, 2, 3, 5, 8 (Summe der beiden vorherigen) · Primzahlen 2, 3, 5, 7, 11, 13.</li>
      </ol>
      <p>Buchstabenreihen: Buchstaben in Zahlen umwandeln (A = 1, B = 2 … Z = 26) und wie Zahlen behandeln.</p>`,
  },
  {
    id: "figuren", cat: "Figuren", title: "Figuren & Matrizen",
    keys: ["Figur", "Feld"],
    html: `
      <p>Prüfe jedes Merkmal <strong>einzeln</strong> – meist ändern sich 1 bis 3 davon:</p>
      <ul>
        <li><strong>Form</strong> – Kreis, Dreieck, Viereck … Steigt die Zahl der Ecken?</li>
        <li><strong>Anzahl</strong> – Punkte, Striche, Elemente: steigt/fällt um wie viel?</li>
        <li><strong>Füllung</strong> – leer, grau, voll. Wechselt sie ab oder im Dreierrhythmus?</li>
        <li><strong>Drehung</strong> – um wie viel Grad, in welche Richtung? 90° = Viertel, 45° = Achtel.</li>
        <li><strong>Position</strong> – wandert ein Element von Ecke zu Ecke?</li>
      </ul>
      <h4>Matrizen (3 × 3)</h4>
      <p>Erst jede <strong>Zeile</strong> ansehen, dann jede <strong>Spalte</strong>. Häufig: pro Zeile eine Form, pro Spalte eine Anzahl – oder jede Form kommt in jeder Zeile genau einmal vor.</p>
      <h4>Ausschlussverfahren</h4>
      <p>Hast du eine Regel gefunden, streiche alle Antworten, die sie verletzen. Oft bleibt nur eine übrig – auch wenn du die zweite Regel noch nicht gesehen hast.</p>`,
  },
  {
    id: "analogien", cat: "Logik", title: "Analogien & Schlussfolgerungen",
    keys: ["verhält sich", "passt nicht", "Alle", "Einige", "folgt"],
    html: `
      <h4>Analogien „A : B wie C : ?“</h4>
      <p>Die Beziehung zwischen A und B benennen, dann auf C übertragen. Typische Beziehungen:</p>
      <ul>
        <li>Teil – Ganzes (Motor : Auto)</li>
        <li>Werkzeug – Tätigkeit (Messer : schneiden)</li>
        <li>Person – Arbeitsort (Arzt : Krankenhaus)</li>
        <li>Gegensatz (heiß : kalt), Steigerung (warm : heiß)</li>
        <li>Einheit – nächstgrößere Einheit (Meter : Kilometer)</li>
      </ul>
      <h4>„Welches Wort passt nicht?“</h4>
      <p>Oberbegriff für die Mehrheit suchen (Werkzeuge, Metalle, Ausgabegeräte …).</p>
      <h4>Schlussfolgerungen</h4>
      <ul>
        <li>„Alle A sind B“ + „x ist A“ → x ist B. ✔</li>
        <li>„Alle A sind B“ heißt NICHT „alle B sind A“.</li>
        <li>„Einige A sind B“ + „alle B sind C“ → einige A sind C. ✔</li>
        <li>„Wenn Regen, dann nass“ + „nicht nass“ → kein Regen. ✔ Aber „nass“ → heißt nicht zwingend Regen.</li>
      </ul>`,
  },

  // ============================ IT ============================
  {
    id: "zahlensysteme", cat: "IT", title: "Bit, Byte & Zahlensysteme",
    keys: ["Binär", "Hexadezimal", "Bit", "Byte", "Kilobyte"],
    html: `
      <p>1 Byte = 8 Bit. Ein Byte kann Werte von 0 bis 255 speichern.</p>
      <h4>Binär → Dezimal</h4>
      <table class="ktable center-cols">
        <tr><td>128</td><td>64</td><td>32</td><td>16</td><td>8</td><td>4</td><td>2</td><td>1</td></tr>
        <tr><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>0</td><td>1</td><td>1</td></tr>
      </table>
      <p>1011 = 8 + 2 + 1 = 11 · 1111 1111 = 255</p>
      <h4>Dezimal → Binär</h4>
      <p>Größte passende Zweierpotenz abziehen: 6 = 4 + 2 → 110.</p>
      <h4>Hexadezimal (Basis 16)</h4>
      <p>0–9, dann A = 10 … F = 15. FF = 15 × 16 + 15 = 255. Ein Hex-Zeichen = 4 Bit.</p>
      <h4>Einheiten</h4>
      <p>kB → MB → GB → TB, jeweils × 1.000 (SI) bzw. × 1.024 (KiB, MiB …). Achtung: Internet-Tempo in <strong>Bit</strong>/s – 50 Mbit/s sind nur 6,25 MB/s.</p>`,
  },
  {
    id: "netzwerk", cat: "IT", title: "Netzwerk-Grundlagen",
    keys: ["IP", "MAC", "DNS", "DHCP", "ARP", "Subnetz", "Gateway", "Router", "Switch", "LAN", "WLAN", "IPv"],
    html: `
      <table class="ktable">
        <tr><td>IP-Adresse</td><td>logische Adresse im Netz (IPv4: 32 Bit, z. B. 192.168.0.10; IPv6: 128 Bit)</td></tr>
        <tr><td>MAC-Adresse</td><td>feste Hardware-Adresse der Netzwerkkarte (48 Bit)</td></tr>
        <tr><td>Subnetzmaske</td><td>trennt Netz- und Host-Teil. /24 = 255.255.255.0 → 254 nutzbare Hosts</td></tr>
        <tr><td>Default Gateway</td><td>Router, an den Pakete für fremde Netze gehen</td></tr>
        <tr><td>DNS</td><td>übersetzt Namen → IP-Adresse („Telefonbuch“)</td></tr>
        <tr><td>DHCP</td><td>verteilt IP-Adressen automatisch („Empfang im Hotel“)</td></tr>
        <tr><td>ARP</td><td>findet zur IP-Adresse die MAC-Adresse</td></tr>
      </table>
      <h4>Private IPv4-Bereiche</h4>
      <p>10.0.0.0/8 · 172.16.0.0 – 172.31.255.255 · 192.168.0.0/16</p>
      <h4>Hosts pro Netz</h4>
      <p>2<sup>(32 − Präfix)</sup> − 2 (Netzadresse und Broadcast abziehen): /24 → 254, /25 → 126, /30 → 2.</p>`,
  },
  {
    id: "osi", cat: "IT", title: "OSI-Modell, Geräte & Protokolle",
    keys: ["OSI", "Schicht", "TCP", "UDP", "Hub", "Switch", "Router", "Access Point"],
    html: `
      <table class="ktable">
        <tr><th>Nr.</th><th>Schicht</th><th>Beispiele</th></tr>
        <tr><td>7</td><td>Anwendung</td><td>HTTP, DNS, SMTP</td></tr>
        <tr><td>6</td><td>Darstellung</td><td>Verschlüsselung, Kodierung</td></tr>
        <tr><td>5</td><td>Sitzung</td><td>Verbindungssteuerung</td></tr>
        <tr><td>4</td><td>Transport</td><td>TCP, UDP, Ports</td></tr>
        <tr><td>3</td><td>Vermittlung</td><td>IP, Router</td></tr>
        <tr><td>2</td><td>Sicherung</td><td>MAC, Switch</td></tr>
        <tr><td>1</td><td>Bitübertragung</td><td>Kabel, Hub, Funk</td></tr>
      </table>
      <p>Eselsbrücke von unten: „<strong>P</strong>lease <strong>D</strong>o <strong>N</strong>ot <strong>T</strong>hrow <strong>S</strong>ausage <strong>P</strong>izza <strong>A</strong>way“ (Physical, Data Link, Network, Transport, Session, Presentation, Application).</p>
      <h4>TCP oder UDP?</h4>
      <p>TCP: verbindungsorientiert, zuverlässig (Webseiten, E-Mail). UDP: verbindungslos, schnell, ohne Garantie (Streaming, Telefonie, DNS-Anfragen).</p>
      <h4>Geräte</h4>
      <p>Hub schickt an alle Ports · Switch gezielt nach MAC-Adresse · Router verbindet verschiedene Netze · Access Point bringt Geräte per WLAN ins Netz.</p>`,
  },
  {
    id: "ports", cat: "IT", title: "Wichtige Ports",
    keys: ["Port", "HTTPS", "SSH", "FTP", "SMTP"],
    html: `
      <table class="ktable">
        <tr><td>20/21</td><td>FTP (Dateiübertragung)</td></tr>
        <tr><td>22</td><td>SSH (sichere Fernwartung, SFTP)</td></tr>
        <tr><td>23</td><td>Telnet (unverschlüsselt, veraltet)</td></tr>
        <tr><td>25</td><td>SMTP (E-Mail versenden)</td></tr>
        <tr><td>53</td><td>DNS</td></tr>
        <tr><td>67/68</td><td>DHCP</td></tr>
        <tr><td>80</td><td>HTTP</td></tr>
        <tr><td>110</td><td>POP3 (E-Mail abrufen)</td></tr>
        <tr><td>143</td><td>IMAP (E-Mail abrufen)</td></tr>
        <tr><td>443</td><td>HTTPS</td></tr>
        <tr><td>3389</td><td>RDP (Windows-Remotedesktop)</td></tr>
      </table>
      <p>Merkhilfe: „22 = SSH, zwei S wie zwei Zweien“, „443 = HTTPS, das S für sicher“.</p>`,
  },
  {
    id: "sicherheit", cat: "IT", title: "IT-Sicherheit",
    keys: ["Phishing", "Malware", "Ransomware", "Virus", "Passwort", "Faktor", "Backup", "Verschlüssel", "VPN", "Firewall", "Social", "DMZ"],
    html: `
      <table class="ktable">
        <tr><td>Phishing</td><td>gefälschte Mails/Seiten, um Zugangsdaten abzugreifen</td></tr>
        <tr><td>Social Engineering</td><td>Manipulation von Menschen (falscher „Support“ am Telefon)</td></tr>
        <tr><td>Malware</td><td>Oberbegriff für Schadsoftware: Viren, Würmer, Trojaner</td></tr>
        <tr><td>Ransomware</td><td>verschlüsselt Daten und fordert Lösegeld</td></tr>
        <tr><td>Firewall</td><td>filtert Netzwerkverkehr nach Regeln</td></tr>
        <tr><td>VPN</td><td>verschlüsselter Tunnel, z. B. ins Firmennetz</td></tr>
        <tr><td>DMZ</td><td>abgetrennter Netzbereich für öffentlich erreichbare Server</td></tr>
      </table>
      <h4>Schutzmaßnahmen</h4>
      <ul>
        <li><strong>Zwei-Faktor-Authentifizierung:</strong> zwei verschiedene Faktoren – Wissen (Passwort), Besitz (Handy), Merkmal (Fingerabdruck).</li>
        <li><strong>Passwörter:</strong> lang, zufällig, einzigartig pro Dienst → Passwortmanager.</li>
        <li><strong>3-2-1-Backup:</strong> 3 Kopien, 2 verschiedene Medien, 1 außer Haus.</li>
        <li><strong>Updates</strong> zeitnah einspielen, Links in Mails vor dem Klicken prüfen.</li>
      </ul>`,
  },
  {
    id: "hardware", cat: "IT", title: "Hardware & Software",
    keys: ["CPU", "RAM", "SSD", "HDD", "Mainboard", "Betriebssystem", "Ausgabegerät", "Eingabegerät", "HDMI", "RJ45", "USB", "Open Source", "Cloud", "Virtualisierung", "Hypervisor", "Server"],
    html: `
      <table class="ktable">
        <tr><td>CPU</td><td>Prozessor, führt Berechnungen aus</td></tr>
        <tr><td>RAM</td><td>Arbeitsspeicher, flüchtig (ohne Strom leer)</td></tr>
        <tr><td>SSD / HDD</td><td>dauerhafter Speicher; SSD schnell ohne bewegliche Teile</td></tr>
        <tr><td>Mainboard</td><td>Hauptplatine, verbindet alle Komponenten</td></tr>
        <tr><td>GPU</td><td>Grafikkarte</td></tr>
        <tr><td>Netzteil</td><td>versorgt alles mit Strom</td></tr>
      </table>
      <p><strong>Eingabe:</strong> Tastatur, Maus, Mikrofon, Scanner · <strong>Ausgabe:</strong> Monitor, Drucker, Lautsprecher</p>
      <p><strong>Anschlüsse:</strong> HDMI (Bild + Ton digital), RJ45 (LAN), RJ11 (Telefon), USB-C</p>
      <h4>Begriffe</h4>
      <ul>
        <li>Betriebssystem: Windows, Linux, macOS – verwaltet Hardware und Programme.</li>
        <li>Open Source: Quellcode offen (Linux, Firefox).</li>
        <li>Cloud: Speicher/Rechenleistung übers Internet.</li>
        <li>Virtualisierung: mehrere virtuelle Maschinen auf einem Server (Hypervisor).</li>
        <li>Client–Server: Server stellt Dienste bereit, Clients nutzen sie.</li>
      </ul>`,
  },

  // ============================ BWL ============================
  {
    id: "kosten", cat: "BWL", title: "Umsatz, Kosten & Gewinn",
    keys: ["Umsatz", "Gewinn", "Kosten", "Deckungsbeitrag", "Break-even", "Rendite", "Eigenkapital", "Bilanz", "Aktiva"],
    html: `
      <table class="ktable">
        <tr><td>Umsatz</td><td>Menge × Verkaufspreis</td></tr>
        <tr><td>Gewinn</td><td>Umsatz − Kosten</td></tr>
        <tr><td>Fixkosten</td><td>unabhängig von der Menge (Miete, Gehälter)</td></tr>
        <tr><td>Variable Kosten</td><td>steigen mit der Menge (Material)</td></tr>
        <tr><td>Deckungsbeitrag/Stück</td><td>Preis − variable Kosten</td></tr>
        <tr><td>Break-even-Menge</td><td>Fixkosten ÷ Deckungsbeitrag pro Stück</td></tr>
        <tr><td>Umsatzrendite</td><td>Gewinn ÷ Umsatz × 100</td></tr>
        <tr><td>Eigenkapitalquote</td><td>Eigenkapital ÷ Gesamtkapital × 100</td></tr>
      </table>
      <h4>Bilanz</h4>
      <p><strong>Aktiva</strong> = Vermögen (was ist da? Gebäude, Maschinen, Bank). <strong>Passiva</strong> = Kapital (woher kommt es? Eigen- und Fremdkapital). Beide Seiten sind immer gleich groß.</p>
      <h4>Weitere Begriffe</h4>
      <p>Liquidität = Zahlungsfähigkeit · Investition = Geld langfristig in Anlagen binden · Inventur = Bestandsaufnahme · Skonto = Nachlass für schnelle Zahlung · Rabatt = Preisnachlass</p>`,
  },
  {
    id: "rechtsformen", cat: "BWL", title: "Rechtsformen & Unternehmen",
    keys: ["GmbH", "AG", "Aktien", "Rechtsform", "Prokura", "Vorstand", "Aufsichtsrat", "Dividende", "Fusion"],
    html: `
      <table class="ktable">
        <tr><th>Form</th><th>Haftung</th><th>Kapital</th></tr>
        <tr><td>e. K. (Einzelkaufmann)</td><td>unbeschränkt, privat</td><td>–</td></tr>
        <tr><td>GbR / OHG</td><td>Gesellschafter voll</td><td>–</td></tr>
        <tr><td>KG</td><td>Komplementär voll, Kommanditist mit Einlage</td><td>–</td></tr>
        <tr><td>GmbH</td><td>nur Gesellschaftsvermögen</td><td>mind. 25.000 € Stammkapital</td></tr>
        <tr><td>AG</td><td>nur Gesellschaftsvermögen</td><td>mind. 50.000 € Grundkapital</td></tr>
      </table>
      <h4>Organe der AG</h4>
      <p><strong>Vorstand</strong> leitet · <strong>Aufsichtsrat</strong> kontrolliert · <strong>Hauptversammlung</strong> (Aktionäre) entscheidet Grundsätzliches, z. B. über die Dividende. Die Deutsche Telekom ist eine AG.</p>
      <h4>Vollmachten</h4>
      <p><strong>Prokura</strong>: fast alle Geschäfte (Unterschrift „ppa.“). <strong>Handlungsvollmacht</strong>: nur gewöhnliche Geschäfte („i. V.“ bzw. „i. A.“).</p>
      <p>B2B = Geschäft zwischen Unternehmen, B2C = mit Privatkunden.</p>`,
  },
  {
    id: "arbeitsrecht", cat: "BWL", title: "Ausbildung & Arbeitsrecht",
    keys: ["Probezeit", "Ausbild", "Azubi", "Urlaub", "Kündigung", "Betriebsrat", "JAV", "Tarif", "Gewerkschaft", "Sozialversicherung", "Gewährleistung", "Garantie", "Mindestlohn", "Arbeitszeugnis"],
    html: `
      <h4>Berufsbildungsgesetz (BBiG)</h4>
      <ul>
        <li>Probezeit: mindestens 1, höchstens 4 Monate. In der Probezeit können beide Seiten jederzeit ohne Frist kündigen.</li>
        <li>Nach der Probezeit: Der Betrieb kann nur aus wichtigem Grund kündigen. Azubis können mit 4 Wochen Frist kündigen, wenn sie die Ausbildung aufgeben oder etwas anderes lernen wollen.</li>
        <li>Pflichten Azubi: lernen, Berufsschule besuchen, Ausbildungsnachweis (Berichtsheft) führen.</li>
        <li>Pflichten Betrieb: ausbilden, Vergütung zahlen, Arbeitsmittel kostenlos stellen, für die Berufsschule freistellen.</li>
      </ul>
      <h4>Urlaub</h4>
      <p>Gesetzlich mindestens 24 Werktage (bei 6-Tage-Woche) = 20 Arbeitstage bei 5-Tage-Woche. Für Jugendliche unter 18 gilt nach dem Jugendarbeitsschutzgesetz mehr. Tarifverträge geben oft mehr.</p>
      <h4>Mitbestimmung</h4>
      <p>Betriebsrat vertritt die Beschäftigten · JAV vertritt Jugendliche und Azubis · Gewerkschaft (bei der Telekom u. a. ver.di) verhandelt Tarifverträge.</p>
      <h4>Sozialversicherung – 5 Säulen</h4>
      <p>Kranken-, Pflege-, Renten-, Arbeitslosen- und Unfallversicherung.</p>
      <h4>Kaufrecht</h4>
      <p>Gewährleistung: gesetzlich, 2 Jahre bei Neuware, gegenüber dem Verkäufer. Garantie: freiwillig, meist vom Hersteller.</p>`,
  },
  {
    id: "wirtschaft", cat: "BWL", title: "Wirtschaft allgemein",
    keys: ["Inflation", "Deflation", "Angebot", "Nachfrage", "BIP", "Import", "Export", "Monopol", "Marketing", "Zielgruppe", "Leasing", "Outsourcing"],
    html: `
      <table class="ktable">
        <tr><td>Angebot & Nachfrage</td><td>Steigt die Nachfrage bei gleichem Angebot, steigt meist der Preis.</td></tr>
        <tr><td>Inflation</td><td>Preise steigen, Kaufkraft sinkt</td></tr>
        <tr><td>Deflation</td><td>Preise sinken allgemein</td></tr>
        <tr><td>BIP</td><td>Wert aller Waren und Dienstleistungen eines Landes in einem Jahr</td></tr>
        <tr><td>Import / Export</td><td>Einfuhr / Ausfuhr</td></tr>
        <tr><td>Monopol</td><td>ein Anbieter (Oligopol: wenige, Polypol: viele)</td></tr>
        <tr><td>Leasing</td><td>Nutzung gegen Rate, Eigentum bleibt beim Leasinggeber</td></tr>
        <tr><td>Outsourcing</td><td>Aufgaben an externe Firmen auslagern</td></tr>
        <tr><td>Just-in-time</td><td>Lieferung genau dann, wenn benötigt</td></tr>
      </table>
      <p><strong>Marketing-Mix (4 P):</strong> Product, Price, Place (Vertrieb), Promotion (Werbung).</p>`,
  },

  // ============================ DEUTSCH ============================
  {
    id: "rechtschreibung", cat: "Deutsch", title: "Häufige Rechtschreibfallen",
    keys: ["geschrieben", "dass", "seit", "seid", "wider", "wieder"],
    html: `
      <h4>das oder dass?</h4>
      <p>Lässt sich „dieses“, „jenes“ oder „welches“ einsetzen → <strong>das</strong>. Sonst → <strong>dass</strong> (Konjunktion, leitet Nebensatz ein).</p>
      <h4>seit oder seid?</h4>
      <p><strong>seit</strong> = Zeit (seit gestern) · <strong>seid</strong> = Verb sein (ihr seid).</p>
      <h4>wieder oder wider?</h4>
      <p><strong>wieder</strong> = noch einmal · <strong>wider</strong> = gegen (Widerspruch, widerlegen).</p>
      <h4>Oft falsch geschrieben</h4>
      <table class="ktable">
        <tr><td>✔ Standard</td><td>✘ Standart</td></tr>
        <tr><td>✔ Entgelt</td><td>✘ Entgeld</td></tr>
        <tr><td>✔ Voraussetzung</td><td>✘ Vorraussetzung</td></tr>
        <tr><td>✔ nämlich</td><td>✘ nähmlich</td></tr>
        <tr><td>✔ Maschine</td><td>✘ Maschiene</td></tr>
        <tr><td>✔ Reparatur</td><td>✘ Reperatur</td></tr>
        <tr><td>✔ Rhythmus</td><td>✘ Rythmus</td></tr>
        <tr><td>✔ Adresse</td><td>✘ Addresse</td></tr>
        <tr><td>✔ Karriere</td><td>✘ Kariere</td></tr>
        <tr><td>✔ Satellit</td><td>✘ Sattelit</td></tr>
      </table>`,
  },
  {
    id: "komma", cat: "Deutsch", title: "Kommaregeln",
    keys: ["Komma", "gesetzt", "Satz"],
    html: `
      <ul>
        <li><strong>Nebensätze</strong> werden abgetrennt: …, dass / weil / wenn / obwohl / als …</li>
        <li><strong>Relativsätze</strong> vorne UND hinten: Der Techniker, der gestern da war, kommt heute wieder.</li>
        <li><strong>Infinitivgruppen</strong> mit um … zu, ohne … zu, (an)statt … zu, außer … zu, als … zu: Komma. (Anstatt zu warten, rief er an.)</li>
        <li><strong>Aufzählungen</strong>: Komma zwischen den Gliedern – aber nicht vor „und“/„oder“.</li>
        <li><strong>Einschübe und Zusätze</strong> werden abgetrennt: Herr Schulz, unser Ausbilder, …</li>
        <li><strong>Vor „aber“, „sondern“, „doch“</strong> steht ein Komma.</li>
      </ul>`,
  },
  {
    id: "grammatik", cat: "Deutsch", title: "Grammatik & Großschreibung",
    keys: ["Fall", "objekt", "Subjekt", "Konjunktiv", "Passiv", "Mehrzahl", "Nomen", "Verb", "großgeschrieben", "Ergänze", "wegen", "dessen"],
    html: `
      <h4>Die vier Fälle</h4>
      <table class="ktable">
        <tr><td>Nominativ</td><td>Wer oder was?</td><td>der Kunde</td></tr>
        <tr><td>Genitiv</td><td>Wessen?</td><td>des Kunden</td></tr>
        <tr><td>Dativ</td><td>Wem?</td><td>dem Kunden</td></tr>
        <tr><td>Akkusativ</td><td>Wen oder was?</td><td>den Kunden</td></tr>
      </table>
      <p>helfen + Dativ (der Kollegin) · warten auf + Akkusativ (auf den Techniker) · wegen + Genitiv (wegen des Wetters)</p>
      <h4>Großschreibung</h4>
      <p>Verben/Adjektive werden zu Nomen nach Artikel oder „beim, zum, alles, etwas, nichts“: beim Lesen, alles Gute, etwas Neues.</p>
      <h4>Weitere Klassiker</h4>
      <ul>
        <li>größer <strong>als</strong> (Unterschied) · so groß <strong>wie</strong> (Gleichheit)</li>
        <li>dessen (männlich/sächlich) · deren (weiblich/Mehrzahl): das Gerät, dessen Akku …</li>
        <li>Konjunktiv I für indirekte Rede (er sagt, er sei krank), Konjunktiv II für Unwirkliches (wenn ich Zeit hätte, würde ich …)</li>
        <li>Passiv: werden + Partizip II (Der Router wird repariert.)</li>
      </ul>`,
  },

  // ============================ ENGLISCH ============================
  {
    id: "falsefriends", cat: "Englisch", title: "False Friends",
    keys: ["mean", "False Friend", "What does"],
    html: `
      <table class="ktable">
        <tr><th>Englisch</th><th>heißt</th><th>nicht</th></tr>
        <tr><td>become</td><td>werden</td><td>bekommen (= get)</td></tr>
        <tr><td>gift</td><td>Geschenk</td><td>Gift (= poison)</td></tr>
        <tr><td>chef</td><td>Koch</td><td>Chef (= boss)</td></tr>
        <tr><td>handy</td><td>praktisch</td><td>Handy (= mobile phone)</td></tr>
        <tr><td>actual</td><td>tatsächlich</td><td>aktuell (= current)</td></tr>
        <tr><td>eventually</td><td>schließlich</td><td>eventuell (= possibly)</td></tr>
        <tr><td>sensible</td><td>vernünftig</td><td>sensibel (= sensitive)</td></tr>
        <tr><td>map</td><td>Landkarte</td><td>Mappe (= folder)</td></tr>
        <tr><td>also</td><td>auch</td><td>also (= so)</td></tr>
        <tr><td>must not</td><td>darf nicht</td><td>muss nicht (= don't have to)</td></tr>
        <tr><td>control</td><td>steuern, beherrschen</td><td>kontrollieren (= check)</td></tr>
        <tr><td>meaning</td><td>Bedeutung</td><td>Meinung (= opinion)</td></tr>
      </table>`,
  },
  {
    id: "zeiten", cat: "Englisch", title: "Zeiten & Signalwörter",
    keys: ["Complete", "yesterday", "since", "for", "past", "tense", "already"],
    html: `
      <table class="ktable">
        <tr><th>Zeit</th><th>Form</th><th>Signalwörter</th></tr>
        <tr><td>Simple Present</td><td>he works</td><td>every day, usually, often</td></tr>
        <tr><td>Present Progressive</td><td>he is working</td><td>now, at the moment</td></tr>
        <tr><td>Simple Past</td><td>he worked</td><td>yesterday, last week, ago</td></tr>
        <tr><td>Present Perfect</td><td>he has worked</td><td>already, yet, ever, since, for</td></tr>
        <tr><td>Past Perfect</td><td>he had worked</td><td>before, by the time</td></tr>
        <tr><td>will-Future</td><td>he will work</td><td>tomorrow, next week</td></tr>
      </table>
      <ul>
        <li><strong>since</strong> + Zeitpunkt (since 2023) · <strong>for</strong> + Zeitspanne (for three years)</li>
        <li>Abgeschlossene Zeitangabe (yesterday) → Simple Past, nie Present Perfect.</li>
        <li>3. Person Singular: he/she/it + s (she works, he doesn't work).</li>
        <li>Unregelmäßige Verben: go – went – gone · buy – bought – bought · bring – brought – brought</li>
      </ul>`,
  },
  {
    id: "ifsaetze", cat: "Englisch", title: "If-Sätze & Grammatik",
    keys: ["If", "would", "used to", "looking forward", "than", "much", "many"],
    html: `
      <table class="ktable">
        <tr><th>Typ</th><th>if-Teil</th><th>Hauptsatz</th></tr>
        <tr><td>1 (real)</td><td>Simple Present</td><td>will + Infinitiv</td></tr>
        <tr><td>2 (unwahrscheinlich)</td><td>Simple Past</td><td>would + Infinitiv</td></tr>
        <tr><td>3 (vorbei)</td><td>Past Perfect</td><td>would have + Partizip</td></tr>
      </table>
      <p>Merke: <strong>kein „will“/„would“ im if-Teil!</strong></p>
      <ul>
        <li>Steigerung: fast – faster – fastest · good – better – best · expensive – more expensive</li>
        <li>much (nicht zählbar: much money) · many (zählbar: many people)</li>
        <li>look forward to <strong>+ -ing</strong> (I look forward to hearing from you)</li>
        <li>be used to + -ing (gewohnt sein) · used to + Infinitiv (früher immer)</li>
        <li>Nach can/could/will/would: Infinitiv ohne „to“</li>
        <li>neither … nor = weder … noch · either … or = entweder … oder</li>
      </ul>`,
  },
  {
    id: "business", cat: "Englisch", title: "Business English",
    keys: ["English word", "application", "invoice", "employee", "appointment", "polite", "warranty"],
    html: `
      <table class="ktable">
        <tr><td>application</td><td>Bewerbung</td></tr>
        <tr><td>apprenticeship / apprentice</td><td>Ausbildung / Azubi</td></tr>
        <tr><td>vocational school</td><td>Berufsschule</td></tr>
        <tr><td>employee / employer</td><td>Arbeitnehmer / Arbeitgeber</td></tr>
        <tr><td>appointment</td><td>Termin</td></tr>
        <tr><td>deadline</td><td>Frist</td></tr>
        <tr><td>invoice / bill</td><td>Rechnung</td></tr>
        <tr><td>warranty</td><td>Garantie</td></tr>
        <tr><td>issue</td><td>Problem, Anliegen</td></tr>
        <tr><td>to be in charge of</td><td>verantwortlich sein für</td></tr>
        <tr><td>to cancel / to postpone</td><td>absagen / verschieben</td></tr>
        <tr><td>resignation</td><td>Kündigung (durch Arbeitnehmer)</td></tr>
      </table>
      <p><strong>Höflich bitten:</strong> Could you please …? · Would you mind …? · I would like to …<br><strong>Mail-Schluss:</strong> Kind regards / Best regards</p>`,
  },

  // ============================ DIAGRAMME & TEXTE ============================
  {
    id: "diagramme", cat: "Diagramme", title: "Diagramme & Tabellen lesen",
    keys: ["Diagramm", "Monat", "Quartal", "Anteil", "Fälle", "Durchschnitt"],
    html: `
      <ol>
        <li><strong>Erst die Überschrift und Achsen lesen:</strong> Was wird gezählt, in welcher Einheit („in Hundert“, „Stück“, „%“)?</li>
        <li><strong>Frage genau lesen:</strong> Einzelwert, Differenz, Summe, Durchschnitt oder Prozent?</li>
        <li><strong>Werte notieren</strong>, bevor du rechnest – nicht im Kopf zwischen Diagramm und Antworten springen.</li>
      </ol>
      <h4>Die wichtigsten Rechnungen</h4>
      <table class="ktable">
        <tr><td>Differenz</td><td>neuer Wert − alter Wert (Vorzeichen beachten)</td></tr>
        <tr><td>Veränderung in %</td><td>Differenz ÷ ALTER Wert × 100</td></tr>
        <tr><td>Durchschnitt</td><td>Summe ÷ Anzahl</td></tr>
        <tr><td>Anteil in %</td><td>Teil ÷ Summe × 100</td></tr>
        <tr><td>Anzahl aus %</td><td>Gesamtzahl × Prozent ÷ 100</td></tr>
      </table>
      <p><strong>Prozent vs. Prozentpunkte:</strong> Von 20 % auf 30 % sind es 10 Prozent<em>punkte</em> – aber ein Anstieg um 50 %.</p>
      <p><strong>Ablesen:</strong> Hilfslinien nutzen. Liegt ein Balken zwischen zwei beschrifteten Linien, ist er meist genau in der Mitte.</p>`,
  },
  {
    id: "textverstaendnis", cat: "Textverständnis", title: "Textverständnis",
    keys: ["Text", "laut", "Aussage"],
    html: `
      <ol>
        <li><strong>Erst die Fragen überfliegen</strong>, dann den Text lesen – so weißt du, worauf du achten musst.</li>
        <li><strong>Nur was im Text steht zählt</strong> – nicht dein Vorwissen. „Klingt richtig“ reicht nicht.</li>
        <li><strong>Auf Signalwörter achten:</strong> „nur“, „alle“, „immer“, „nie“, „mindestens“, „nicht“ – eine Antwort mit einem Wort zu viel oder zu wenig ist oft der Ablenker.</li>
        <li><strong>Zahlen und Namen</strong> genau abgleichen – Ablenker vertauschen gern Jahreszahlen, Prozente oder Reihenfolgen.</li>
        <li><strong>„Welche Aussage steht NICHT im Text?“</strong> – jede Antwort einzeln im Text suchen und abhaken.</li>
      </ol>
      <p>Hauptaussage finden: Was würde als Überschrift passen? Worum geht es in einem Satz?</p>`,
  },

  // ============================ KONZENTRATION & MERKEN ============================
  {
    id: "konzentration", cat: "Konzentration", title: "Konzentrationsaufgaben",
    keys: ["zähl", "identisch", "Rechne", "Wie oft", "Wie viele"],
    html: `
      <ul>
        <li><strong>In Gruppen zählen:</strong> Zeichen in 3er- oder 4er-Blöcke teilen, Zwischensummen merken.</li>
        <li><strong>Mit dem Finger</strong> (oder Cursor) Zeichen für Zeichen mitgehen – nicht nur mit den Augen.</li>
        <li><strong>Verwechsler kennen:</strong> b/d/p/q, 0/O, 1/I/l, 5/S, 8/B, 2/Z, 6/G.</li>
        <li><strong>Vergleichen:</strong> Blockweise von links nach rechts, vertauschte Nachbarn sind der häufigste Fehler.</li>
        <li><strong>Kopfrechnen:</strong> zerlegen (17 × 4 = 10 × 4 + 7 × 4), runden und korrigieren (48 − 19 = 48 − 20 + 1), Punkt vor Strich!</li>
        <li><strong>Grenzen genau lesen:</strong> „größer als 50“ schließt die 50 aus.</li>
        <li>Tempo kommt mit Übung – anfangs lieber genau als schnell.</li>
      </ul>`,
  },
  {
    id: "merken", cat: "Merkfähigkeit", title: "Merktechniken",
    keys: ["Merk", "Stelle", "Reihenfolge"],
    html: `
      <ul>
        <li><strong>Chunking:</strong> Zeichen bündeln. 58-4471-K → „58 / 44 / 71 / K“. Telefonnummern merkt man genauso.</li>
        <li><strong>Geschichte bauen:</strong> Apfel, Schlüssel, Wolke, Tasse → „Ein Apfel schließt mit dem Schlüssel die Wolke auf, aus der Tee in eine Tasse regnet.“ Absurde Bilder bleiben besser hängen.</li>
        <li><strong>Loci-Methode:</strong> Begriffe gedanklich an Orten ablegen, z. B. in deiner Werkstatt: Tor, Hebebühne, Werkbank …</li>
        <li><strong>Zuordnungen</strong> (Name – Raum – Tag): je Zeile ein Bild machen („Schmidt schmiedet am Mittwoch in Hamburg“).</li>
        <li><strong>Leise wiederholen</strong>, solange das Merkblatt sichtbar ist – und die Reihenfolge bewusst mitlernen.</li>
        <li>Bei Adressen/IPs: nur das merken, was sich unterscheidet (letzte Stelle).</li>
      </ul>`,
  },

  // ============================ TAKTIK ============================
  {
    id: "taktik", cat: "Test-Taktik", title: "Taktik für den Online-Test",
    keys: [],
    html: `
      <h4>Was über den Telekom-Test bekannt ist</h4>
      <p class="small muted">Aus Angaben des Testherstellers (CYQUEST), Ratgeberseiten und Erfahrungsberichten – der genaue Inhalt hängt vom Beruf ab und kann sich ändern.</p>
      <ul>
        <li><strong>Dauer:</strong> etwa 90 Minuten einplanen, eventuell länger. Zwischen den Testbausteinen sind kurze Pausen möglich.</li>
        <li><strong>Bausteine:</strong> mehrere kognitive Tests (je nach Beruf), ein Persönlichkeitstest, ein Interessenstest und ein Situational Judgement Test.</li>
        <li><strong>Für alle:</strong> Rechentextaufgaben und Diagrammanalyse. Dazu je nach Beruf Logik, Sprache, Merkfähigkeit, Konzentration, Englisch, IT- oder BWL-Wissen.</li>
        <li><strong>SJT:</strong> Situationen aus dem Arbeitsalltag, 8 Zustimmungspunkte auf 4 Reaktionen verteilen.</li>
        <li><strong>Zeitlimit je Block:</strong> Laut Berichten kein Pausieren innerhalb eines Blocks und kein Zurückspringen zu vorherigen Fragen. Seiten können automatisch weiterblättern.</li>
        <li><strong>Probefragen:</strong> Vor den Bausteinen gibt es Erklärungen und Beispielaufgaben – nutze sie, um das Format zu verstehen.</li>
        <li><strong>Ergebnis:</strong> Es gibt eine Rückmeldung mit Passung zum Wunschberuf und Vorschlägen für Alternativen. Im Best Fit Interview wird das Ergebnis besprochen.</li>
      </ul>
      <h4>Vorher</h4>
      <ul>
        <li>Ruhiger Raum, stabiles Internet, Handy stumm, Akku/Netzteil bereit.</li>
        <li>Schreibpapier und Stift für Nebenrechnungen – ob ein Taschenrechner erlaubt ist, steht in der Anleitung.</li>
        <li>Ausgeschlafen und nicht hungrig starten.</li>
        <li>Anleitungen und Beispielaufgaben genau lesen – sie zählen meist nicht zur Zeit.</li>
      </ul>
      <h4>Während des Tests</h4>
      <ul>
        <li><strong>Nicht festbeißen:</strong> Nach ca. 1 Minute ohne Idee eine Antwort wählen und weiter – zurückspringen geht meist nicht.</li>
        <li><strong>Nicht in der Bahn oder nebenbei:</strong> Ein Bewerber berichtete, dass er den Test unterwegs gemacht und dadurch Punkte verschenkt hat.</li>
        <li><strong>Ausschlussverfahren:</strong> Offensichtlich falsche Antworten streichen, dann zwischen den übrigen wählen.</li>
        <li><strong>Raten:</strong> Wenn es keine Minuspunkte gibt, lieber raten als leer lassen.</li>
        <li><strong>Plausibilität:</strong> Kann das Ergebnis stimmen? (Mehr Arbeiter → weniger Zeit.)</li>
        <li><strong>Zeit im Blick:</strong> Pro Abschnitt kurz überschlagen, wie viel Zeit pro Aufgabe bleibt.</li>
      </ul>
      <h4>Persönlichkeitsteil</h4>
      <p>Ehrlich und einheitlich antworten – umgekehrt formulierte Aussagen genau lesen.</p>`,
  },
];

// Passende Karte zu einer Frage finden
export function cardForQuestion(q) {
  const candidates = CARDS.filter(c => c.cat === q.cat || (q.cat === "Figuren" && c.id === "figuren"));
  if (!candidates.length) return null;
  const text = `${q.q} ${q.explain}`.toLowerCase();
  let best = candidates[0], bestScore = 0;
  for (const c of candidates) {
    const score = c.keys.reduce((s, k) => s + (text.includes(k.toLowerCase()) ? 1 : 0), 0);
    if (score > bestScore) { best = c; bestScore = score; }
  }
  return best;
}
