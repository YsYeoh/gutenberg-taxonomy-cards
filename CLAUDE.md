# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

- `docs/guidance.md` — the original spec for the **Recipe Category Cards** Gutenberg block. Source of truth for scope, acceptance criteria, and design details not repeated below.
- `recipe-category-cards/` — the plugin itself (all commands below run from this directory).

## Commands (run inside `recipe-category-cards/`)

```
npm install         # install devDependencies (@wordpress/scripts, typescript)
npm run start        # watch mode for local development
npm run build         # production build into build/ (block.json, index.js, view.js, CSS)
npm run lint:js       # eslint via wp-scripts
npm run lint:css       # stylelint via wp-scripts
npm run format         # prettier via wp-scripts
npm run plugin-zip      # produce a distributable zip of build/ output for WP plugin upload
```

There is no test runner configured yet. `npm run build` is the closest thing to a correctness check — it must produce a `view` entry alongside `index` (see "Build entry-point gotcha" below) and `lint:js`/`lint:css` must be clean before committing.

`typescript` is pinned to `5.9.3` in `devDependencies` — leaving it unpinned resolves to a newer major that crashes `@wordpress/eslint-plugin`'s bundled `@typescript-eslint@6`. Don't remove that pin.

## Architecture

This is a single Gutenberg block plugin built with `@wordpress/scripts` (webpack-based). The core constraint driving the whole design: **the block must not use PHP rendering** (it needs to run on WordPress.com Premium / other hosts where only plugin uploads are allowed, not arbitrary server code paths), and per the spec it must **dynamically** display categories — so data can't be baked in at save time either. Both the editor and the live frontend fetch categories from the REST API (`/wp-json/wp/v2/recipe_category`) independently, client-side:

- **`recipe-category-cards.php`** — the only PHP in the plugin. It just calls `register_block_type( __DIR__ . '/build' )` on `init`. No `render_callback`.
- **`src/block.json`** — block metadata + attributes (columns, gap, showImage, showDescription, showCount, hideEmpty, orderBy, order, cardRadius, imageRatio). Lives inside `src/`, not the plugin root — see the entry-point gotcha below.
- **`src/edit.js`** — editor UI. Fetches taxonomy terms via `@wordpress/core-data`'s `getEntityRecords( 'taxonomy', 'recipe_category', query )` through `useSelect`, renders `InspectorControls` (Layout / Content / Query / Style panels) and a live preview grid using React.
- **`src/save.js`** — emits only a static placeholder `<div>` with the block's settings serialized as `data-*` attributes (e.g. `data-order-by`, `data-hide-empty`). No category data is ever written into saved post content, so it can't go stale.
- **`src/view.js`** — the frontend hydration script (registered as `viewScript` in block.json, loaded automatically on pages containing the block, no PHP enqueue needed). Deliberately vanilla JS (no React) to keep the frontend payload small: on `DOMContentLoaded` it finds block wrapper elements by class, reads the `data-*` attributes, `fetch`es the REST endpoint, and builds card DOM nodes directly. Handles the three required states: missing image → `.is-placeholder` box, fetch failure → "Unable to load recipe categories.", empty result → "No recipe categories found."
- **`src/style.scss`** (shared editor+frontend) / **`src/editor.scss`** (editor-only overrides, e.g. disabling hover animations in the block editor) — both imported from `src/index.js`. Grid/card layout is driven entirely by CSS custom properties (`--rcc-columns`, `--rcc-gap`, `--rcc-radius`, `--rcc-ratio`) set inline on the block wrapper by both `edit.js` and `save.js`, so layout logic lives once in CSS rather than being duplicated per-renderer.

### Build entry-point gotcha

`wp-scripts`'s webpack config auto-detects JS entry points (beyond `index.js`) by scanning `block.json` files **inside the `src/` directory** for `file:` script references (`editorScript`, `script`, `viewScript`). If `block.json` sits at the plugin root instead, `view.js` silently never gets bundled as its own asset — the build "succeeds" but the frontend script is missing. That's why `block.json` lives at `src/block.json` (not the plugin root, despite `docs/guidance.md`'s sketch showing it there) with sibling-relative paths (`file:./index.js`, `file:./view.js`, etc.) that resolve correctly once wp-scripts copies `block.json` into `build/` next to the compiled assets.

### Data shape

```ts
interface RecipeCategory {
    id: number;
    name: string;
    slug: string;
    description: string;
    count: number;
    link: string;
    z_taxonomy_image_url: string;   // card image source; absent → placeholder
}
```

## Constraints to preserve when changing this block

- No `render_callback` / server-side rendering — keep data fetching client-side in both `edit.js` and `view.js`.
- No hardcoded categories — always sourced live from the REST API.
- Keep `view.js` framework-free (no React/`@wordpress/element`) to keep the frontend bundle minimal; `edit.js` can freely use React since it only runs in the editor.
- Preserve the three error/empty states listed above when touching `view.js` or `edit.js`'s fetch logic.

See `docs/guidance.md` for full card design details (4:3 image ratio, 16px radius, hover lift/scale, responsive column counts) and acceptance criteria.
