# Zeitkontierung

Arbeitszeiten pro Projekt auf dem iPhone erfassen – als installierbare Web-App (PWA).
Alle Daten bleiben ausschließlich auf dem Gerät; es gibt keinen Server und kein Konto.

## Funktionen

| Bereich           | Was es kann                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Timer**         | Ein Tipp auf ein Projekt startet die Zeit. Startet man ein anderes Projekt, stoppt das laufende automatisch.                                                 |
| **Einträge**      | Alle Zeitblöcke nach Tagen, monatsweise. Bearbeiten, nachtragen, löschen, Notiz pro Eintrag.                                                                 |
| **Auswertung**    | Summen für Woche, Monat oder freien Zeitraum (minutengenau), wahlweise pro Projekt oder pro Tag. Export der Projektsummen als PDF mit eigenem Namen im Kopf. |
| **Einstellungen** | Projekte anlegen, umbenennen, einfärben, archivieren. Name für den PDF-Kopf. Datensicherung als Datei erstellen und wieder einspielen.                       |

Mehrere Personen können die App gleichzeitig nutzen: Jede Person öffnet sie auf ihrem
eigenen iPhone, und die Daten bleiben getrennt auf dem jeweiligen Gerät.

Weitere Eigenschaften: funktioniert offline, folgt dem Hell-/Dunkelmodus des iPhones,
weist auf vermutlich vergessene Timer (> 10 Std.) und fällige Sicherungen hin.

## Schnellstart für Entwickler

Voraussetzung: [Node.js](https://nodejs.org/) 22 oder neuer.

```bash
npm install        # Abhängigkeiten installieren
npm run dev        # Entwicklungsserver unter http://localhost:5173
npm test           # alle Tests
npm run build      # Produktions-Build nach dist/
```

Alle Befehle:

| Befehl            | Zweck                                                     |
| ----------------- | --------------------------------------------------------- |
| `npm run dev`     | Entwicklungsserver mit automatischem Neuladen             |
| `npm run build`   | Typprüfung und Produktions-Build                          |
| `npm run preview` | Den Build lokal ansehen                                   |
| `npm test`        | Tests einmal ausführen (`npm run test:watch` fortlaufend) |
| `npm run lint`    | Code-Regeln prüfen (ESLint)                               |
| `npm run format`  | Code einheitlich formatieren (Prettier)                   |
| `npm run check`   | Alles prüfen: Typen, Regeln, Formatierung, Tests          |

Zum Testen auf dem iPhone im selben WLAN: `npm run dev -- --host` und die angezeigte
Netzwerk-Adresse in Safari öffnen.

## Technik

- **React 19 + TypeScript** (strikter Modus), gebaut mit **Vite**
- **Dexie** (IndexedDB) als lokale Datenbank
- **vite-plugin-pwa** für Installierbarkeit und Offline-Betrieb
- **jsPDF** für den PDF-Bericht, **zod** für die Prüfung von Sicherungsdateien
- **Vitest** + Testing Library für Tests, **ESLint** + **Prettier** für Codequalität
- **GitHub Actions** prüft jeden Push und veröffentlicht auf GitHub Pages

## Projektstruktur

```
src/
├── app/          App-Rahmen: Routing, Layout, Tab-Leiste
├── config/       Zentrale Einstellungen (Name im PDF, Schwellwerte)
├── domain/       Datentypen und Rechenlogik – reine Funktionen, ohne React/DB
├── data/         Datenbank, Repositories (Schreiben) und Hooks (Lesen)
├── features/     Ein Ordner pro Bereich der App
│   ├── timer/        Timer-Seite
│   ├── entries/      Einträge-Seite und Eintrags-Formular
│   ├── reports/      Auswertung und PDF-Erzeugung
│   ├── projects/     Projektverwaltung
│   ├── backup/       Datensicherung
│   └── settings/     Einstellungsseite
├── ui/           Wiederverwendbare Bausteine (Button, Sheet, List …)
├── hooks/        Allgemeine React-Hooks
├── lib/          Browser-Hilfen (Teilen/Download)
├── styles/       Design-Tokens und globale Stile
└── test/         Test-Setup und Testdaten
docs/
├── ARCHITEKTUR.md       Aufbau, Datenmodell, Regeln, Erweiterungen
└── VEROEFFENTLICHEN.md  GitHub Pages einrichten, App auf dem iPhone installieren
public/                  Icons und Favicon
scripts/
└── generate-icons.py    Erzeugt die App-Icons neu (Python + Pillow)
.github/workflows/       Automatische Prüfung und Veröffentlichung
```

Tests liegen jeweils neben der getesteten Datei (`*.test.ts` / `*.test.tsx`).

## Häufige Anpassungen

| Was                                | Wo                                            |
| ---------------------------------- | --------------------------------------------- |
| Hinweis bei langem Timer (Stunden) | `src/config/appConfig.ts`                     |
| Erinnerung an Sicherung (Tage)     | `src/config/appConfig.ts`                     |
| Farben, Abstände, Schriftgrößen    | `src/styles/tokens.css`                       |
| Projektfarben                      | `src/domain/projectColors.ts` + `tokens.css`  |
| Aufbau des PDF                     | `src/features/reports/pdf/createReportPdf.ts` |
| App-Name und Icon                  | `vite.config.ts`, `index.html`, `public/`     |

Mehr dazu in [docs/ARCHITEKTUR.md](docs/ARCHITEKTUR.md).

## Veröffentlichen und auf dem iPhone installieren

Schritt-für-Schritt-Anleitung: [docs/VEROEFFENTLICHEN.md](docs/VEROEFFENTLICHEN.md).

## Wichtig: Datensicherung

Die Daten liegen nur auf dem iPhone. Geht das Gerät verloren oder wird die App gelöscht,
sind sie ohne Sicherung weg. Deshalb regelmäßig unter **Einstellungen → Sicherung erstellen**
eine Datei z. B. in iCloud Drive ablegen. Über **Sicherung einspielen** lassen sich die
Daten auf demselben oder einem neuen iPhone wiederherstellen.
