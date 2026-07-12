# gutenberg-taxonomy-cards

**Gutenberg Taxonomy Cards** is a WordPress plugin containing a Recipe Category Cards block that dynamically displays Recipe Categories from the WordPress REST API as responsive cards — no PHP rendering required, so it works on hosts that only allow plugin uploads (e.g. WordPress.com Premium).

See [`docs/guidance.md`](docs/guidance.md) for the full spec. The plugin source is at the repo root (`gutenberg-taxonomy-cards.php`, `src/`).

## Development

```
npm install
npm start   # watch mode
npm run build
```

See [`CLAUDE.md`](CLAUDE.md) for architecture notes and the full command list.
