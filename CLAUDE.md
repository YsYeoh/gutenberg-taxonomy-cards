# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

- `docs/guidance.md` — the original spec, written for a recipe-specific "Recipe Category Cards" block (the first, now called Taxonomy Category Cards). It's still the source of truth for that block's card design details (4:3 image ratio, 16px radius, hover lift/scale, responsive column counts) and the no-PHP-rendering constraint that all blocks in this plugin follow.
- The plugin itself, **Gutenberg Taxonomy Cards**, lives at the repo root (`gutenberg-taxonomy-cards.php`, `src/`, `package.json`) — there is no separate plugin subdirectory. It's a **multi-block plugin**: each block gets its own subfolder under `src/` (`src/<block-name>/block.json`, `index.js`, `edit.js`, `save.js`, `view.js`, `style.scss`, `editor.scss`), and `src/shared/` holds code reused across blocks. Current blocks: `taxonomy-category-cards`, `post-cards`, `featured-post`, `featured-category`, `category-pills`, `author-cards`.

## Commands (run from the repo root)

```
npm install         # install devDependencies (@wordpress/scripts, typescript)
npm run start        # watch mode for local development
npm run build         # production build into build/<block-name>/ per block (block.json, index.js, view.js, CSS)
npm run lint:js       # eslint via wp-scripts
npm run lint:css       # stylelint via wp-scripts
npm run format         # prettier via wp-scripts
npm run plugin-zip      # produce a distributable zip of build/ output for WP plugin upload
```

There is no test runner configured yet. `npm run build` is the closest thing to a correctness check — it must produce a `view` entry alongside `index` for **every** block (see "Build entry-point gotcha" below) and `lint:js`/`lint:css` must be clean before committing.

`typescript` is pinned to `5.9.3` in `devDependencies` — leaving it unpinned resolves to a newer major that crashes `@wordpress/eslint-plugin`'s bundled `@typescript-eslint@6`. Don't remove that pin.

## Architecture

This is a multi-block Gutenberg plugin built with `@wordpress/scripts` (webpack-based). The core constraint driving every block's design: **no PHP rendering** (needs to run on WordPress.com Premium / other hosts where only plugin uploads are allowed, not arbitrary server code paths), and content must be **dynamic** — fetched live from the REST API, never baked into saved post content. Every block's editor and frontend fetch data independently, client-side.

- **`gutenberg-taxonomy-cards.php`** — the only PHP in the plugin. `foreach ( glob( __DIR__ . '/build/*/block.json' ) as $f ) { register_block_type( dirname( $f ) ); }` on `init` — it registers whatever block subfolders exist in `build/`, so adding a new block never requires a PHP change. No `render_callback` anywhere.
- **`src/shared/_grid-card.scss`** — the shared card/grid design system as parameterized Sass mixins (`wrapper-defaults`, `grid-card($prefix)`, `editor-reset($prefix)`), covering grid layout, card box (border/background/shadow/hover-animation variants), image, icon badge, title/description/count/cta text hierarchy. Each block's `style.scss`/`editor.scss` does `@use '../shared/grid-card' as gtc;` then `@include gtc.grid-card('wp-block-<its-own-prefix>')` — this is what keeps 5 of the 6 blocks visually consistent without duplicating ~150 lines of CSS each. `featured-category`, `featured-post`, and `author-cards` layer a few extra rules on top (horizontal layout, circular avatar) after including the mixin. `category-pills` does **not** use this mixin — it's a deliberately different, non-card visual (see its own section below).
- Per-block file roles (same pattern in every block that uses the shared mixin):
  - **`block.json`** — attributes + `supports` (native `color`/`typography`/`spacing`, plus `align: ["wide","full"]`).
  - **`edit.js`** — editor UI: `InspectorControls` panels + a live preview grid using React, fetching via `@wordpress/core-data`'s `useSelect`.
  - **`save.js`** — emits only a static placeholder `<div>` with settings serialized as `data-*` attributes (JSON-stringified for object attributes like per-term maps). No fetched content is ever written into saved post content.
  - **`view.js`** — vanilla JS (no React, keeps the frontend bundle minimal) registered as `viewScript`; on `DOMContentLoaded` reads the wrapper's `data-*` attributes, fetches the REST endpoint, and builds DOM nodes directly.

