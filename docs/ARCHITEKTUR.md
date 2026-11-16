# Architektur

Dieses Dokument erklärt, wie die App aufgebaut ist und wo man was ändert.

## Schichten

```
┌──────────────────────────────────────────────┐
│ app/        Routing, Layout, Tab-Leiste      │
├──────────────────────────────────────────────┤
│ features/   Seiten und Formulare je Bereich  │  ← nutzt ui/, data/, domain/
├──────────────────────────────────────────────┤
│ ui/         Neutrale Bausteine (kein Fachwissen)
├──────────────────────────────────────────────┤
│ data/       Datenbank, Repositories, Hooks   │  ← nutzt domain/
├──────────────────────────────────────────────┤
│ domain/     Typen + Rechenlogik (rein)       │  ← hängt von nichts ab
└──────────────────────────────────────────────┘
```

Regeln:

- **`domain/`** enthält nur reine Funktionen: keine React-Importe, kein Datenbankzugriff,
  kein `Date.now()` – die aktuelle Zeit wird als Parameter `now` übergeben. Dadurch ist
  diese Schicht vollständig und ohne Tricks testbar.
- **`data/`** ist die einzige Schicht, die mit der Datenbank spricht.
  - _Repositories_ (`entryRepository.ts`, `projectRepository.ts` …) schreiben Daten und
    prüfen dabei die Regeln aus `domain/`.
  - _Hooks_ (`hooks.ts`) lesen Daten und aktualisieren sich automatisch bei Änderungen.
- **`ui/`** kennt keine Projekte oder Einträge (Ausnahme: `ColorDot` kennt Projektfarben).
- **`features/`** verbindet alles. Ein Bereich darf öffentliche Komponenten eines anderen
  nutzen (z. B. öffnet der Timer das Formular aus `entries/`).

## Datenfluss

```
Tipp auf Projekt
  → TimerPage ruft toggleTimer(projectId)            (data/entryRepository.ts)
  → Transaktion: laufenden Eintrag beenden, neuen anlegen
  → Dexie meldet die Änderung
  → useRunningEntry / useEntriesInRange liefern neue Werte (data/hooks.ts)
  → React zeichnet die Seite neu
```

Es gibt keinen zusätzlichen globalen Zustand (kein Redux o. Ä.). Die Datenbank ist die
einzige Quelle der Wahrheit; Komponenten halten nur Formular- und Anzeigezustand.

## Datenmodell

Definiert in `src/domain/types.ts`, gespeichert in IndexedDB (`src/data/db.ts`).

**Project**

| Feld        | Typ     | Bedeutung                              |
| ----------- | ------- | -------------------------------------- |
| `id`        | string  | UUID                                   |
| `name`      | string  | eindeutig (ohne Groß-/Kleinschreibung) |
| `color`     | string  | Name aus `projectColors.ts`            |
| `archived`  | boolean | archiviert = nicht mehr im Timer       |
| `createdAt` | number  | Zeitstempel (ms)                       |

**TimeEntry**

| Feld        | Typ            | Bedeutung                  |
| ----------- | -------------- | -------------------------- |
| `id`        | string         | UUID                       |
| `projectId` | string         | Verweis auf ein Projekt    |
| `start`     | number         | Beginn (ms seit 1970, UTC) |
| `end`       | number \| null | Ende; `null` = Timer läuft |
| `note`      | string         | Notiz, leer wenn keine     |

**settings**: Schlüssel-Wert-Tabelle, derzeit nur `lastBackupAt`.

### Feste Regeln (Invarianten)

1. **Höchstens ein laufender Timer.** Starten stoppt den laufenden in derselben Transaktion
   (`startTimer`). Ein beendeter Eintrag kann nicht wieder „laufend“ werden.
2. **Dauern werden nie gespeichert**, sondern immer aus `start` und `end` berechnet.
3. **Keine Überschneidungen innerhalb eines Projekts**; Ende muss nach Beginn liegen;
   keine Zeiten in der Zukunft (`domain/entries.ts → validateEntry`).
4. **Projekte mit Zeiten werden nicht gelöscht**, nur archiviert. Löschen ist nur für
   Projekte ohne Einträge möglich (z. B. nach einem Tippfehler).
5. **Archivieren stoppt** einen laufenden Timer dieses Projekts.

## Zeit und Rechnen

- Alle Zeitpunkte sind Millisekunden (wie `Date.now()`); Kalenderlogik (Tag, Woche, Monat)
  rechnet in der Zeitzone des Geräts und berücksichtigt Sommer-/Winterzeit
  (`domain/dateRange.ts`). Die Woche beginnt am Montag; Kalenderwochen nach ISO 8601.
