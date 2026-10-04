# Amar Khunkhun — Cinematic Portfolio

A single-page, cinematic photography/film portfolio. Plain HTML/CSS/JS, no build step, ready for GitHub Pages.

## Deploy to GitHub Pages

1. Create a new GitHub repo and push this entire folder to it (the whole thing, as-is — `index.html` must sit at the repo root, or in `/docs` if you prefer that setting).
2. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, pick `main` and `/ (root)`.
3. Wait a minute, then your site is live at `https://<username>.github.io/<repo-name>/`.

No npm install, no build command — it's just static files.

## Swapping in your real photos and videos

Everything lives in `assets/`:

- `assets/photos/photo-01.jpg` … `photo-15.jpg` — the 15 stills in the film strip. Replace each file in place (keep the same filename, or update the path in `js/main.js`'s `MEDIA` array if you rename them). Mixed aspect ratios are fine — each row's height is fixed in CSS and width is automatic, so portrait and landscape shots sit naturally side by side.
- `assets/photos/portrait.jpg` — the About section portrait.
- `assets/videos/video-01.mp4` … `video-03.mp4` — the three motion clips in the strip. Keep clips short, muted-friendly, and already compressed (h264, faststart) for fast loading.
- `assets/posters/video-0X-poster.jpg` — poster frame shown before each video plays/loads.

The `MEDIA` array near the top of `js/main.js` is the single source of truth for what's in the strip (type, file path, alt text). Add, remove, or reorder entries there and update the `ALT` text to describe each real photo (important for screen readers and SEO) — the row assignments are in the `ROWS` array just below it.

## Structure

```
index.html          page markup
css/styles.css       all styling (two-color system, type, layout, motion states)
js/main.js            all interaction logic (vanilla JS)
js/vendor/            GSAP, ScrollTrigger, Flip and Lenis — vendored locally so the
                       site has no third-party JS dependency at runtime
assets/photos/        stills (placeholders — swap these)
assets/videos/        motion clips (placeholders — swap these)
assets/posters/       video poster frames (placeholders — swap these)
```

## Notes

- Color system, type (Jost + IBM Plex Mono via Google Fonts), and all motion are implemented per spec: transform/opacity-only animation, `prefers-reduced-motion` fallback (static grain, no auto-drift, no zoom-through, strip becomes a plain responsive grid), keyboard-navigable lightbox, alt text throughout, and a mobile layout under 768px.
- The intro's "zoom through the letter" effect computes the on-screen position of the counter of the first **A** in "AMAR" at runtime and scales/reveals from that exact point, so it stays accurate across screen sizes.
- The film strip's idle drift and scroll-reactive speed run off Lenis's scroll velocity via a single `requestAnimationFrame` loop — no scroll-jank-prone `addEventListener('scroll', ...)` math.
- Placeholder images/videos were generated locally (no external image service), so the repo works fully offline with no missing assets.
