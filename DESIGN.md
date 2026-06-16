# Design

## Design System

We use a premium, high-performance dark e-sports design system. The visual theme is focused on crisp typography, solid high-contrast elements, and deep black backgrounds with clean border dividers.

## Colors

Our color palette is built around deep dark backgrounds, sleek gray surfaces, and solid accents (emerald green for live status, electric cyan/ice blue for highlights, gold/bronze for rewards, and danger red).

```oklch
/* Background & Surfaces */
--color-bg: oklch(12% 0.01 260);          /* Deep black-slate #07070a */
--color-surface: oklch(16% 0.015 260);     /* Dark gray card #121218 */
--color-elevated: oklch(20% 0.02 260);    /* Lighter dark gray surface #1a1a24 */
--color-border: oklch(24% 0.02 260);      /* Clean gray border #232333 */

/* Typography */
--color-text: oklch(92% 0.01 260);         /* Bright off-white */
--color-text-secondary: oklch(72% 0.02 260); /* Medium gray */
--color-text-muted: oklch(50% 0.02 260);    /* Muted gray */

/* Accents (Solid, high-contrast, no neon glows) */
--color-primary: oklch(65% 0.16 220);     /* Premium ice blue / solid cyan */
--color-success: oklch(65% 0.18 145);     /* E-sports green for live/success */
--color-warning: oklch(75% 0.15 75);      /* Gold/bronze accent */
--color-danger: oklch(60% 0.18 25);       /* Pure sports red */
```

## Typography

- **Primary Font**: `AuraSans` (Noto Sans Thai subset with Latin characters) is used for body, data tables, navigation, and content.
- **Display Font**: `Space_Grotesk` is used for hero headings, large scores, and titles.
- **Base Size**: 17px/18px with a line-height of 1.6 (1.72 for localized Thai/Lao/Myanmar/Khmer layouts).

## Visual Elements

- **Borders**: Sharp 1px solid borders (`--color-border`). Avoid double borders, glows, or wide card borders.
- **Shadows**: Soft, neutral elevation shadows. Completely eliminate neon glows, outer glowing borders, and drop-shadow colors.
- **Animations**: Snap transitions (150ms ease-out) for interactive states. Replace slow neon pulses, scanlines, and animated gradient stripes with clean hover effects.
