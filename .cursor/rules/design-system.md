# Design System – Drømtorp Awards

## CRITICAL: These values NEVER change
The color palette and fonts are defined in the official Drømtorp Awards Design Manual. Any deviation breaks brand consistency.

## CSS Variables (globals.css)
```css
:root {
  --color-gold:        #C9A84C;
  --color-gold-light:  #E8D5A3;
  --color-gold-deep:   #8B6914;
  --color-black:       #1C1C1C;
  --color-charcoal:    #2D2D2D;
  --color-parchment:   #FAF8F4;
  --color-white:       #FFFFFF;
}
```

## Tailwind Config (extend only, never replace)
Map CSS vars to Tailwind:
```ts
// tailwind.config.ts
colors: {
  gold:       "var(--color-gold)",
  "gold-light": "var(--color-gold-light)",
  "gold-deep": "var(--color-gold-deep)",
  black:      "var(--color-black)",
  charcoal:   "var(--color-charcoal)",
  parchment:  "var(--color-parchment)",
}
```

## Google Fonts Import
```ts
// src/app/layout.tsx
import { Cormorant_Garamond, Montserrat } from "next/font/google";

const cormorant = Cormorant_Garamond({
  weight: ["300"],
  subsets: ["latin"],
  variable: "--font-display",
});

const montserrat = Montserrat({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-body",
});
```

## Common Component Patterns

### Primary Button
```tsx
<button className="bg-gold text-black font-semibold px-6 py-3 rounded-lg hover:bg-gold-deep transition-all duration-200">
  Vote
</button>
```

### Card (dark)
```tsx
<div className="bg-charcoal border border-gold/20 rounded-lg p-6">
  {/* content */}
</div>
```

### Gold Divider
```tsx
<hr className="border-gold/30 my-6" />
```

### Page Background
```tsx
<main className="min-h-screen bg-black text-white">
```

## Typography Classes
- Display: `font-[var(--font-display)] font-light text-6xl text-gold`
- H1: `font-[var(--font-body)] font-semibold text-3xl text-white`
- H2: `font-[var(--font-body)] font-medium text-2xl text-white`
- Body: `font-[var(--font-body)] font-normal text-sm text-parchment`
- Caption: `font-[var(--font-body)] font-light italic text-xs text-gold-light`
