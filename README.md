# gutenberg-taxonomy-cards

A WordPress Gutenberg block, **Recipe Category Cards**, that dynamically displays Recipe Categories from the WordPress REST API as responsive cards — no PHP rendering required, so it works on hosts that only allow plugin uploads (e.g. WordPress.com Premium).

See [`docs/guidance.md`](docs/guidance.md) for the full spec and [`recipe-category-cards/`](recipe-category-cards/) for the plugin source.

## Development

```
cd recipe-category-cards
npm install
npm start   # watch mode
npm run build
```

See [`CLAUDE.md`](CLAUDE.md) for architecture notes and the full command list.
