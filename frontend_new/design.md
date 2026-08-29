# GRIVI — Design Language


A reference for the visual system used on the landing page, so the rest of the app (dashboard,
settings, auth screens, etc.) stays consistent. The direction is **quiet and flat**: near-black
type on white, sparing use of the brand navy, gray canvases instead of bordered/shadowed cards,
and almost no decoration beyond hairline borders.

---

## 1. Color

### Core palette

| Token | Hex | Use |
|---|---|---|
| `ink` | `#14181F` | Primary text, headings, primary buttons, dark sections |
| `body` | `#55606D` | Paragraph copy, secondary text |
| `muted` | `#8A94A3` | Captions, labels, timestamps, placeholder text, eyebrows |
| `line` | `#E7E9EC` | Hairline borders, dividers, table rules |
| `canvas` | `#F6F7F8` | Flat gray section backgrounds and mockup containers |
| `surface` | `#FFFFFF` | Page background, card backgrounds inside a canvas |
| `accent` (brand navy) | `#314259` | Sparing accent: eyebrow labels, one icon per group, links on hover, secondary emphasis |
| `accent-dark` | `#233041` | Rarely used; darker navy if a hover state needs more contrast than ink |

### Status colors (functional only — never decorative)

| Token | Hex | Use |
|---|---|---|
| `success` | `#059669` | Verified states, positive numbers, completed actions |
| `warning` | `#D97706` | Pending states, attention-needed items |
| Info blue | `#2563EB` (Tailwind `blue-600`) | Neutral informational badges (e.g. "Restricted" role tag) |

### Rules for using color

- **Ink, not navy, is the primary action color.** Primary buttons, headings, and the dark
  contrast sections all use `#14181F`. Navy (`#314259`) is the *accent*, not the workhorse —
  it shows up once or twice per section (an eyebrow, one icon, a hover tint), never as a
  dominant fill.
- Backgrounds alternate only between `#FFFFFF` and `#F6F7F8`. No gradients, no tinted section
  backgrounds beyond those two.
- One dark section per major flow (e.g. a trust/controls band) is the acceptable place to invert
  to `#14181F` with white text at ~90% opacity and white/5–10% opacity fills for nested panels.
- Status colors are only ever applied to the thing they describe (a badge, a number, an icon) —
  never as a background wash for a whole card.
- Never communicate state through color alone — pair it with a label or icon (e.g. "✓ Verified",
  not just a green dot).

---

## 2. Typography

**Typeface:** Inter (system-ui / sans-serif fallback stack). One family for everything —
no separate display face. Personality comes from restrained weight and size, not from font
pairing.

```css
font-family: Inter, ui-sans-serif, system-ui, sans-serif;
```

### Weight

- Headings: **600 (semibold)** — never 700/800. This is a deliberate departure from a
  "heavy hero headline" look; it's what keeps the page feeling calm.
- Body copy: **400 (regular)**.
- Labels, badges, table headers: **500–600 (medium/semibold)**, small size compensates for
  the lighter visual weight bolding would add.
- Numbers / data (loan amounts, percentages): use `font-mono` + **600** to distinguish figures
  from prose at a glance.

### Scale

| Role | Size (desktop) | Size (mobile) | Weight | Tracking |
|---|---|---|---|---|
| Hero H1 | 52px | 36–40px | 600 | tight (`tracking-tight`) |
| Section H2 | 34px | 28px | 600 | tight |
| Card / story H3 | 22–24px | 20px | 600 | normal |
| Small heading (H4, card titles) | 14–16px | — | 600 | normal |
| Body / paragraph | 15–16px | — | 400 | normal |
| Small body (mockup UI, table cells) | 11–13px | — | 400–500 | normal |
| Eyebrow / label | 12–13px | — | 400–500 | normal (sentence case, not uppercase) |
| Micro caption (badges, timestamps) | 9–11px | — | 500–600 | uppercase, wide tracking only at this size |

### Line height & measure

- Headings: `1.05–1.1`.
- Body copy: `1.6–1.7`.
- Keep paragraph measure narrow — max-width around `36–42rem` (`max-w-xl`/`max-w-2xl`) so lines
  of body text don't run edge-to-edge even on wide sections.

### Eyebrows — a specific rule

Eyebrows are **sentence case with an optional trailing arrow**, not uppercase tracked labels:

```
Customers →
Controls →
Pricing
```

not:

```
CUSTOMERS
BUILT FOR MODERN PAWN SHOPS
```

Color is always `muted` (`#8A94A3`), occasionally `accent` navy when it needs to tie to a
colored icon nearby.

---

## 3. Layout & spacing

- **Section rhythm:** `py-24` (96px) top/bottom padding for standard sections, `py-28` for
  hero/final-CTA moments. Horizontal padding is a flat `px-6` at all breakpoints; width is
  controlled by an inner `max-w-6xl` (or `max-w-4xl`/`max-w-3xl` for text-only sections)
  container, not by the section itself.
- **Content alignment:** left-aligned, not centered, for hero and most section headers. Centering
  is reserved for short, single-purpose sections (trust strip, pricing, FAQ heading, final CTA).
