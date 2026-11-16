/**
 * Gibt eine erzeugte Datei (PDF, Sicherung) an den Nutzer weiter.
 *
 * Auf dem iPhone öffnet sich das Teilen-Menü („In Dateien sichern“, Mail, AirDrop …).
 * Wo das nicht geht (z. B. Desktop-Browser), wird die Datei heruntergeladen.
 *
 * Wichtig: Muss direkt aus einem Tipp-Ereignis aufgerufen werden, ohne vorher
 * auf langsame Vorgänge zu warten – sonst blockiert Safari das Teilen-Menü.
 */
export type ShareOutcome = 'shared' | 'downloaded' | 'cancelled';

export async function shareOrDownload(file: File): Promise<ShareOutcome> {
  if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: file.name });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
      // Andere Fehler (z. B. nicht erlaubt): auf Download ausweichen.
    }
  }
  download(file);
  return 'downloaded';
}

function download(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.rel = 'noopener';
  document.body.append(link);
  link.click();
  link.remove();
  // Etwas warten, damit der Browser die Datei vollständig übernehmen kann.
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
