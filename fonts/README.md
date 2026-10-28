# Self-hosted kid font

The UI asks for a rounded, friendly display font via `@font-face` in
`css/styles.css` (family name **"Lalo Rounded"**), with `font-display: swap`
and a graceful **system fallback stack** so the app always renders legibly even
when no bundled font binary is present.

This environment cannot bundle a binary font file, so no `.woff2` is shipped
yet. The `@font-face` rule points at `./fonts/lalo-rounded.woff2`; when that file
is absent the browser silently falls back to the next font in the stack
(`"Baloo 2"`, `"Comic Sans MS"`, `"Segoe UI"`, `system-ui`, sans-serif) — this
is the documented graceful degradation.

## Drop-in a real font later (no code changes)

Pick an OFL-licensed rounded font (e.g. **Baloo 2** or **Fredoka**), convert a
subset to `woff2`, and save it here as `lalo-rounded.woff2`:

```sh
# example: subset + convert with fonttools/woff2
pyftsubset Baloo2-SemiBold.ttf \
  --unicodes="U+0020-00FF,U+2019,U+2026" \
  --flavor=woff2 \
  --output-file=lalo-rounded.woff2
```

The existing `@font-face` rule picks it up automatically on next load, and the
service worker (`sw.js`) will cache it once its path is added to the shell list.
