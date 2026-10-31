# Prabu Dass Portfolio — Audit, Research & Design Direction

## 1. Audit of the existing site

Source: `github.com/prabu-dass/dass_portfolio` (commit `ffd8d06`), live at `prabudass-portfolio.netlify.app`.

**Stack.** Static HTML/CSS/JS. One home page plus five category pages (`ui_ux`, `branding`, `graphic-design`, `2danimation`, `3danimation`) and 30 project detail pages. Three.js (particles), GSAP + ScrollTrigger from unpinned `@3` CDN URLs, Font Awesome 4.

**Structure.** Home: name, about paragraph, showreel, experience timeline, "What I know", skills strip, contact. Navigation jumps between home anchors; category pages use a different header.

| Area | Finding | Decision |
|---|---|---|
| Visual identity | Dark background, purple gradient circles, purple pill tags. Reads as a common template. | **Replace.** Keep the indigo "D" as a quiet nod to the old mark. |
| Typography | One geometric sans used for everything, many ALL-CAPS headings, no scale. | **Replace** with a two-family system and a defined scale. |
| Messaging | "7+ years", jokey hobby lines ("now it won't leave me alone!"). Doesn't match resume (8 years, UI/UX Lead). | **Rewrite** from resume + case-study facts. |
| Experience | Two entries only, says "Co-founder" at Log2Base2 (resume says Senior Graphic Designer & Animator). Missing BlueBinaries and Encipher Health. Section is near-invisible until its scroll animation fires. | **Rebuild** from resume (resume is treated as the newer source). |
| Projects | Strong, real work: 9 UI/UX case studies, ~14 identity/graphic pieces, 3D ads, marketing videos, 10 YouTube ads. Presented as identical cards with pill tags; branding and graphic design pages duplicate each other. | **Retain all work**, regroup into 3 disciplines, vary layouts. |
| Case studies | Good written depth (overview, challenge, role, decisions, outcome). | **Retain substance**, tighten copy, restructure. |
| Assets | ~1.5 GB, mostly GIFs of 10–52 MB each; 64 MB showreel loaded on the home page. | **Optimise.** Re-encode stills to JPEG/PNG ≤1600 px, drop huge GIFs (stills kept), load video only on demand. |
| Responsive | Separate duplicated mobile skills markup (`skills-section-mob`) — duplicate `id="skills"`. | **Replace** with one responsive layout. |
| Motion | Particle canvas, horizontal pinned skill scroll. Heavy for the payoff. | **Replace** with a lighter, deliberate system. |
| Accessibility | Low contrast in experience section, images of icons as link text, no focus styles, no reduced-motion handling. | **Fix.** |

**Retained:** every project and its real description, contact details, awards, showreel, the YouTube ad links, the "D" mark idea.
**Removed:** Three.js particles, gradient blobs, duplicate mobile markup, Font Awesome, unpinned CDN scripts, huge GIFs, `.vs/` editor files.

## 2. Reference research

Live screenshots of the WebGL-heavy references mostly captured preloaders — itself a finding: heavy intros make visitors wait before they see any work. Analysis below draws on the sites' well-documented designs.

| Site | Why it works | Takeaway for this build |
|---|---|---|
| **Bruno Simon** (bruno-simon.com) | The portfolio *is* the demo — a drivable 3D world proves his skill instantly. | Prove craft through the medium itself. For Prabu that's motion and type, not WebGL. |
| **Dennis Snellenberg** (dennissnellenberg.com) | Huge name type, magnetic buttons, smooth page transitions, very few colours. | One confident type gesture beats many effects. |
| **Rauno Freiberg** (rauno.me) | Interaction details as the content; tiny, precise motion. | Micro-interactions should explain state, not decorate. |
| **Aristide Benoist** (aristidebenoist.com) | Editorial grid, large imagery, transitions that keep spatial continuity. | Let images lead; transitions should connect pages. |
| **Locomotive** (locomotive.ca) | Strong grid, scroll-linked reveals that never hijack scroll. | Native scroll; reveals tied to viewport, not timelines. |
| **Jesper Landberg** (jesperlandberg.dev) | Image distortions on hover, restrained otherwise. | Spend boldness in one place. |
| **Olivier Larose** (olivierlarose.com) | Teaching-grade motion patterns (text masks, image reveals). | Clip-path image reveals are cheap and elegant. |
| **Pentagram** (pentagram.com) | Work-first grids, mixed aspect ratios, almost no chrome. | Vary composition per project instead of one card. |
| **Buck** (buck.co) | Motion studio: reel up front, big thumbnails, hover previews. | Video page: reel first, large frames, play affordance obvious. |
| **Studio Dumbar / DEPT** (studiodumbar.com) | Variable-font type that moves as identity. | Variable-width type is an identity device a motion designer can own. |

**Patterns worth using:** oversized wordmark hero; mixed-ratio project grids; clip-path image reveals; cross-document page transitions; video modal with poster-first loading; sticky header that hides on scroll down.
**Avoided:** scroll hijacking, preloaders, WebGL for its own sake, custom cursors that hide the real one.

