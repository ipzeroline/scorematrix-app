# ScoreMatrix Next.js Frontend Developer Guide

This file serves as the definitive reference for build scripts, architectural boundaries, styling theme tokens, and developer guidelines for the ScoreMatrix Next.js application.

---

## 🚀 Commands & Scripts

Always use `npm` as the package manager (`package-lock.json` is present).

- **Development Server**: `npm run dev` (Runs the Next.js dev server)
- **Production Build**: `npm run build` (Compiles TypeScript and bundles pages)
- **Production Start**: `npm run start` (Starts next production server on port `7777`)
- **Lint Check**: `npm run lint` (Runs ESLint syntax and type checks)

---

## 🛠️ Technology Stack & Architecture

- **Framework**: Next.js `16.2.6` (App Router under `src/app`)
- **Language**: TypeScript (Strict mode enabled, alias `@/*` -> `src/*`)
- **Library**: React `19.2.4` (Server Component defaults)
- **Styling**: Tailwind CSS `v4` (Imported in `src/styles/globals.css`, **do not use** `src/app/globals.css`)
- **i18n**: `next-intl` (Prefixes routes with locale, e.g. `/th`, `/en`)
- **State Management**: Zustand `v5` (Stores located under `src/stores`)

---

## 🧭 Routing & i18n Boundaries

- **Locale Shell**: All user pages live under `src/app/[locale]`.
- **Supported Locales**: `th` (default), `en`, `lo`, `my`, `km`, `zh`.
- **Redirects**: Root `/` automatically redirects to `/th`.
- **Route Groups**: Used solely for organization (e.g. `(public)` for login/register, `(member)` for protected profiles, `(admin)` for back-office).
- **Translations**: Text must be translated via `src/messages/{locale}.json` keys or `src/data/*-page-content.ts` assets. Keep all six language configurations in sync.

---

## ⚡ React Server & Client Boundaries

- **Default Component State**: Keep pages and layouts as **Server Components** by default to optimize loading and SEO.
- **Client Components (`"use client"`)**: Explicitly add the `"use client"` directive at the top of a file only if the component requires:
  - React Hooks (`useState`, `useEffect`, `useContext`, `useRef`).
  - Browser APIs (e.g., `window`, `document`, `localStorage`).
  - Zustand state hooks (Zustand stores live under `src/stores/`).
  - Native Event Handlers (`onClick`, `onChange`, `onSubmit`).
- **Instant Navigation**: For fast navigations, export `unstable_instant = true` from the route component and wrap it in a React `Suspense` boundary (Refer to `docs/01-app/02-guides/instant-navigation.mdx` under Next.js package docs).

---

## 🎨 Visual System & Tailwind Styling

- **Theme Palette**: Dark cyber-sports aesthetic with curated HSL values:
  - **Background**: Deep dark `#0a0a0f`
  - **Accents**: Cyan (`#22d3ee`), Magenta (`#d946ef`), Green (`#10b981`), Gold (`#f59e0b`)
  - **Glassmorphism**: Use `.glass` classes (`backdrop-filter: blur(...)` combined with translucent borders).
- **Reusable UI Primitives**: Import components from `src/components/ui/` (e.g., `Button`, `Card`, `Badge`, `Modal`) or shared domain components in `src/components/shared/` before writing ad-hoc styles.
- **Icons**: Utilize `lucide-react` icons (e.g. `Timer`, `Search`, `Plus`, `Minus`, `Zap`, `Brain`, `Medal`) to maintain iconography cohesion.

---

## 🗄️ Zustand State Rules

- Stores are located in `src/stores/` (e.g., `user-store.ts`, `checkin-store.ts`, `notification-store.ts`).
- Avoid invoking store hooks inside Server Components. Pass values from layouts/pages into client component props, or access states in client components.
