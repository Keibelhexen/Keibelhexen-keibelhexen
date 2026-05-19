# Keibelhexen Huchenfeld – Website

Statische Website der Keibelhexen Huchenfeld. Reines HTML/CSS/JS – keine
Build-Tools, kein Server, kein npm.

## Was hier drin liegt

- `index.html` – die Seite
- `styles.css` – Layout & Komponenten
- `ds-tokens.css` – Farben, Schriften, Spacing
- `app.js` – Galerie, Lightbox, Termine-Automatik, Konfetti, Cursor
- `favicon-*.png` + `apple-touch-icon.png` – Browser- und iOS-Icons
- `images/` – **alle Bilder schon optimiert** (siehe unten)

## Bilder

Sämtliche Bilder wurden für das Web optimiert:

| Original | Optimiert |
|---|---|
| Keibelhexen_0456.jpg (10.9 MB) | 373 KB |
| Larve.png (2.3 MB) | 175 KB |
| Plakat (3.2 MB PNG) | 398 KB JPG |
| Zirkel-Portraits (200-500 KB) | 47–145 KB |
| Galerie-Bilder (270 KB-1.3 MB) | 227–804 KB |

**Gesamt: 22 MB → 4 MB** (84 % kleiner)

Die Seite zeigt die Bilder jetzt aus dem mitgelieferten `images/`-Ordner –
das ist deutlich schneller als sie über `raw.githubusercontent.com` zu
laden und vermeidet GitHub-API-Rate-Limits.

> **Hinweis:** Wenn du neue Bilder in dieses Repo lädst, erscheinen sie
> *nicht* automatisch wie früher – stattdessen müssen sie hier in den
> `images/`-Ordnern liegen. So funktioniert das jetzt richtig schnell.

## Automatische Termine

Die drei Saison-Daten berechnen sich **jedes Jahr automatisch neu** beim
Seitenaufruf:

- **11. November** – fix
- **Aschermittwoch** – 46 Tage vor Ostersonntag (Gauss-Algorithmus)
- **Schmotziger Donnerstag** – Donnerstag vor Aschermittwoch

Sobald der Aschermittwoch des laufenden Jahres vorbei ist, springt die
Seite automatisch auf die nächste Kampagne.

## Hosting via GitHub Pages

1. **Diese Dateien in das Repo pushen** – am einfachsten:
   - GitHub-Repo öffnen
   - „Add file → Upload files"
   - Den ganzen Inhalt dieses Ordners reinziehen
   - Commit
2. Im Repo unter **Settings → Pages**:
   - Source: `Deploy from a branch`
   - Branch: `main` (Root oder `/docs`)
3. Nach ein paar Minuten ist die Seite live unter
   `https://keibelhexen.github.io/Keibelhexen-keibelhexen/`

Für eine eigene Domain: CNAME-Datei im Repo-Root anlegen mit der Domain.

## Lokal testen

Einfach `index.html` doppelklicken – läuft. Für saubere Pfade alternativ
ein Mini-Server:

```
python3 -m http.server 8000
```

Dann `http://localhost:8000` öffnen.

---

*Homepage kreiert, entwickelt und gestaltet von Manuel Rudorfer.*