## 3. Design direction — "Every frame considered"

Prabu's work moves between three formats: screens, identities and moving pictures. What connects them is **frames**: a screen, a logo lockup and a keyframe are each a composed rectangle. The site treats each project as a frame and uses **type that moves** (variable width) as the signature, because a motion designer should be able to make letters perform.

**The one bold move:** the hero name is set in a variable-width typeface. On load, the letters expand from compressed to their resting width in one orchestrated sequence, and they respond subtly to pointer position on desktop. Everything around it stays quiet.

### Tokens

**Colour**

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#ECEEF1` | Light page background (cool grey, deliberately not cream) |
| `--ink` | `#16182E` | Text and the dark (video) theme background — deep indigo ink, not tinted black |
| `--indigo` | `#4A3FE0` | Brand + interactive (links, focus, the "D") — continuity with the old purple |
| `--marigold` | `#F0A818` | Single highlight, used sparingly (play buttons, active marks). Marigold is everyday colour in Tamil Nadu. |
| `--slate` | `#5B6075` | Secondary text |
| `--mist` | `#C9CDD8` | Rules and borders |

Contrast (WCAG, computed): ink on paper ≈15.1:1, slate on paper ≈5.4:1, indigo on paper ≈5.8:1, ink on marigold ≈8.9:1. All pass AA for body text.

**Type**

- **Anybody** (variable, `wdth` 50–150, `wght` 100–900) — display and headings. Width is used expressively.
- **Hanken Grotesk** (variable) — body, UI, captions.
- Scale (fluid, ~1.25 ratio at small screens, ~1.333 at large): 0.875 / 1 / 1.25 / 1.6 / 2.2 / 3.2 / 5 rem, plus a clamp()ed hero size.
- Body 17–18px, line-height 1.6, measure ≤ 70ch.
- Sentence case everywhere. No all-caps labels, no eyebrows, no mono.

**Layout**

- 12-column grid, `max-width: 1440px`, gutters `clamp(16px, 4vw, 56px)`.
- Left-aligned text; images allowed to break the grid.
- Mixed-ratio galleries: each section picks a composition (wide pair, tall + stack, filmstrip, contact sheet).
- Numbering only where content is a sequence: the design process and the career timeline.

**Motion**

- One orchestrated hero sequence per page.
- Images reveal with a clip-path wipe as they enter the viewport (once).
- Hover: image scale 1.03 + caption shift; buttons fill from the left.
- Cross-document View Transitions between pages (progressive enhancement).
- Header hides on scroll down, returns on scroll up; animated active-page indicator.
- `prefers-reduced-motion`: all of the above off; content fully visible.

### Revision: glossy 3D (requested by Prabu)

Feedback was that the site felt too plain. The direction moved toward a glossy, tactile 3D look, in the spirit of Spline-style character portfolios, Bruno Simon's playful 3D and Lusion's glossy WebGL work. It stays in the same palette and type system:

- **Signature:** Prabu's vector portrait rebuilt as a glossy 3D head that watches the visitor (Three.js), on an indigo orb with a marigold ring.
- **Depth:** an extruded 3D edge on the hero name, soft coloured light in the background, and layered shadows with 14–20px rounded corners on every image.
- **Gloss:** a frosted-glass floating header, lens-highlight buttons, glass panels for services, tools and facts, and metallic marigold play buttons.
- **Motion:** pointer tilt with a moving glare on project images, and fanned 3D card stacks on the discipline thumbnails.

The earlier "avoid glassmorphism" principle is superseded by this request. Restraint still applies: one 3D object, and glass only on supporting panels, never on the work itself.

## 4. Technical decision

The existing site is static HTML/CSS/JS on Netlify. This machine has **no Node.js**, so Next.js cannot be built or tested here, and the brief says not to add a complex stack for show. Decision: **rebuild as a hand-authored static site** — semantic HTML pages, one CSS file with tokens, one small vanilla JS module, zero runtime dependencies, Google Fonts only. Deploys to Netlify by drag-and-drop or Git with no build step. Can be ported to Next.js later; content is structured so that move is mechanical.

## 5. Page plan

- **Home** (light): hero wordmark + statement + 2 CTAs + drifting filmstrip of real work; introduction; three disciplines; featured work; services; experience timeline; skills & tools; about; contact; footer.
- **UI/UX Design** (light): hero with large dashboard frame; approach; selected projects; full case studies (Log2Base2 platform, learner dashboard, video learning page) + shorter case studies; process (numbered — it is a sequence); tools; CTA.
- **Graphic Design** (light, editorial): hero; intro; branding & identity; logo design; marketing creatives; social media; print & advertising (3D posters); creative campaign (the Monkey campaign); selected projects; CTA.
- **Video & Animation** (dark, cinematic): hero with muted preview loop; showreel; editing; motion graphics; 2D & 3D; explainers; promotional; storytelling (making of the Monkey ad); tools; CTA.
