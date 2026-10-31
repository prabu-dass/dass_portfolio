# Testing results

Tested on 31 Oct 2026 against the local server (`tools/serve.ps1`) in a Chromium browser (the Claude desktop browser pane) and headless Microsoft Edge.

## What was run and the results

| Check | How | Result |
|---|---|---|
| Local references | `tools/check-links.ps1` (every src/href/poster/data-video/data-poster and #anchor, 5 pages) | 196 references, **0 missing** |
| Checker sanity | Same script against a page with deliberately broken references | All 3 planted problems caught |
| Images load | Every `<img>` on every page loaded in the browser, incl. YouTube thumbnails | 120 images, **0 broken** |
| Horizontal overflow | Each page in iframes at 1920, 1440, 1366, 1024, 768, 390 and 360 px; `scrollWidth` vs viewport, plus any element outside the viewport | **None** on any page at any width |
| Routes | `/`, `/ui-ux.html`, `/graphic-design.html`, `/video-animation.html`, unknown URL → `404.html` | All load; 404 page served |
| Navigation | Active-page indicator on each page; mobile menu opens, Escape closes it and returns focus to the toggle | Working |
| Deep links | `ui-ux.html#pricing` and `#mothertong` open their collapsible case study | Working |
| Video modal | Showreel opens and loads (2:41, readyState 4); YouTube opens through youtube-nocookie.com; 9:16 videos get the portrait layout | Working |
| Modal closing | Escape, Close button and backdrop click each empty the player, unlock scroll and return focus to the trigger | Working (after a fix, see below) |
| Ambient hero video | Video page: loads only after idle, only on screens ≥700px, only without reduced motion or Save-Data | Starts after idle as intended |
| Reduced motion | Pages rendered with `--force-prefers-reduced-motion` | All content visible immediately, no reveals, filmstrip static |
| Home page weight | Resource timing on first load | 9 requests, ~719 KB, **no video** downloaded, CLS 0.001 |
| Console | Errors read after loading each page | No script errors (one browser warning, see limitations) |

### In-vehicle display UX update (same day)

| Check | Result |
|---|---|
| 14 screens cropped from the supplied images | 12 at 582×329 and 2 at 1920×720, cropped automatically from the transparent background |
| 14 in-car mockups rendered (headless Edge, 1600×1000) | All rendered; reviewed in a contact sheet |
| Screen switcher | Click, ←/→, Home and End swap the mockup and flat screen together and keep `aria-selected` and focus in sync |
| Lightbox | Opens the selected flat screen, title updates per tab, closes clean |
| Tab assets | All 24 `data-mockup`/`data-screen` files exist |
| Links | 207 local references, 0 missing |
| Overflow | None on 4 pages × 7 widths |
| Site-wide fix | `<figure>` default 40px margins removed, so figures align to the grid on every page |

### Glossy 3D update (same day)

| Check | Result |
|---|---|
| 3D head initialises (WebGL) | Yes, in the desktop browser pane and in headless Edge with SwiftShader |
| Eye and head tracking | Pointer top-left: head turns left and eyes look up-left. Bottom-right: turns right and looks down. Verified by screenshots |
| Script errors | None on any page at any width |
| Overflow | None on 4 pages × 7 widths |
| Links | 208 local references, 0 missing; vendored Three.js files served 200 |
| Reduced motion | Head renders without idle movement or blinking; frames don't tilt |

Fixed during this pass: tone mapping washed out the skin (switched to accurate colour); the blink was frame-counted and could stall (now time-based); stair-stepped beard and hair edges (higher mesh resolution, edges taper into the face); the fringe covered an eyebrow; the header's frosted glass would have trapped the fixed mobile menu (the glass moved to a pseudo-element).

Not verified: frame rate on low-end phones. The head is light (a few dozen meshes, pixel ratio capped at 2), but check it on a real device.

### Layered SVG head (replaces the WebGL head)

| Check | Result |
|---|---|
| Pointer top-left | Head rotates left/up (rotateY -, rotateX +), nose layer shifts left/up, ears shift the other way, pupils look up-left |
| Pointer top-right | Head rotates right/up (rotateY ≈ 12°, rotateX ≈ 7°), nose layer +14/−7 |
| Script errors | None |
| Links | 208 local references, 0 missing |
| Frame cost | The browser pane ran at about 3 fps with or without the head (pane throttling), so the head adds no measurable cost. All SVG blur filters and the CSS drop-shadow on the animated element were removed, because they re-rasterised every frame |
| Hero name entrance | Now uses a timeout instead of animation frames, so it completes even in background tabs |

Note: headless Edge screenshots can show the hero name mid-entrance (narrow). The DOM and the real browser both confirm the final width.
### Content update

- New videos: the SLAM Fitness member-story reel (vertical, 0:42, 89 MB) and the Encipher Health company film (1:49, 43 MB) in Video editing, with posters captured from the videos. The 89 MB file is under GitHub's 100 MB limit, but re-encoding it would help on mobile.
- The Abacus promo is removed from the Video & Animation page. The Graphic Design logo card still links to it.
- The Sand and Blue car screens are replaced with 1280x720 exports, and their in-car mockups re-rendered. The full-size viewer now shows them at up to 1280px.
- The About section shows the face-in-D PNG on its own, with no card.
- Links: 209 local references, 0 missing.

### Prank Time case study

- 15 screens imported to `assets/img/prank-time/` (14 JPG, 1 WebP), shown in CSS phone frames. Facts (publisher Pixel Dass, live on Google Play, 100+ downloads, 10+ clock styles) come from the Play Store listing, checked 31 Oct 2026.
- UI/UX page: no overflow at 1920/1440/1366/1024/768/390/360. Links: 224 local references, 0 missing.
- Confirmed by Prabu: he designed and built the app. The copy and fact panel say so.

## Issues found and fixed during testing

1. **Featured images never appeared.** The reveal hid images with `clip-path` on the observed frame, and IntersectionObserver treats a fully clipped element as never visible. Moved the clip to the image inside the frame.
2. **Video player didn't clean up on close.** It relied on the dialog's `close` event, which in this browser fired late or not at all, leaving audio playing and scroll locked. Cleanup now runs directly on every close path, with the event as a fallback.
3. **Hero entrance waited for every image.** Triggered by `window.load`, it left about two seconds of blank screen on slow loads. It now starts when fonts are ready, never later than 500 ms.
4. **Mobile menu overlay faded in see-through.** The overlay is now opaque immediately and only the links animate.
5. **UI/UX project grid left orphan tiles.** Replaced the repeating pattern with an explicit nine-tile rhythm.
6. **`/favicon.ico` 404s.** Added a `favicon.ico` alongside the SVG icon.

## Not run, and why

- **Lighthouse:** not available in this environment (no Node.js). Run it in Chrome DevTools against the deployed site.
- **TypeScript checks / ESLint / production build:** there is no TypeScript and no build step. The JavaScript is one plain file, checked by running it in the browser with no errors.
- **Safari and Firefox:** not available here. Everything used is supported in current Safari and Firefox. View Transitions between pages and scroll-driven parallax are progressive enhancements, so browsers without them simply skip the effect.
- **Real phones:** layouts were tested by emulating widths, not on physical devices.

## Known limitations

- **Video weight:** 16 MP4s total about 310 MB (showreel 63 MB, reel edit 46 MB). They only load on play, but re-encoding them (README, "Updating images and videos") would make playback start faster on mobile data.
- **YouTube thumbnails** load from `i.ytimg.com`. If a video is made private, its thumbnail and player stop working.
- **"Transition was skipped" console message:** Chromium can log this when a cross-page view transition is interrupted, for example by scripted navigation or a background tab. A handler in each page's `<head>` catches these promises. After adding it I couldn't fully confirm the message never appears in automated navigation, because the browser tool keeps old console entries between pages. It doesn't affect how the site works.
- **Hover-scroll previews** of full-page website captures use hover on desktop. On touch screens those frames scroll with a finger instead.
- **In-vehicle screens are low resolution** (about 580 px wide), so they look slightly soft when enlarged. Higher-resolution exports would fix this.
- **The car cabin is an illustration** drawn in SVG/CSS, not a photo. It's consistent across all screens and contains no third-party imagery.
- **Placeholders, marked in the pages:** in-vehicle project context (brief, constraints, flows, client attribution); Encipher Health work (under wraps); wireframes and flow diagrams for the three main UI/UX case studies; printed collateral. Each is marked with a dashed "To add" note and an HTML comment.
- **Content discrepancy to confirm:** the old site called the Log2Base2 role "Co-founder", while the resume says "Senior Graphic Designer and Animator". The new site follows the resume.
