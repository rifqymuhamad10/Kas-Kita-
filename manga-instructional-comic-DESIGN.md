# Design System: Manga Instructional Comic

## 1. Definição do Estilo

- **Nome:** Manga Instructional Comic
- **Tipo:** Energetic, Expressive, Narrative
- **Keywords:** manga, comic, japanese, black and white, speed lines, ink, action, panel
- **Era:** Modern Manga
- **Light/Dark:** ✓ Full / ✗ No

## 2. Paleta de Cores

- **Primárias:** Background #FFFFFF, Text #000000, Accent #1A1A1A
- **Secundárias:** Screen Tone #CCCCCC, Speed Line #000000, Paper White #FFFFFF

## 3. Efeitos Visuais

Dynamic comic paneling, speed lines (beta flash), impact bursts, expressive character acting, traditional ink aesthetics, halftone screentones.

## 4. AI Prompt Keywords

manga style landing page, black and white comic, speed lines, dynamic panels, ink aesthetic, instructional comic design.

## 5. CSS Technical

```css
background-color: #FFFFFF; color: #000000; font-family: 'Manga Temple', sans-serif; border: 2px solid #000000; clip-path: polygon(0 0, 100% 0, 95% 100%, 5% 100%);
```

## 6. Design System Variables

```css
--manga-white: #FFFFFF, --manga-black: #000000, --tone-grey: #CCCCCC, --font-manga: sans-serif, --speed-line: repeating-linear-gradient(45deg, #000, transparent 2px)
```

## 7. Checklist de Implementação

- ☐ Black and White dominant
- ☐ Manga style speed lines
- ☐ Angled/Dynamic panels
- ☐ Screentone textures
- ☐ Sound effect graphics (text)

## 8. Visual Theme & Atmosphere

Manga Instructional Comic — Design pop culture com manga, comic, japanese. Template e prompt pronto para IA. Estilo Manga Instructional Comic representa uma tendência moderna em design UI/UX web com foco em pop culture.

- Density: 5/10 — Balanced
- Variance: 7/10 — Dynamic
- Motion: 4/10 — Subtle

## 9. Color Palette & Roles

- **Background** (#FFFFFF) — Primary background surface
- **Text** (#000000) — Primary text color
- **Accent** (#1A1A1A) — Primary accent, CTAs and interactive elements
- **Screen Tone** (#CCCCCC) — Extended palette, decorative use
- **Speed Line** (#000000) — Extended palette, decorative use
- **Paper White** (#FFFFFF) — Secondary surface

## 10. Typography Rules

- **Display / Hero:** Manga Temple — Weight 700, tight tracking, used for headline impact
- **Body:** Manga Temple — Weight 400, 16px/1.6 line-height, max 72ch per line
- **UI Labels / Captions:** Manga Temple — 0.875rem, weight 500, slight letter-spacing
- **Monospace:** JetBrains Mono — Used for code, metadata, and technical values

Scale:
- Hero: clamp(2.5rem, 5vw, 4rem)
- H1: 2.25rem
- H2: 1.5rem
- Body: 1rem / 1.6
- Small: 0.875rem

## 11. Component Stylings

- **Primary Button:** Subtly rounded (0.5rem) shape. Accent color fill. Hover: 8% darken + subtle lift shadow. Active: -1px translate tactile press. Font weight 600. No outer glows.
- **Secondary / Ghost Button:** Outline variant. 1.5px border in muted color. Text in primary color. Hover: subtle background fill.
- **Cards:** Subtly rounded (0.5rem) corners. Surface background. Subtle shadow (0 2px 12px rgba(0,0,0,0.06)). 1px border stroke.
- **Inputs:** Label above input. 1px border stroke. Focus ring: 2px accent color offset 2px. Error text below in semantic red. No floating labels.
- **Navigation:** Primary surface background. Active item: accent color indicator. Font weight 500 when active.
- **Skeletons:** Shimmer animation matching component dimensions. No circular spinners.
- **Empty States:** Icon-based composition with descriptive text and action button.

## 12. Layout Principles

- **Grid:** CSS Grid primary. Max-width containment: 1280px centered with 1.5rem side padding.
- **Spacing rhythm:** Balanced. Base unit: 0.5rem (8px).
- **Section vertical gaps:** clamp(4rem, 8vw, 8rem).
- **Hero layout:** Asymmetric composition.
- **Feature sections:** Asymmetric grid with varied card sizes. No 3-equal-columns.
- **Mobile collapse:** All multi-column layouts collapse below 768px. No horizontal overflow.
- **z-index contract:** base (0) / sticky-nav (100) / overlay (200) / modal (300) / toast (500).

## 13. Motion & Interaction

- **Physics:** Ease-out curves, 200-300ms duration. Smooth and predictable.
- **Entry animations:** Fade + translate-Y (16px → 0) over 420ms ease-out. Staggered cascades for lists: 80ms between items.
- **Hover states:** Subtle color shift + shadow adjustment over 200ms.
- **Page transitions:** Fade only (200ms).
- **Performance:** Only transform and opacity animated. No layout-triggering properties.

## 14. Anti-Patterns (Banned)

- No emojis in UI — use icon system only (Lucide, Heroicons)
- No pure black (#000000) — use off-black or charcoal variants
- No oversaturated accent colors (saturation cap: 80%)
- No 3-column equal-width feature layouts — use zig-zag or asymmetric grid
- No `h-screen` — use `min-h-[100dvh]`
- No AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen"
- No broken external image links — use picsum.photos or inline SVG
- No generic lorem ipsum in demos

## Contexto Histórico

Estilo Manga Instructional Comic representa uma tendência moderna em design UI/UX web com foco em pop culture.

## Caso de Uso

Landing pages, Websites modernas
