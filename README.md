# AnnaLove Dashboard – GitHub Pages Deploy

## Inhalt
Fertig gebaute, statische Webseite – bereit für GitHub Pages.

## Deployment auf `stafaaaa/Wetter`

### Variante A: Direkt im Browser (einfachste)
1. Auf github.com → Repo `stafaaaa/Wetter` öffnen
2. Alle alten Dateien im Repo löschen (oder einen neuen Branch anlegen)
3. **"Add file" → "Upload files"**
4. Den **Inhalt** dieses Ordners (NICHT den Ordner selbst) reinziehen:
   - `index.html`
   - `bg-coastal.jpg`
   - `bg-mountain.jpg`
   - `assets/` (kompletter Ordner)
5. Commit
6. Settings → Pages → Source: `main` Branch, `/ (root)` → Save
7. Nach 1–2 Min ist die App unter `https://stafaaaa.github.io/Wetter/` erreichbar

### Variante B: Per Git
```bash
cd /pfad/zum/Wetter-repo
git pull
rm -rf *
cp -r /pfad/zu/dist/* .
git add .
git commit -m "Update dashboard"
git push
```

## Auf dem Tablet einrichten
1. Fully Kiosk Browser öffnen
2. Settings → Start URL: `https://stafaaaa.github.io/Wetter/`
3. Reload

## Was die App kann
- Wetter live (Düsseldorf, OpenMeteo)
- Kalender mit iCal-Sync (Google Calendar)
- Foto-Slideshow mit Upload (ganze Ordner möglich, IndexedDB-basiert)
- Spotify + Amazon Music Quick-Launch (Android-Intent)
- Auto-Layout (Hoch/Quer)
