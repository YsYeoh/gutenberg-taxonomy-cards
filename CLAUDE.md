# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Status

This repository currently contains only a specification, no implementation yet:

- `README.md` — placeholder (title only)
- `docs/guidance.md` — the full spec for a WordPress Gutenberg block called **Recipe Category Cards**
- `LICENSE` — MIT

There is no `package.json`, `block.json`, `src/`, or `build/` yet. There are no build, lint, or test commands to run because no code exists. When implementation begins, this file should be updated with the actual commands (likely `npm install`, `npm run build`/`start` via `@wordpress/scripts`, and any test runner introduced).

## What's Being Built

Per `docs/guidance.md`, the target is a self-contained Gutenberg block (`recipe-category-cards`) that:

- Fetches WordPress taxonomy terms from `/wp-json/wp/v2/recipe_category?per_page=100` and renders them as responsive cards.
- Must run on WordPress Premium (plugin uploads allowed), which means **it must not require PHP rendering** — it has to be a static/save-markup block (or use `@wordpress/core-data`/`api-fetch` purely client-side), not a dynamic PHP-rendered block.
- Uses the Gutenberg Block API + React + `@wordpress/scripts`.

Planned project layout (not yet created):

```
recipe-category-cards/
├── recipe-category-cards.php   # block registration only, no render callback
├── block.json
├── package.json
├── src/
│   ├── index.js
│   ├── edit.js
│   ├── save.js
│   ├── editor.scss
│   └── style.scss
└── build/
```

### Data shape

Each taxonomy term returned by the REST API is expected to look like:

```ts
interface RecipeCategory {
    id: number;
    name: string;
    slug: string;
    description: string;
    count: number;
    link: string;
    z_taxonomy_image_url: string;   // card image source
}
```

### Key constraints to preserve during implementation

- **No PHP rendering** — the save function must output static markup; data fetching happens client-side (editor + frontend) against the REST API, not via a `render_callback`.
- **No hardcoded categories** — categories must always come from the live REST API.
- Card layout: 4 columns desktop → responsive down to tablet/mobile (single column on mobile), 4:3 image ratio, 16px border radius, hover lift/scale.
- Inspector controls to support: Layout (columns, gap), Content toggles (show image/description/count), Query (hide empty, order by, order), Style (card radius, image ratio).
- Required error/empty states: image missing → placeholder; API failure → "Unable to load recipe categories."; no categories → "No recipe categories found."

See `docs/guidance.md` for the complete phase-by-phase build plan and full acceptance criteria before implementing — it is the source of truth for scope.
