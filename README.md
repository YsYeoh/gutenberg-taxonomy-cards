# gutenberg-taxonomy-cards

**Gutenberg Taxonomy Cards** is a WordPress plugin containing a Taxonomy Category Cards block. Pick a post type and one of its taxonomies in the block settings, and it dynamically displays that taxonomy's terms from the WordPress REST API as responsive cards — no PHP rendering required, so it works on hosts that only allow plugin uploads (e.g. WordPress.com Premium).

See [`docs/guidance.md`](docs/guidance.md) for the full spec. The plugin source is at the repo root (`gutenberg-taxonomy-cards.php`, `src/`).

## Development

```
npm install
npm start   # watch mode
npm run build
```

See [`CLAUDE.md`](CLAUDE.md) for architecture notes and the full command list.
