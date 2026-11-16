# Veröffentlichen und auf dem iPhone installieren

Die App wird als statische Webseite über **GitHub Pages** bereitgestellt (kostenlos).
Die Zeiterfassungsdaten liegen trotzdem nur auf dem iPhone – GitHub speichert nur die
App-Dateien.

## 1. Repository anlegen und Code hochladen (einmalig)

1. Auf [github.com](https://github.com) anmelden und **New repository** wählen.
   - Name z. B. `zeitkontierung`
   - Sichtbarkeit: _Public_ (für GitHub Pages im kostenlosen Tarif erforderlich; es sind
     nur App-Dateien enthalten, keine Zeiten) oder _Private_ mit einem bezahlten Tarif.
   - Keine README o. Ä. anlegen lassen.
2. Den entpackten Projektordner hochladen. Am einfachsten im Terminal:

   ```bash
   cd zeitkontierung
   git init -b main
   git add .
   git commit -m "Zeitkontierung 1.0.0"
   git remote add origin https://github.com/<BENUTZERNAME>/zeitkontierung.git
   git push -u origin main
   ```

   Alternativ mit [GitHub Desktop](https://desktop.github.com/). Wichtig: Der versteckte
   Ordner `.github` muss mit hochgeladen werden – er enthält die automatische
   Veröffentlichung.

## 2. GitHub Pages einschalten (einmalig)

1. Im Repository: **Settings → Pages**.
2. Unter **Build and deployment → Source** die Option **GitHub Actions** wählen.
3. Unter **Actions** prüfen, dass der Lauf „Prüfen und veröffentlichen“ grün ist
   (dauert ca. 1–2 Minuten). Falls er vor dem Einschalten von Pages lief:
   **Actions → Prüfen und veröffentlichen → Run workflow**.

Die App ist danach erreichbar unter:
`https://<BENUTZERNAME>.github.io/zeitkontierung/`

Jede Änderung, die auf `main` hochgeladen wird, wird automatisch geprüft (Typen, Regeln,
Formatierung, Tests) und nur bei Erfolg veröffentlicht.

## 3. Auf dem iPhone installieren

1. Die Adresse oben in **Safari** öffnen (nicht in Chrome o. Ä.).
2. Unten auf **Teilen** tippen (Quadrat mit Pfeil nach oben).
3. **Zum Home-Bildschirm** wählen und **Hinzufügen** tippen.
4. Ab jetzt die App immer über das Symbol **Zeitkontierung** auf dem Home-Bildschirm öffnen.

Warum der Home-Bildschirm wichtig ist: Safari darf Daten von normalen Webseiten nach
einiger Zeit ohne Nutzung löschen. Für Apps auf dem Home-Bildschirm gilt das nicht.
Außerdem öffnet die App so im Vollbild und funktioniert offline.

## 4. Updates

Neue Versionen werden beim nächsten Öffnen automatisch geladen. Die gespeicherten Zeiten
bleiben dabei erhalten. Versionsnummer anpassen in `package.json` (`version`); sie wird
unter **Einstellungen → Info** angezeigt.

## 5. Datensicherung und Gerätewechsel

- **Sichern:** Einstellungen → **Sicherung erstellen** → im Teilen-Menü
  **In Dateien sichern** → z. B. _iCloud Drive_.
- **Neues iPhone:** App wie oben installieren → Einstellungen → **Sicherung einspielen**
  → Sicherungsdatei auswählen. Achtung: Dabei werden alle Daten auf dem Gerät ersetzt.

## Hinweis zur Adresse

Die Daten sind an die Adresse gebunden. Wird das Repository umbenannt oder später eine
eigene Domain verwendet, startet die App dort ohne Daten – vorher eine Sicherung
erstellen und danach einspielen.
