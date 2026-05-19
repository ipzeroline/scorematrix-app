<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ScoreMatrix Agent Rules

## Start Here

- Read `CODEBASE_INDEX.md` first. Use it as the project map before scanning directories.
- If `node_modules/next/dist/docs/` exists, read the relevant installed Next.js guide before changing App Router, routing, metadata, caching, route handlers, middleware/proxy, config, or Server/Client Component boundaries.
- If `node_modules` is missing, do not guess Next.js version-specific behavior. Inspect local source patterns and `package.json`, then call out that installed docs are unavailable.
- Prefer `rg` and targeted file reads. Avoid broad recursive reads unless the index is stale or the task requires it.

## Project Facts

- Product: ScoreMatrix, a multilingual football prediction/live score/rewards dashboard.
- Stack: Next.js `16.2.6`, React `19.2.4`, TypeScript strict mode, Tailwind CSS v4, `next-intl`, Zustand.
- App Router lives in `src/app`.
- Active global styles are imported from `src/styles/globals.css`; `src/app/globals.css` is not the active root stylesheet.
- Path alias: `@/*` maps to `src/*`.
- Use npm commands because `package-lock.json` is present unless the user explicitly requests another package manager.

## Routing And i18n

- Locale routes live under `src/app/[locale]`.
- Supported locales are `th`, `en`, `lo`, `my`, `km`, `zh`; default locale is `th`.
- Root `/` redirects to `/th`.
- Keep `localePrefix: "always"` and `localeDetection: false` unless the task is explicitly about changing locale behavior.
- For locale pages, follow the existing `params: Promise<{ locale: string }>` pattern.
- Add visible user-facing copy through `src/messages/*.json` or the relevant `src/data/*-page-content.ts` file. Keep all six locales in sync.

## Next.js Boundaries

- Keep pages and layouts as Server Components by default.
- Add `"use client"` only when a component needs browser APIs, hooks, local client state, effects, refs, Zustand hooks, or event handlers.
- Do not import server-only modules into client components.
- Keep fetch caching and revalidation explicit when touching football API or route handlers.
- Use Next.js primitives already used in the repo: `next/link`, `next/navigation`, `Metadata`, `generateMetadata`, and route handlers in `src/app/api/**/route.ts`.

## Data And API

- Prefer existing domain types in `src/types` and data helpers in `src/lib`.
- Football backend access should go through `src/lib/api-football.ts` or `src/lib/football-page-data.ts`.
- Media and flags from football providers should use the existing proxy helpers/routes.
- Mock/static datasets live in `src/data`; do not replace them with new ad hoc data sources unless requested.
- News generation and lookup should go through `src/lib/news-generator.ts`.

## UI And Styling

- Match the existing dark cyber sports dashboard style: dark surfaces with cyan, magenta, green, and gold accents.
- Reuse components from `src/components/ui`, `src/components/shared`, and existing feature folders before creating new primitives.
- Use `lucide-react` icons when adding icon buttons or navigation items.
- Keep layouts responsive for both mobile bottom navigation and desktop sidebar/header.
- Avoid adding new global CSS unless the styling is shared or animation-heavy; prefer local Tailwind classes following existing patterns.

## State

- Zustand stores live in `src/stores`.
- Use store hooks only inside Client Components.
- Do not persist new store shape or change existing mock user economics without checking related points, credits, missions, and rewards flows.

## Editing Discipline

- Keep changes narrowly scoped to the user request.
- Do not rewrite unrelated files, generated data, formatting, or copy.
- Preserve existing user changes in the worktree.
- Update `CODEBASE_INDEX.md` when a change materially affects routing, architecture, data flow, scripts, or key caveats.
- Do not add dependencies unless necessary; if adding one, explain why and update package files through the package manager.

## Validation

- For narrow code changes, run `npm run lint` when dependencies are available.
- Run `npm run build` for route, config, rendering, metadata, API, or Server/Client boundary changes.
- For UI changes, start or use the dev server and verify the relevant route in a browser when practical.
- If validation cannot run because dependencies are missing or network/install approval is needed, state that clearly in the final response.
