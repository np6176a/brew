# Brew

A journey through coffee, from bean to third wave.

A simple, single-page educational game built with vanilla HTML/CSS/JS.

## Run locally

Just open `index.html` in a browser. No build step, no dependencies.

For a slightly nicer dev experience (live reload, proper file serving):

```bash
# If you have python
python3 -m http.server 8000

# Or with node
npx serve
```

Then visit `http://localhost:8000`.

## Project structure

```
brew/
├── index.html      # All 7 screens, structure
├── styles.css      # Warm cream-and-espresso palette
├── script.js       # Navigation, knowledge checks, brew lab, tasting game
├── images/         # Drop your ChatGPT-generated images here
└── README.md
```

## How it works

- **7 screens**, navigated one at a time via Next/Back buttons or arrow keys
- **Single-page app** — all screens are sections in one HTML file, toggled via JS
- **Progress bar** at the top updates as you advance
- **Two knowledge checks** on screens 3 and 5 (first/third wave)
- **Animated map** on screen 2 showing coffee's spread from Ethiopia
- **Brew Lab** on screen 6 — interactive flavor profile builder with origin/roast/grind/method
- **Tasting match game** on screen 7 — pair vocabulary with descriptions

## Customizing

### Adding your ChatGPT images

Replace the placeholder boxes by editing `index.html`. Find blocks like:

```html
<div class="image-placeholder" data-image="01-origin">
  <span>Image: Kaldi & dancing goats<br/>(replace with ChatGPT output)</span>
</div>
```

Replace with:

```html
<div class="illustration">
  <img src="images/01-origin.png" alt="Kaldi and the dancing goats" />
</div>
```

Then add to `styles.css`:

```css
.illustration { width: 100%; }
.illustration img { width: 100%; height: auto; border-radius: 12px; }
```

### Adjusting the brew lab logic

The flavor profile math is in `script.js` — see `originProfiles`, `roastMods`, `methodMods`. Tweak the numbers to dial in the simulation.

### Adding the HeyGen avatar

For the mini-course requirement, drop a HeyGen video into screen 1 (or any screen). Add to the screen's HTML:

```html
<div class="avatar-block">
  <video controls poster="images/avatar-poster.png">
    <source src="videos/avatar-intro.mp4" type="video/mp4" />
  </video>
</div>
```

## Deploy

Easiest options, all free:

- **GitHub Pages** — push to a repo, enable Pages in settings, done in 2 minutes
- **Netlify Drop** — drag the folder to netlify.com/drop, get a URL instantly
- **Vercel** — `vercel` from the project root, follow prompts

## Assignment alignment

- ✅ 5–7 screens (we have 7)
- ✅ Animated screens (map on screen 2, brew lab interactions on 6, match game on 7)
- ✅ 2 knowledge checks (screens 3 and 5)
- 🔜 Avatar — add HeyGen video (separate deliverable for the mini-course)
- 🔜 30-second promo — separate deliverable
