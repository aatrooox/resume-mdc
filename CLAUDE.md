# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server on http://localhost:4777
npm run build      # Production build to .output/
npm run generate   # Static pre-rendering (not the primary deployment mode)
npm run preview    # Preview production build locally
```

No test suite or linter is configured.

## Architecture

Nuxt 4 application using `@nuxtjs/mdc` to render markdown with custom Vue components (MDC syntax). The editor is a SPA with a CodeMirror 6 markdown editor on the left and a live-updating A4-page preview on the right.

### Rendering pipeline

1. User writes markdown with MDC block directives (e.g. `::resume-section{title="工作经历"}`) in CodeMirror
2. `composables/useEditor.ts` holds the raw markdown string as shared state
3. `ResumePreview.vue` calls `parseMarkdown()` from `@nuxtjs/mdc/runtime` to get an AST body, then renders it via `<MDCRenderer :body="body" tag="article" />`
4. MDC maps block directive names to Vue components defined in `nuxt.config.ts` under `mdc.components.map` — e.g. `resume-header` → `ResumeHeader.vue`

**Pagination (ResumePreview.vue):** A hidden measurement container (`position: fixed; visibility: hidden`) renders the full AST at A4 width (794px). Double `requestAnimationFrame` waits for MDC custom element rendering, then `getBoundingClientRect().height` on each top-level child determines page breaks. The `body.children` array is sliced into page-sized groups, each rendered in its own visible `.resume-page` div. Pagination re-measures on window resize with a 200ms debounce.

### MDC components (`components/mdc/`)

Each component corresponds to a markdown block directive. They receive props parsed from the directive attributes and render slotted content (the markdown between `:::` open/close tags):

- **ResumeHeader** — name, title, email, phone with a bottom border
- **ResumeSection** — titled section wrapper with a `<slot />` for child content
- **ResumeItem** — titled item with subtitle, date, and body slot
- **SkillTags** — comma-separated string prop rendered as tag pills; deduplicates via `Set`
- **Timeline** — left-bordered container wrapping child items
- **CardGrid** — CSS grid with configurable columns, renders slotted markdown
- **SkillBar, ContactIcons, QuoteBlock, CustomDivider** — simpler presentational components

### Auth

WeChat-compatible OAuth2 flow against `app.nezus.cn`:

- `server/utils/oauth-client.ts` — shared OAuth2 helpers (authorize URL builder, code→token exchange, userinfo fetch). Reusable across Nezus sub-projects.
- `server/utils/session.ts` — JWT session creation/verification using `jose` (HS256, 7-day expiry). Secret from `runtimeConfig.jwtSecret`.
- `GET /api/auth/login` → redirects to Nezus OAuth authorize page
- `GET /api/auth/callback` → exchanges code for token, fetches userinfo, creates JWT session, sets `auth_token` cookie, redirects to `/editor`
- `GET /api/auth/me` → reads `auth_token` cookie, verifies JWT, returns `{ user }` or `{ user: null }`
- `GET /api/auth/logout` → placeholder (clears session server-side)
- `composables/useAuth.ts` — client-side: calls `/api/auth/me` on mount, exposes `user`, `isLoggedIn`, `login()` (redirect), `logout()`

Export buttons in `EditorToolbar.vue` gate on `isLoggedIn` — unauthenticated users see a "请先登录" tip instead of triggering export.

### Export (`composables/useExport.ts`)

- **MD** — creates a Blob from the raw markdown string, triggers download via temporary `<a>` element
- **PDF** — stores markdown content in `localStorage`, opens `/print` in a new window. The print page (`pages/print.vue`) reads localStorage, parses markdown with `parseMarkdown()`, renders via `<MDCRenderer>`, then waits for rendering (nextTick → double rAF → 400ms timeout → nextTick) before calling `window.print()` with `@page { size: A4; margin: 0 }`
- **PNG** — dynamically imports `html2canvas`, hides `.measure-container` elements first (to avoid capturing the measurement overlay), renders the preview DOM to a canvas at 2x scale, converts to PNG blob, triggers download. Requires the `previewRef` template ref on the preview wrapper div

### Templates

Four markdown templates in `/templates/` served via `GET /api/templates/[name]` (reads `.md` files from disk). The editor page loads the template selected via `?template=` query param. Template content is plain markdown with MDC block directives.

### Release workflow

Version management uses `changelogen` (same as the main `nezus` repo). After feature development is complete and tested:

```bash
npm run release:patch   # Bug fixes, minor changes (0.1.0 → 0.1.1)
npm run release:minor   # New features (0.1.0 → 0.2.0)
npm run release:major   # Breaking changes (0.1.0 → 1.0.0)
```

Each bumps the version in `package.json`, generates/updates `CHANGELOG.md` from conventional commits, and creates a git tag. There is no git remote configured for this sub-project, so `--push` is omitted — tags remain local.

### Deployment

After cutting a release, deploy to production with the deploy script:

```bash
bash scripts/deploy-prod.sh
```

Config: `.deploy.prod.env`. This performs a **full replacement** of the production app:

1. Local `npm install` → `npm run build`
2. Packs `.output/server`, `.output/public`, `nitro.json`, `package.json`, `package-lock.json`, `pm2.config.json`, `pm2.preload.cjs`, and `templates/` into a tarball
3. SCP to remote host
4. Remote: unpack, `npm install`, PM2 restart, healthcheck against `/api/health`

PM2 runs in fork mode with `pm2.preload.cjs` as a preload script that parses the `.env` file (supporting `export KEY=VALUE` syntax, quotes, and BOM-stripping) and injects vars into `process.env` before the app starts. The Nuxt dev server port is 4777; production Nitro port is 4787.

### Key patterns

- All state is lifted to `composables/useEditor.ts` (markdown source) and `composables/useAuth.ts` (user session). Pages and components consume these composables rather than prop-drilling.
- MDC component props are always strings (parsed from markdown directive attributes). Components that need numbers (e.g. CardGrid `cols`) cast them at the template level with `:style`.
- The preview operates on the parsed MDC AST (`body`), not on raw HTML. Any content manipulation must work with the AST structure (`{ type: 'root', children: [...] }`).
- `ClientOnly` wraps the entire preview to avoid SSR mismatches — MDC custom elements only render client-side.
