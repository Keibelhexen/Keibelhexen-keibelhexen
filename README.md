# Keibelhexen Huchenfeld – Website

Statische Website der Keibelhexen Huchenfeld. Reines HTML/CSS/JS – keine
Build-Tools, kein Server, kein npm.

## Was hier drin liegt

- `index.html` – die Seite
- `styles.css` – Layout & Komponenten
- `ds-tokens.css` – Farben, Schriften, Spacing
- `app.js` – Galerie, Lightbox, Termine-Automatik, Konfetti, Cursor, GitHub-Loader
- `favicon-*.png` + `apple-touch-icon.png` – Browser- und iOS-Icons

## Wie die Bilder funktionieren

Die Webseite lädt **alle Bilder dynamisch** aus dem `images/`-Ordner dieses
Repos über `raw.githubusercontent.com`. Du musst keinen Code anfassen,
um neue Bilder hinzuzufügen:

```
images/
├── logo/        →  Logo (wird im Header + Hero gezeigt)
├── ueber-uns/   →  „Das Häs"-Foto im About-Bereich
├── maske/       →  Larven-Foto im About-Bereich
├── geschichte/  →  Bild neben der Sage (z. B. Zeitungsausschnitt)
├── zirkel/      →  Portraits — Dateiname = Vorname (manuel.jpg, Vero.jpg…)
├── galerie/     →  ALLE Bilder werden in der Galerie angezeigt
└── flyer/       →  ALLE PDFs/Bilder werden im Flyer-Bereich angezeigt
```

**Wichtig:** Bilder bitte vor dem Hochladen verkleinern!
Empfehlung: max. 1600 px Breite, JPEG-Qualität ~80 %. Das reicht für
schöne Darstellung und hält die Seite schnell. Tool-Tipp: [squoosh.app](https://squoosh.app)
oder kostenlose Online-Komprimierer.

## Automatische Termine

Die drei Saison-Daten berechnen sich **jedes Jahr automatisch neu** beim
Seitenaufruf:

- **11. November** – fix
- **Aschermittwoch** – 46 Tage vor Ostersonntag
- **Schmotziger Donnerstag** – Donnerstag vor Aschermittwoch

Sobald der Aschermittwoch des laufenden Jahres vorbei ist, springt die
Seite automatisch auf die nächste Kampagne.

## Hosting via GitHub Pages

1. Im Repo unter **Settings → Pages**:
   - Source: `Deploy from a branch`
   - Branch: `main` (Root)
2. Nach ein paar Minuten ist die Seite live unter
   `https://keibelhexen.github.io/Keibelhexen-keibelhexen/`

---

*Homepage kreiert, entwickelt und gestaltet von Manuel Rudorfer.*