### The six blocks

- **`taxonomy-category-cards`** (`gutenberg-taxonomy-cards/taxonomy-category-cards`) — the original block. Grid of **all** terms in a taxonomy the user picks (Source panel: post type → taxonomy). The richest block in the plugin — per-element text style, per-category border/animation overrides, per-term icon badges. See the dedicated sections below; everything from "Card is a link, not a div" through "Per-term icon badges" is specific to this block.
- **`post-cards`** (`gutenberg-taxonomy-cards/post-cards`) — grid of posts from a post type the user picks, optionally filtered to one taxonomy term (Source panel: post type → taxonomy → term, all resolved the same way as the taxonomy block). Fetches via `getEntityRecords( 'postType', postType, query )` with `_embed: true` so `post._embedded['wp:featuredmedia'][0].source_url` (featured image) and `post._embedded.author[0].name` (author name) are available without extra requests. The taxonomy-term filter works because the REST API auto-adds a collection param named after the taxonomy's `rest_base` to every post-type endpoint (e.g. `?categories=5`) — `edit.js`/`view.js` build `{ [taxonomyRestBase]: term }` into the query. Sorting/limiting is just the `orderBy`/`order`/`perPage` attributes passed straight into that same query (`orderBy` defaults to `date` and `order` to `desc`, i.e. most-recent-first, with `perPage` defaulting to 6) — there's no separate "sort" mechanism, it's the same REST query params `getEntityRecords`/`fetch` already send. `stripHtml()` (a detached-`<div>`-via-`innerHTML` trick) turns `title.rendered`/`excerpt.rendered` HTML into plain text; safe here because it's the site's own already-KSES-sanitized REST content, not arbitrary user input.
- **`featured-post`** (`gutenberg-taxonomy-cards/featured-post`) — showcases **one specific post** (Source panel: post type → post, the latter populated via `getEntityRecords( 'postType', postType, { per_page: 100, orderby: 'date', order: 'desc' } )` and a `SelectControl` of titles) as a single large callout card, no grid. Fetches the chosen post via `getEntityRecord( 'postType', postType, post, { _embed: true } )` in `edit.js` / `GET /wp/v2/{restBase}/{postId}?_embed=1` in `view.js` for the same featured-image/author data as `post-cards`. Same `stacked`/`horizontal` `layout` attribute and `is-layout-horizontal` modifier class as `featured-category` — content is title/excerpt/author+date meta/CTA (post-cards' fields) rather than name/description/count (taxonomy fields).
- **`featured-category`** (`gutenberg-taxonomy-cards/featured-category`) — same Source cascade as `post-cards` (post type → taxonomy → **one specific term**), but fetches a single record via `getEntityRecord( 'taxonomy', taxonomy, term )` / `GET /wp/v2/{restBase}/{term}` and renders exactly one card, no grid. Adds a `layout` attribute (`stacked`/`horizontal`) via an `is-layout-horizontal` modifier class defined in this block's own `style.scss` on top of the shared mixin — a hero-style side-by-side variant that doesn't make sense for a repeating grid item.
- **`category-pills`** (`gutenberg-taxonomy-cards/category-pills`) — lightweight, **not** a card: a taxonomy's terms as inline pills or a plain vertical list (`displayStyle` attribute), no images, own small CSS (`--rcc-pill-*` custom properties) instead of the shared `_grid-card.scss` mixin, since the visual is fundamentally different (no grid, no image, no border/animation richness — those would be over-engineering for what's meant to be a compact sidebar/filter-bar element).
- **`author-cards`** (`gutenberg-taxonomy-cards/author-cards`) — grid of site authors via `getEntityRecords( 'root', 'user', { who: 'authors', ... } )` / `GET /wp/v2/users?who=authors`. The `who=authors` param is required for the endpoint to return anything to logged-out visitors — WordPress core only exposes users who have published at least one public post under that parameter, specifically to avoid leaking the full user list to anonymous requests; both `edit.js`'s core-data query and `view.js`'s raw fetch include it. No post-count field is shown, since the REST API doesn't expose one for users (would require an N+1 `/wp/v2/posts?author=ID` request per card). Reuses the shared `grid-card` mixin but overrides `.__image` to a small centered circle (Gravatar-style avatar) instead of the usual full-width rectangular top image, and adds `align-items:center; text-align:center` to `.__card`.