- **Grids as dividers:** when showing a set of equal cards (value props, audience-fit panels),
  use a CSS grid with a **1px gap filled by the border color** (`bg-[#E7E9EC]` grid background,
  white cells) instead of individual bordered/shadowed cards. This produces hairline separators
  between cards with no doubled-up borders.
- **No shadow-heavy cards.** Default card treatment is a `1px solid #E7E9EC` border, `12–16px`
  radius, no shadow. Reserve a soft shadow (`shadow-[0_8px_24px_rgba(20,24,31,0.08)]`) for the
  rare floating/overlapping element that needs to visually lift off the canvas behind it (e.g. a
  callout card overlapping a mockup).
- **Mockup containers:** any product screenshot/mockup lives inside a flat gray canvas
  (`bg-[#F6F7F8]`, `rounded-2xl`, generous padding `p-6` to `p-14`), with the mockup itself as a
  white-bordered inner panel. The gray canvas is what reads as "framing," not a border or shadow
  on the mockup itself.

---

## 4. Borders & radius

| Element | Radius |
|---|---|
| Buttons | `8px` (`rounded-lg`) |
| Cards, panels, inputs | `12px` (`rounded-xl`) |
| Large containers (hero canvas, final CTA block) | `16–24px` (`rounded-2xl` / `rounded-3xl`) |
| Badges/pills | full (`rounded-full`) |

Borders are always `1px solid #E7E9EC` (or `white/10` on dark sections). Never increase border
weight for emphasis — use color or weight of the content inside instead.

---

## 5. Buttons

| Style | Background | Text | Border | Use |
|---|---|---|---|---|
| Primary | `#14181F` | white | none | Main conversion action ("Start Free", "Get Started") |
| Primary (hover) | `#314259` | white | none | — |
| Secondary | transparent / white | `#14181F` | `1px solid #E7E9EC` | Secondary action ("Explore the product") |
| Secondary (hover) | `#F6F7F8` | `#14181F` | same | — |
| On dark section | white | `#14181F` | none | Primary action inside a dark/final-CTA block |
| Ghost link | none | `#55606D` | none, underline on demand | Nav items, footer links |

Padding: `px-5 py-2.5` for standard buttons, text size `14px`, weight `600`. Buttons never use
uppercase text, icons are optional and trail the label (e.g. arrow) rather than lead it.

---

## 6. Iconography

- **Library:** `lucide-react`, stroke width `1.75` for standalone/section icons (slightly lighter
  than the library default of 2), default stroke for small inline icons (16px and under).
- **Size:** 16–20px for inline/label icons, 20–24px for section-level icons.
- **Color:** icons default to `ink` or `muted`; only tint an icon `accent` navy or a status color
  when the icon itself is carrying meaning (e.g. green check = verified).
- Icons are never decorative filler — each one labels a real action or state.

---

## 7. Motion

- Minimal. A single `fadeUp` keyframe (opacity 0→1, translateY 8px→0, ~0.4s ease-out) covers
  tab-switch transitions and on-mount reveals for callout cards.
- Respect `prefers-reduced-motion: reduce` — animations are disabled outright, not just shortened.
- No parallax, no hover scale/bounce on cards, no continuously-looping ambient motion outside of
  the rare small floating callout (and even that should be subtle, ~5s ease-in-out, a few px of
  travel).
- Buttons get a color transition only (`transition-colors`), not a scale or shadow change.

---

## 8. Voice for UI copy

- Sentence case everywhere — labels, buttons, headings. No title case, no all-caps except tiny
  (9–10px) micro-labels like table headers.
- Buttons name the action directly: "Start Free," "Join Early Access," "Export" — not "Submit" or
  "Learn More."
- Empty/loading states describe what's missing and what to do next, in the product's voice, not
  an apologetic one.

---

## 9. Quick-reference token block

```css
:root {
  --ink: #14181F;
  --body: #55606D;
  --muted: #8A94A3;
  --line: #E7E9EC;
  --canvas: #F6F7F8;
  --surface: #FFFFFF;
  --accent: #314259;
  --accent-dark: #233041;
  --success: #059669;
  --warning: #D97706;
  --info: #2563EB;

  --radius-sm: 8px;   /* buttons */
  --radius-md: 12px;  /* cards, inputs */
  --radius-lg: 20px;  /* large containers */

  --font-sans: Inter, ui-sans-serif, system-ui, sans-serif;
}
```

---

## 10. Do / Don't

**Do**
- Use navy as a rare accent, not a dominant fill.
- Keep headings at weight 600, never heavier.
- Frame mockups in a gray canvas, not a shadowed white card.
- Use a 1px shared-border grid for card sets.

**Don't**
- Don't add drop shadows to standard cards.
- Don't use uppercase tracked eyebrows — sentence case + arrow instead.
- Don't introduce a second typeface for headings.
- Don't use color alone to signal status — pair with text or an icon.
- Don't animate on every hover — reserve motion for meaningful transitions (tab switches, entrance
  of a callout).