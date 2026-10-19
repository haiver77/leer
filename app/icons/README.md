# App icons

The app ships working **SVG** icons that are referenced by both `index.html`
and `manifest.webmanifest`:

- `icon.svg` — the primary any-purpose icon (scales to any size).
- `icon-maskable.svg` — a full-bleed maskable variant whose artwork stays inside
  the maskable safe zone (central ~60%), so Android adaptive-icon masks never
  clip Lalo.

## PNG drop-in (`icon-192.png`, `icon-512.png`)

Some installers prefer raster PNGs. The manifest already references
`icon-192.png` and `icon-512.png`. This environment cannot emit binary PNGs, so
they are **not bundled yet** — the SVG icons are the source of truth and install
correctly on Chromium-based browsers.

To generate the PNGs as a drop-in later (no code changes needed), rasterise the
SVG, e.g.:

```sh
# with rsvg-convert
rsvg-convert -w 192 -h 192 icon.svg -o icon-192.png
rsvg-convert -w 512 -h 512 icon.svg -o icon-512.png

# or with ImageMagick
magick -background none icon.svg -resize 192x192 icon-192.png
magick -background none icon.svg -resize 512x512 icon-512.png
```

Drop the two PNGs in this folder and the manifest picks them up automatically.
Until then, browsers fall back to the SVG `any` icon.
