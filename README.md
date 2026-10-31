# Prabu Dass — Portfolio

A four-page static portfolio: **Home**, **UI/UX Design**, **Graphic Design** and **Video & Animation**.
Hand-written HTML, one CSS file, one small JavaScript file. No framework, no build step, no runtime dependencies (Google Fonts only).

Design rationale, the audit of the old site and the reference research are in [`docs/01-audit-research-design.md`](docs/01-audit-research-design.md).

## Project structure

```
portfolio/
├── index.html                Home
├── ui-ux.html                UI/UX Design (case studies)
├── graphic-design.html       Graphic Design
├── video-animation.html      Video & Animation (dark theme)
├── 404.html                  Not-found page (Netlify serves it automatically)
├── netlify.toml              Publish settings + redirects from the old site's URLs
├── robots.txt, sitemap.xml, favicon.ico
├── assets/
│   ├── css/main.css          Design tokens → base → layout → components → pages → motion
│   ├── js/main.js            Header, nav indicator, mobile menu, reveals, hero type, video modal
│   ├── img/                  Optimised images (JPEG q80, max 1600px; PNG only where transparent)
│   │   ├── ui_ux/  graphic-design/  animation/  2danimation/  site/
│   │   ├── posters/          Frames captured from the videos, used as poster images
│   │   ├── og-image.jpg      Social share image (1200×630)
│   │   └── favicon.svg
│   └── video/                MP4s, loaded only when someone presses play
├── docs/                     Audit, research and design direction
└── tools/                    Local helpers (not needed in production)
    ├── serve.ps1             Local static server with video seeking support
    ├── optimize-assets.ps1   Resize/compress new images, copy videos
    ├── check-links.ps1       Verifies every local file and #anchor reference
    ├── capture-posters.html  Grabs a video frame as a poster image
    ├── car-mockup.html       In-car cabin scene that shows a UI screen on the centre display
    └── render-car-mockups.ps1  Renders every car screen into car-mockup.html and saves JPEGs
```

## Technologies

- Semantic HTML5, `<dialog>` for the video player, `<details>` for the shorter case studies
- CSS custom properties (design tokens), CSS grid, `clamp()` type scale, `color-mix()`
- Variable fonts: **Anybody** (display; its width axis is animated) and **Hanken Grotesk** (body)
- Vanilla JavaScript: IntersectionObserver reveals, View Transitions API between pages, pointer-reactive hero type, 3D tilt and glare on project frames
- The 3D head is plain SVG + JavaScript (no libraries)

### The 3D head (`assets/img/site/avatar-front.svg` + `assets/js/avatar.js`)

The portrait is a front-view redraw of the original illustration (`Asset-1.svg`) in the same palette. Its hair, beard, smile and navy shirt collar are matched to Prabu's photo, and it's inlined in `index.html`. The About section uses the separate face-in-"D" artwork (`assets/img/site/avatar-d.png`). Two things make it feel 3D:

1. **Depth layers.** Every part sits in a `<g data-depth="n">` group. When the head turns, each layer shifts by n units, so the nose (18), mouth (14) and eyes (12) move more than the face (0), while the back hair (-12) and ears (-16) move the opposite way. A light layer (-7) slides against the turn, so the face reads as round.
2. **Perspective rotation.** The `.avatar-rig` wrapper rotates with CSS `perspective() rotateY() rotateX()` toward the pointer.

The pupils (`[data-pupil]`) roll toward the pointer, or a finger on touch screens. The head blinks, floats and looks around on its own when idle. Glossy shading comes from SVG gradients only: blur filters were removed because they re-rasterise on every frame. The loop runs only while the head is on screen. With reduced motion, idle movement, floating and blinking are off, and the eyes still follow the pointer.

**To edit the face:** change `assets/img/site/avatar-front.svg`, then paste its `<svg>` into the `.avatar-rig` element in `index.html` (keep `aria-hidden="true"`). To tune movement, change the `data-depth` values in the SVG, or the rotation amounts (16° / 10°) and pupil travel (9 / 7) in `avatar.js`.

An earlier WebGL (Three.js) version of the head is archived in `D:\Claude\portfolio-archive\webgl-head`, outside the published site.
## Run it locally

Any static server works. Without Node or Python, use the included PowerShell server:

```bash
powershell -ExecutionPolicy Bypass -File tools/serve.ps1 -Port 5173
```

Then open http://localhost:5173. Opening the HTML files directly also works, but video seeking and some browser features behave better over HTTP.

With Node installed you can use `npx serve .`, and with Python `python -m http.server 5173`.

## Updating images and videos

1. Put the new originals in a folder somewhere (for example `D:\raw-assets\graphic-design\new_logo\1.png`).
2. Run the optimiser on that folder:
   ```bash
   powershell -ExecutionPolicy Bypass -File tools/optimize-assets.ps1 -Source D:\raw-assets
   ```
   It writes into `assets/img/...` and `assets/video/...` at the same relative path, lower-cased with spaces turned into hyphens. It also writes `tools/asset-manifest.csv` with every file's pixel size.
