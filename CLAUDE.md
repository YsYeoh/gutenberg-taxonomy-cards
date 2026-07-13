# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

- `docs/guidance.md` — the original spec, written for a recipe-specific "Recipe Category Cards" block. It's still the source of truth for card design details (4:3 image ratio, 16px radius, hover lift/scale, responsive column counts) and the no-PHP-rendering constraint, but the block has since been generalized beyond recipes — see below.
- The plugin itself, **Gutenberg Taxonomy Cards**, lives at the repo root (`gutenberg-taxonomy-cards.php`, `src/`, `package.json`) — there is no separate plugin subdirectory. The block it registers is **Taxonomy Category Cards**: rather than being hardcoded to a `recipe_category` taxonomy, the editor lets the user pick any post type and any of that post type's taxonomies, so the same block works for categories, tags, or custom taxonomies on any post type.

## Commands (run from the repo root)

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

This is a single Gutenberg block plugin built with `@wordpress/scripts` (webpack-based). The core constraint driving the whole design: **the block must not use PHP rendering** (it needs to run on WordPress.com Premium / other hosts where only plugin uploads are allowed, not arbitrary server code paths), and per the spec it must **dynamically** display categories — so data can't be baked in at save time either. Both the editor and the live frontend fetch terms from the REST API independently, client-side, for whichever taxonomy the user picked:

- **`gutenberg-taxonomy-cards.php`** — the only PHP in the plugin. It just calls `register_block_type( __DIR__ . '/build' )` on `init`. No `render_callback`.
- **`src/block.json`** — block metadata + attributes. `postType`/`taxonomy`/`taxonomyRestBase`/`taxonomyLabel` capture what the user picked in the Source panel (see below); `columns`/`gap`/`showImage`/`showDescription`/`showCount`/`hideEmpty`/`orderBy`/`order`/`cardRadius`/`imageRatio`/`imageFit` are unchanged in spirit from the original recipe-specific version. `showCta` (default `false`) toggles the optional "View archive" text inside the card — the card itself is always a link (see below), so this is off by default. `titleFontSize`/`titleColor`/`descriptionFontSize`/`descriptionColor`/`countFontSize`/`countColor` are per-element style overrides layered on top of the block-wide Color/Typography supports (`0`/`''` mean "not set, use the inherited/theme default" — see below). `categoryIcons` is an object keyed by term ID storing an optional short icon/emoji per term. Block type name is `gutenberg-taxonomy-cards/taxonomy-category-cards` (plugin-slug namespace + specific block name). Lives inside `src/`, not the plugin root — see the entry-point gotcha below.
- **`src/edit.js`** — editor UI. A **Source** panel lets the user pick a post type (`getPostTypes()`) then one of that post type's taxonomies (`getTaxonomies()` filtered by `taxonomyItem.types.includes(postType)`); picking a taxonomy also resolves and stores its `rest_base` (needed by `view.js`'s raw `fetch`, since `core-data` itself resolves taxonomy names to REST routes internally but a vanilla-JS frontend script has to do that itself) and human-readable label (used in `view.js`'s empty-state message). Once a taxonomy is chosen, fetches its terms via `@wordpress/core-data`'s `getEntityRecords( 'taxonomy', taxonomy, query )` through `useSelect`, and renders `InspectorControls` (Source / Layout / Content / Query / Style / Text Style / Icons panels) plus a live preview grid using React. The **Icons** panel only appears once terms have loaded — it lists the currently-fetched categories with a small text input each, writing into the `categoryIcons` attribute.
- **`src/save.js`** — emits only a static placeholder `<div>` with the block's settings serialized as `data-*` attributes (e.g. `data-taxonomy-rest-base`, `data-order-by`, `data-hide-empty`, `data-category-icons` as a JSON string). No category data is ever written into saved post content, so it can't go stale.
- **`src/view.js`** — the frontend hydration script (registered as `viewScript` in block.json, loaded automatically on pages containing the block, no PHP enqueue needed). Deliberately vanilla JS (no React) to keep the frontend payload small: on `DOMContentLoaded` it finds block wrapper elements by class, reads the `data-*` attributes (fetching `/wp-json/wp/v2/{data-taxonomy-rest-base}`, not a hardcoded endpoint), and builds card DOM nodes directly. Handles the required states: no taxonomy configured yet, missing image → `.is-placeholder` box, fetch failure → "Unable to load categories.", empty result → "No {taxonomy label} found."

### Card is a link, not a div

The whole card (`.wp-block-taxonomy-category-cards__card`) is rendered as an `<a href="{category.link}">` in both `edit.js` and `view.js`, so clicking anywhere on the card navigates to the term archive — there is no separate always-on "view" link. The optional `showCta` text (default off) is a plain `<span>`, not its own `<a>`, since nesting an anchor inside another anchor is invalid HTML. In `edit.js` the card's `onClick` calls `event.preventDefault()` so the editor preview doesn't navigate away; the real link only activates on the frontend.
- **`src/style.scss`** (shared editor+frontend) / **`src/editor.scss`** (editor-only overrides, e.g. disabling hover animations in the block editor) — both imported from `src/index.js`. Grid/card layout is driven entirely by CSS custom properties (`--rcc-columns`, `--rcc-gap`, `--rcc-radius`, `--rcc-ratio`) set inline on the block wrapper by both `edit.js` and `save.js`, so layout logic lives once in CSS rather than being duplicated per-renderer.

### Theme-aware styling (Color / Typography / Spacing supports)

`src/block.json` declares native block `supports` for `color` (background, text, gradients), `typography` (fontSize, lineHeight, fontFamily), and `spacing` (margin, padding). This is what puts Color/Typography/Spacing panels in the Inspector — populated from the active theme's `theme.json` palette/font-size/spacing presets — instead of hand-rolled controls, so the block visually matches whatever theme it's installed into. `useBlockProps()` / `useBlockProps.save()` already merge these into the wrapper automatically; no extra plumbing needed in `edit.js`/`save.js`.

The wrapper (`.wp-block-gutenberg-taxonomy-cards-taxonomy-category-cards`) declares real (non-inline) fallback `color`/`background-color` values in `style.scss`. When an editor picks a custom color, WordPress adds an inline style to that same wrapper element, which naturally overrides the stylesheet fallback. Card sub-elements pick this up two different ways:
- Text color cascades for free — `color` is a natively-inherited CSS property, so the stylesheet never hardcodes `color` on `.__title`/`.__description`/`.__count`/`.__cta`; they inherit whatever the wrapper resolves to (de-emphasized text uses `opacity`, not a separate hardcoded gray).
- Background does **not** inherit by default in CSS, so `.__card` explicitly declares `background-color: inherit;` to pull the wrapper's resolved value.
- Font sizes use `em` (relative to the inherited/overridden base), not `rem`, so title/description/count scale together when the block's font size changes.

Don't reintroduce hardcoded hex colors on card sub-elements — it silently breaks this cascade and makes the block ignore the site's theme again.

### Per-element text style overrides

The block-wide Color/Typography supports above set one font size/color for the whole card. The **Text Style** panel in `edit.js` layers per-element overrides on top: `titleFontSize`/`titleColor`, `descriptionFontSize`/`descriptionColor`, `countFontSize`/`countColor`. `0` (font size) and `''` (color) mean "not set" — `edit.js`/`view.js` only apply an inline `style` when the value is truthy, so unset elements fall through to the shared em-based/inherited CSS described above. Follow this same "falsy sentinel → no inline style" pattern for any new per-element style attribute; don't give these a non-empty default or they'll silently override the shared style for every existing block instance.

### Per-term icon badges

`categoryIcons` is a plain `{ [termId]: 'icon text' }` object attribute, edited via the Inspector's **Icons** panel (one `TextControl` per currently-fetched term). This is intentionally block-attribute-only — no term meta, no REST/PHP changes — so it works immediately with any taxonomy but has to be re-entered per block instance if you reuse the block elsewhere. `save.js` serializes it to JSON in `data-category-icons`; `view.js` parses that JSON once per block instance and looks up `icons[category.id]` when building each card. The badge itself (`.wp-block-taxonomy-category-cards__icon`) is absolutely positioned at the bottom-left corner of `.__image`, which is why `.__image` has `position: relative`.

### Build entry-point gotcha

`wp-scripts`'s webpack config auto-detects JS entry points (beyond `index.js`) by scanning `block.json` files **inside the `src/` directory** for `file:` script references (`editorScript`, `script`, `viewScript`). If `block.json` sits at the plugin root instead, `view.js` silently never gets bundled as its own asset — the build "succeeds" but the frontend script is missing. That's why `block.json` lives at `src/block.json` (not the plugin root, despite `docs/guidance.md`'s sketch showing it there) with sibling-relative paths (`file:./index.js`, `file:./view.js`, etc.) that resolve correctly once wp-scripts copies `block.json` into `build/` next to the compiled assets.

### Data shape

Each REST API term looks like this. `z_taxonomy_image_url` is not a WordPress core field — it's specific to whatever plugin registered the taxonomy (originally observed on a recipe plugin's `recipe_category` taxonomy). Since the block now works with arbitrary taxonomies, this field is usually absent, and that's expected — both `edit.js` and `view.js` already treat it as optional and fall back to the placeholder image box.

```ts
interface TaxonomyTerm {
    id: number;
    name: string;
    slug: string;
    description: string;
    count: number;
    link: string;
    z_taxonomy_image_url?: string;   // card image source, if the taxonomy's plugin provides it; absent → placeholder
}
```

## Constraints to preserve when changing this block

- No `render_callback` / server-side rendering — keep data fetching client-side in both `edit.js` and `view.js`.
- No hardcoded taxonomy or post type — always sourced from the user's Source panel selection (`postType`/`taxonomy`/`taxonomyRestBase`/`taxonomyLabel` attributes), never assume `recipe_category` or any other specific taxonomy.
- Keep `view.js` framework-free (no React/`@wordpress/element`) to keep the frontend bundle minimal; `edit.js` can freely use React since it only runs in the editor.
- Preserve the required error/empty states (no taxonomy selected yet, fetch failure, empty result) when touching `view.js` or `edit.js`'s fetch logic.

See `docs/guidance.md` for full card design details (4:3 image ratio, 16px radius, hover lift/scale, responsive column counts) and acceptance criteria.