### Card is a link, not a div

The whole card (`.wp-block-taxonomy-category-cards__card`) is rendered as an `<a href="{category.link}">` in both `edit.js` and `view.js`, so clicking anywhere on the card navigates to the term archive — there is no separate always-on "view" link. The optional `showCta` text (default off) is a plain `<span>`, not its own `<a>`, since nesting an anchor inside another anchor is invalid HTML. In `edit.js` the card's `onClick` calls `event.preventDefault()` so the editor preview doesn't navigate away; the real link only activates on the frontend.

### Theme-aware styling (Color / Typography / Spacing supports)

`src/block.json` declares native block `supports` for `color` (background, text, gradients), `typography` (fontSize, lineHeight, fontFamily), and `spacing` (margin, padding). This is what puts Color/Typography/Spacing panels in the Inspector — populated from the active theme's `theme.json` palette/font-size/spacing presets — instead of hand-rolled controls, so the block visually matches whatever theme it's installed into. `useBlockProps()` / `useBlockProps.save()` already merge these into the wrapper automatically; no extra plumbing needed in `edit.js`/`save.js`.

The wrapper (`.wp-block-gutenberg-taxonomy-cards-taxonomy-category-cards`) declares real (non-inline) fallback `color`/`background-color` values in `style.scss`. When an editor picks a custom color, WordPress adds an inline style to that same wrapper element, which naturally overrides the stylesheet fallback. Card sub-elements pick this up two different ways:
- Text color cascades for free — `color` is a natively-inherited CSS property, so the stylesheet never hardcodes `color` on `.__title`/`.__description`/`.__count`/`.__cta`; they inherit whatever the wrapper resolves to (de-emphasized text uses `opacity`, not a separate hardcoded gray).
- Font sizes use `em` (relative to the inherited/overridden base), not `rem`, so title/description/count scale together when the block's font size changes.

Don't reintroduce hardcoded hex colors on card sub-elements — it silently breaks this cascade and makes the block ignore the site's theme again.

Background is deliberately **not** inherited from the wrapper (see the next section) — the block's native Color panel controls the container/grid background only; the card's own background is a separate control.

### Per-element text style overrides

The block-wide Color/Typography supports above set one font size/color for the whole card. The **Text Style** panel in `edit.js` layers per-element overrides on top: `titleFontSize`/`titleColor`, `descriptionFontSize`/`descriptionColor`, `countFontSize`/`countColor`. `0` (font size) and `''` (color) mean "not set" — `edit.js`/`view.js` only apply an inline `style` when the value is truthy, so unset elements fall through to the shared em-based/inherited CSS described above. Follow this same "falsy sentinel → no inline style" pattern for any new per-element style attribute; don't give these a non-empty default or they'll silently override the shared style for every existing block instance.

### Per-card border, background, and hover animation

