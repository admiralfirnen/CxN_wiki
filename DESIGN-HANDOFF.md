# CxN Clan Wiki — design language & CSS handoff

This document describes the visual design and CSS conventions of the CxN wiki so another tool or agent can match its look. Primary sources: `css/style.css` (global tokens and shell) and `css/calculator.css` (tool-like panels, inputs, sliders).

---

## 1. Design intent

- **Theme**: Medieval fantasy aligned with a Total Battle–style aesthetic: dark teal stone backgrounds, warm gold/brass accents, burgundy atmospheric hints, cream parchment-style text.
- **Mood**: Heavy panels with depth (layered shadows, inset highlights), metallic gold headings, subtle radial “torchlight” glows—not flat Material UI.

---

## 2. Typography

**Google Fonts** (import is in `css/style.css`):

- **Headings / UI chrome**: `Cinzel` — weights 400, 600, 700. Used for nav links (uppercase, letter-spacing), section titles (`.section-title`, `.card-title`, `.welcome-title`), `.clan-name`, `.unit-label`.
- **Body**: `Crimson Text` — 400/600; italic where appropriate for subtitles.
- **Accent / display** (loaded; use sparingly): `MedievalSharp`.

**Patterns**

- Page titles / hero titles: Cinzel, gold (`--color-gold`), strong multi-layer `text-shadow` and optional glow/shimmer (see `.clan-name` in `style.css`).
- Body: cream (`--color-text`), `line-height` roughly 1.6–2 in framed sections.
- Secondary copy: `--color-text-dim`; italic works for subtitles (e.g. `.calculator-subtitle`).

---

## 3. Color tokens (`:root` in `css/style.css`)

Copy these CSS variables for parity:

| Role | Variables | Hex / notes |
|------|-----------|-------------|
| Background stack | `--color-primary`, `--color-secondary`, `--color-tertiary` | `#192d32`, `#1f3a42`, `#254a54` |
| Gold / brass | `--color-gold`, `--color-gold-light`, `--color-gold-dark`, `--color-brass` | `#d4a574`, `#e8c547`, `#b8941f`, `#c9a961` |
| Burgundy accent | `--color-burgundy`, `--color-wine` | `#8b2635`, `#6b1f2a` |
| Stone / borders | `--color-stone`, `--color-stone-light`, `--color-stone-dark`, `--color-border`, `--color-border-gold` | teal stone family; gold border `#d4a574` |
| Text | `--color-text`, `--color-text-dim`, `--color-text-muted` | cream → dimmer → muted gray-green |
| Links | `--color-link`, `--color-link-visited`, `--color-link-hover`, `--color-link-active` | cobalt blue `#5b9eff` family; glow via `--shadow-link-glow*` |
| Gradients | `--gradient-stone`, `--gradient-gold`, `--gradient-brass`, `--gradient-burgundy` | 135° stone/teal panels; gold/brass metallics |
| Shadows | `--shadow-castle`, `--shadow-text`, `--shadow-gold` | Deep outer + subtle inner highlight |

---

## 4. Page background & atmosphere

- **Base**: `body` uses `--color-primary` plus stacked crosshatch texture (`repeating-linear-gradient`), radial vignettes (gold/burgundy at low opacity), and a vertical linear gradient darkening toward the bottom (`#192d32` → `#0f1f24`).
- **Overlay**: `body::before` adds fixed full-viewport soft radial accents without blocking clicks (`pointer-events: none`, `z-index: 0`).
- **Content**: `.container` — `max-width: 1400px`, horizontal padding `20px`, vertical padding `60px`, `z-index: 1` above atmospheric layers.

---

## 5. Layout & spacing

- **Max content width**: `1400px` for site shell (`.container`, `.nav-wrapper`); calculator-style tools often use `1200px` (`.calculator-wrapper`).
- **Section padding**: Large framed blocks use generous padding (e.g. welcome `50px`, cards `35px`).
- **Border radius**: Panels **12px** (`content-card`, `calculator-section`); smaller chrome **6–8px**; nav pills **4px**.
- **Borders**: Prefer **2px** solid stone border + gold on hover; double borders for ornate frames (e.g. `.welcome-section`).

---

## 6. Component patterns

**Navigation** (`.nav-container`)

- Sticky top bar: `--gradient-stone`, **4px** bottom border `--color-border-gold`, layered box-shadow + inset highlight.
- Links: Cinzel, uppercase, `letter-spacing: 1px`, gold hover with animated gold underline (`::after` scale).

**Cards / panels** (`.content-card`, `.calculator-section`)

- Background: `--gradient-stone`.
- Border: `2px solid var(--color-border)`; hover → `--color-border-gold` and stronger shadow + optional gold rim glow.
- Shadow recipe: large outer shadow + smaller secondary + `inset 0 1px 0 rgba(255,255,255,0.08)` for a beveled stone feel.
- Optional: top gold bar reveal on hover (`.content-card::before`).

**Welcome / prose frame** (`.welcome-section`)

- Double gold border, `border-radius: 16px`, subtle animated radial overlay (`::before`), fine diagonal texture (`::after`).

**Footer** (`.footer`)

- Gradient stone, **4px** gold top border, inset/shadow upward (mirrors the nav).

---

## 7. Forms & tools (`css/calculator.css`)

- **Text inputs** (`.number-input`): background `--color-secondary`, border `2px` `--color-border`, `border-radius: 6px`, Crimson Text, cream text. Focus: gold border, slight gold tint background, soft outer glow.
- **Sliders** (`.slider-input`): track `--color-stone-dark`; thumb gold with `--color-gold-light` border and glow; hover scales thumb.
- **Rows** (`.unit-row`): translucent gold wash `rgba(212,165,116,0.05)`, gold-tint border; hover brightens and slight `translateX(5px)`.
- **Section titles** (`.section-title`): Cinzel `2rem`, gold, bottom border `2px solid var(--color-border-gold)`.

---

## 8. Links (global, excluding nav/logo/special classes)

- Default links: `--color-link`, underlined, `text-underline-offset: 3px`, blue glow (`--shadow-link-glow`), transition to `--color-link-hover` and stronger glow on hover.

---

## 9. Motion & easing

- Common: `transition: all 0.3s ease` or `cubic-bezier(0.4, 0, 0.2, 1)` for hovers.
- Decorative: `@keyframes shimmer` on hero title; `@keyframes rotate` on welcome overlay.

---

## 10. Implementation checklist

1. Import the same **Google Fonts** line as in `css/style.css` (Cinzel, Crimson Text, MedievalSharp).
2. Mirror **`:root`** variables from `style.css`, or load `style.css` directly.
3. Use **cream body text** on **dark teal** backgrounds; **gold** for headings and chrome; **cobalt blue** for inline links with glow—not generic purple visited links.
4. Build surfaces as **gradient-stone panels** with **2px borders**, **12px radius**, **layered shadows** + **inset top highlight**.
5. Keep **max-width ~1400px** centered layout and **20px** horizontal gutter unless a tool specifies otherwise (e.g. 1200px calculator).
6. For forms/tools, follow calculator patterns: gold focus rings, gold slider thumbs, subtle gold row backgrounds.
