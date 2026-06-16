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

## Live Demo

The public GitHub Pages site is:

- `https://starlingsound.github.io/PetalPal/`

The two sound-set pages are:

- `https://starlingsound.github.io/PetalPal/basic/`
- `https://starlingsound.github.io/PetalPal/functional/`

The QR code PNGs in `qr-codes/` point to those two sound-set pages.

## Sound Sets

The app plays WAV files from `sounds/basic/` and `sounds/functional/`.

Both folders use the same cue filenames so the basic and functional sets stay mirrored. Replace a WAV with the same filename to swap in a custom sound without changing the UI.