Same reasoning as the color-support cascade above: native `border`/`color` block supports would apply to the wrapper (the grid container), not the individual `.__card` boxes, so both border and card background use the same custom-attribute + CSS-custom-property pattern as `cardRadius` instead:
- `borderWidth`/`borderStyle`/`borderColor` become `--rcc-border-width`/`--rcc-border-style`/`--rcc-border-color`, consumed by a single `border: var(...)` declaration on `.__card`. An unset `borderColor` falls back to CSS's own `currentColor` keyword (the resolved text color), not a hardcoded gray.
- `cardBackgroundColor` becomes `--rcc-card-bg`, consumed by `.__card`'s `background-color: var(--rcc-card-bg, inherit)`. This is intentionally decoupled from the wrapper's own background (set via the native Color support) — the container/grid background and the card background are two independent controls (Color panel vs. the Border & Card Background panel's "Card background" swatch). When `cardBackgroundColor` is unset, the `inherit` fallback keeps the old behavior of matching the wrapper's background, so existing block instances don't visually change.

`hoverAnimation` (`lift`/`zoom`/`grow`/`fade`/`none`) picks which `&.is-animation-*:hover` variant rule in `style.scss` applies — the modifier class is computed from the attribute and set directly in `edit.js`'s JSX `className` and `view.js`'s `card.className`, no per-instance inline style needed since it's a fixed set of variants. `editor.scss` disables **all** variants' hover effects in the block editor (there's one `&.is-animation-*:hover` reset per variant, since Sass doesn't have a wildcard class selector) — add a new reset line there if you add another `hoverAnimation` option.

### Per-category overrides (border color, animation)

`categoryBorderColors` and `categoryAnimations` are `{ [termId]: value }` object attributes, edited via the **Card Overrides** panel (same per-term-map pattern as `categoryIcons`), letting individual categories in the same grid override the shared `borderColor`/`hoverAnimation` — e.g. color-coding categories, or giving one category a different hover effect. Both are look-up-with-fallback at render time, not merged into the shared attributes: `edit.js`'s card `style`/`className` and `view.js`'s `createCard()` both compute `categoryBorderColors[id] || borderColor` and `categoryAnimations[id] || hoverAnimation` per card. The border override is applied as an inline `--rcc-border-color` custom property directly on that one card element (overriding the value inherited from the wrapper for just that element); the animation override just picks a different `is-animation-*` class for that card. No CSS changes were needed for either — both reuse the existing shared-attribute CSS mechanisms exactly, just resolved per-category instead of once per block.

### Per-term icon badges

`categoryIcons` is a plain `{ [termId]: { id, url } }` object attribute, edited via the Inspector's **Icons** panel (one Media Library picker — `MediaUpload`/`MediaUploadCheck` from `@wordpress/block-editor` — per currently-fetched term, `allowedTypes={ [ 'image' ] }`). This is intentionally block-attribute-only — no term meta, no REST/PHP changes — so it works immediately with any taxonomy but has to be re-entered per block instance if you reuse the block elsewhere. `save.js` serializes it to JSON in `data-category-icons`; `view.js` parses that JSON once per block instance and looks up `icons[category.id]?.url` when building each card, rendering it as an `<img>`. The badge itself (`.wp-block-taxonomy-category-cards__icon`) is absolutely positioned in one of the four corners of `.__image` via an `iconPosition`-derived `is-position-*` modifier class (same pattern as `hoverAnimation`), which is why `.__image` has `position: relative`. SVG icons require the site to already allow SVG uploads (WordPress disables the `image/svg+xml` mime type by default for security) — this plugin doesn't change that setting.

### Build entry-point gotcha

`wp-scripts`'s webpack config auto-detects JS entry points (beyond `index.js`) by scanning `block.json` files **anywhere inside the `src/` directory** for `file:` script references (`editorScript`, `script`, `viewScript`) — this is exactly what makes the multi-block layout work with zero extra webpack config. If a new block's `block.json` sits at the plugin root or outside `src/` instead, its `view.js` silently never gets bundled as its own asset — the build "succeeds" but the frontend script is missing. Always create new blocks as `src/<block-name>/block.json` with sibling-relative paths (`file:./index.js`, `file:./view.js`, etc.) that resolve correctly once wp-scripts copies each `block.json` into `build/<block-name>/` next to its compiled assets.

### Data shape (taxonomy terms)

Each REST API taxonomy term looks like this (relevant to `taxonomy-category-cards`, `featured-category`, `category-pills`). `z_taxonomy_image_url` is not a WordPress core field — it's specific to whatever plugin registered the taxonomy (originally observed on a recipe plugin's `recipe_category` taxonomy). Since these blocks work with arbitrary taxonomies, this field is usually absent, and that's expected — both `edit.js` and `view.js` treat it as optional and fall back to the placeholder image box.

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

## Constraints to preserve across all blocks

- No `render_callback` / server-side rendering — keep data fetching client-side in both `edit.js` and `view.js`, for every block.
- No hardcoded taxonomy, post type, or post ID — always sourced from that block's Source/Query panel selection, never assumed.
- Keep every `view.js` framework-free (no React/`@wordpress/element`) to keep the frontend bundle minimal; `edit.js` can freely use React since it only runs in the editor.
- Preserve each block's required error/empty states (nothing selected yet, fetch failure, empty result) when touching its `view.js` or `edit.js` fetch logic.
- New blocks should reuse `src/shared/_grid-card.scss`'s mixins unless the visual is genuinely not a card grid (see `category-pills` for when to opt out).

See `docs/guidance.md` for `taxonomy-category-cards`'s full original card design details (4:3 image ratio, 16px radius, hover lift/scale, responsive column counts) and acceptance criteria.