3. To swap an image, keep the same file name and nothing else changes. Otherwise, update the `src` in the HTML.
4. Run the link checker (see Testing).

**Videos:** export MP4 (H.264, AAC). Keep each file under about 20–30 MB: 1080p at 6–8 Mbps is plenty. [HandBrake](https://handbrake.fr/)'s "Fast 1080p30" preset is a good default. Every video needs a poster image. Use an existing still, or capture a frame with `tools/capture-posters.html`: run the server with `-AllowPosterUpload`, edit the job list at the top of that file, then open it in a browser.

**Car UI screens and in-car mockups:** the flat screens are in `assets/img/car-ux/screens/` and the rendered cabin mockups in `assets/img/car-ux/mockups/`. To add or replace a screen:
1. Save the flat screen as `assets/img/car-ux/screens/<direction>-<screen>.jpg` (for example `sand-home.jpg`). 16:9 screens fit the standard display; 1920×720 screens use the ultra-wide one.
2. Add it to the job list at the top of `tools/render-car-mockups.ps1`, picking a lighting theme: `dusk` (warm), `day`, `morning` (pastel) or `night`, plus `wide = 1` for ultra-wide screens.
3. Start the local server, then run `powershell -ExecutionPolicy Bypass -File tools/render-car-mockups.ps1`. It uses headless Microsoft Edge to save 1600×1000 JPEGs.
4. Add a tab to the matching screen switcher in `ui-ux.html` (each tab has `data-mockup` and `data-screen`).

Higher-resolution exports of the screens (the current ones are about 580 px wide) would make both the mockups and the full-size view sharper.

**GIFs:** keep them under about 2 MB. Anything larger should be an MP4 with `autoplay muted loop playsinline`.

## Adding a new project

Copy an existing block on the matching page and change the text and paths. Pick a block by shape:

| Page | For | Copy this |
|---|---|---|
| Home | Featured project | an `<a class="tile">` inside `.featured` (layout is set for six) |
| UI/UX | Grid tile | an `<a class="tile">` inside `.project-index` |
| UI/UX | Full case study | an `<article class="case">`: give it an `id`, then link the tile to `#that-id` |
| UI/UX | Short case study | a `<details class="case-more">` (it opens automatically when linked by `#id`) |
| UI/UX | Screen switcher (mockup + flat screen tabs) | a `<div class="switcher" data-switcher="Name">` block from the in-vehicle case study |
| Graphic | Identity system | an `<article class="editorial ed-block">` (add `ed-flip` to mirror it) |
| Graphic | Logo | a `<div class="logo-cell">` in `.logo-wall` (`span-2` makes it wide) |
| Video | Video card | an `<article class="v-card v-4">` (`v-8`, `v-6`, `v-12` for other widths) |
| Video | YouTube video | a `.reel-row` item with `data-youtube="VIDEO_ID"` |

**Image lightbox:** any `<button>` with `data-image="path.jpg"` and `data-title` opens the image full size in the same viewer.

**Video triggers:** any `<button>` with `data-video="path.mp4"`, `data-poster` and `data-title` opens the player. Add `data-portrait` for 9:16 video. Use `data-youtube="ID"` instead of `data-video` for YouTube.

**Image frames:** wrap images in `<div class="frame ratio-16x9">` (also `16x10`, `4x3`, `3x2`, `1x1`, `4x5`, `3x4`, `9x16`, `21x9`). Add `data-reveal` for the scroll reveal, `zoom` for hover zoom, and `frame--scroll` for full-page website captures that scroll on hover.

**Rules for copy:** sentence case, no all-caps labels, real facts only. Mark anything missing with a `placeholder-note` block, as the existing ones do.

## Build and deploy

There's no build step.

**Netlify (recommended, keeps the current URL):**
1. Push this folder to the `prabu-dass/dass_portfolio` repository, replacing the old files. Keep the old repo history or a branch as a backup.
2. In Netlify, set the publish directory to `.` with an empty build command. `netlify.toml` already does this.
3. `netlify.toml` redirects the old URLs (`/skills/...`, `/resume.html`) to the new pages, so existing links keep working.

**Drag and drop:** zip the folder and drop it on app.netlify.com/drop. Large videos make the upload slow. Git deploys handle them better.

**Size note:** the videos total about 310 MB. Netlify and GitHub both accept that (the largest file, the showreel, is 63 MB, under GitHub's 100 MB limit). Re-encoding the larger videos as described above would cut that down considerably.

If the site moves to a new domain, update the absolute URLs in the `og:image` tags, `robots.txt` and `sitemap.xml`.

## Testing

```bash
powershell -ExecutionPolicy Bypass -File tools/check-links.ps1
```

This checks every local `src`, `href`, `poster`, `data-video` and `data-poster` reference and every in-page `#anchor`.

See [`docs/02-testing.md`](docs/02-testing.md) for the full QA results and known limitations.
