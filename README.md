# Petal Pal Sound Demo

A tiny static web app for comparing two UI sound sets for Petal Pal, a fictional plant-watering drone.

## Local Preview

No dependencies are required. From the repo root, run:

```bash
python3 -m http.server 4173
```

Then open:

- `http://127.0.0.1:4173/basic/`
- `http://127.0.0.1:4173/functional/`

## GitHub Pages

Publish from the repository root on the `main` branch.

The public demo URLs will be:

- `https://YOUR-USERNAME.github.io/YOUR-REPO/basic/`
- `https://YOUR-USERNAME.github.io/YOUR-REPO/functional/`

Use those public URLs when generating QR codes for the slideshow after Pages finishes publishing.

## Sound Sets

The app plays WAV files from `sounds/basic/` and `sounds/functional/`.

Both folders use the same cue filenames so the basic and functional sets stay mirrored. Replace a WAV with the same filename to swap in a custom sound without changing the UI.