- **Über Mitternacht / Zeitraumgrenzen:** Die Auswertung zählt nur den Anteil eines
  Eintrags, der im gewählten Zeitraum liegt (`domain/report.ts → overlapMs`).
  In der Liste „Einträge“ erscheint ein Eintrag am Tag seines Beginns mit voller Dauer.
- **Rundung:** minutengenau. Jede Projektsumme wird auf ganze Minuten gerundet; die
  Gesamtsumme ist die Summe dieser Werte, damit Zeilen und Summe immer übereinstimmen.

## Datenbank-Schema ändern

In `src/data/db.ts` niemals eine bestehende `this.version(n)` verändern – sie ist auf den
Geräten bereits angelegt. Stattdessen eine neue Version ergänzen:

```ts
this.version(2)
  .stores({ entries: 'id, projectId, start, kategorie' }) // nur geänderte Tabellen
  .upgrade((tx) =>
    tx
      .table('entries')
      .toCollection()
      .modify((entry) => {
        entry.kategorie = 'Standard';
      }),
  );
```

Bei neuen Feldern auch anpassen: `domain/types.ts`, das Sicherungsformat in
`data/backupFormat.ts` (dort `BACKUP_VERSION` erhöhen und alte Sicherungen umwandeln) und
die Testdaten in `test/fixtures.ts`.

## Beispiele für Erweiterungen

**Neue Seite:** Ordner unter `features/` anlegen, Pfad und Tab in `app/routes.ts`
eintragen, Route in `app/App.tsx` ergänzen.

**Neue Spalte im PDF (z. B. Betrag):** Rechenlogik als reine Funktion in `domain/`
(mit Test), dann in `features/reports/pdf/createReportPdf.ts` eine Spalte in `COLUMNS`
ergänzen und in `drawTableHeader`, `drawRow` und `drawTotal` ausgeben.

**Neue Einstellung:** Schlüssel in `data/settingsRepository.ts → Settings` ergänzen,
lesen mit `useSetting('name')`, schreiben mit `setSetting('name', wert)`.

## Gestaltung

- Alle Farben, Abstände und Schriftgrößen stehen als CSS-Variablen in
  `src/styles/tokens.css`, inklusive Dunkelmodus. Komponenten verwenden nur diese Variablen.
- Jede Komponente hat ihre eigene `*.module.css` (CSS Modules): Klassennamen gelten nur
  für diese Komponente, es gibt keine Konflikte.
- Tippflächen sind mindestens 44 px groß, Eingabefelder haben 16 px Schrift (sonst zoomt
  iOS beim Antippen), Ränder berücksichtigen Notch und Home-Indikator (`--safe-*`).

## Besonderheiten auf dem iPhone

- **Teilen-Menü:** Safari öffnet es nur direkt nach einem Tipp. PDF und Sicherung werden
  deshalb synchron aus bereits geladenen Daten erzeugt, bevor `navigator.share` aufgerufen
  wird (`lib/shareFile.ts`). Ohne Teilen-Funktion wird die Datei heruntergeladen.
- **Hintergrund:** iOS pausiert Web-Apps im Hintergrund. Das ist unkritisch, weil der
  Timer nur Start- und Endzeitpunkt speichert; `useNow` aktualisiert die Anzeige sofort
  beim Zurückkehren.
- **Speicher:** Die App bittet beim Start um dauerhafte Speicherung
  (`data/storagePersistence.ts`). Zum Home-Bildschirm hinzugefügte Apps werden von iOS
  nicht automatisch geleert.
- **Routing:** Hash-Adressen (`#/timer`) funktionieren auf GitHub Pages ohne
  Server-Einstellungen und offline.

## Tests

| Ebene      | Beispiele                                                | Werkzeug                |
| ---------- | -------------------------------------------------------- | ----------------------- |
| Domain     | Zeiträume, Sommerzeit, Mitternacht, Rundung, Validierung | Vitest                  |
| Daten      | Timer-Wechsel, Archivieren, Sicherung/Wiederherstellung  | Vitest + fake-indexeddb |
| Oberfläche | Timer starten/wechseln, Eintrag bearbeiten/löschen, PDF  | Testing Library (jsdom) |

Alle Tests laufen in der Zeitzone Europe/Berlin (`vitest.config.ts`), damit Ergebnisse
rund um die Zeitumstellung auf jedem Rechner gleich sind.
