# gutenberg-taxonomy-cards

**Gutenberg Taxonomy Cards** is a WordPress plugin containing five blocks that dynamically display taxonomy terms, posts, and authors from the WordPress REST API as responsive cards — no PHP rendering required, so it works on hosts that only allow plugin uploads (e.g. WordPress.com Premium).

- **Taxonomy Category Cards** — a grid of all terms in a taxonomy you pick (image, name, description, count, icon badges, per-category overrides)
- **Post Cards** — a grid of posts from any post type, optionally filtered to one taxonomy term (featured image, excerpt, author, date)
- **Featured Category** — a single large callout card for one specific term
- **Category Pills** — a lightweight, non-card list of terms as pills or a plain list
- **Author Cards** — a grid of site authors (avatar, bio, link to their archive)

See [`docs/guidance.md`](docs/guidance.md) for the original spec (written for the first block) and [`CLAUDE.md`](CLAUDE.md) for the full architecture. The plugin source is at the repo root (`gutenberg-taxonomy-cards.php`, `src/`), with one subfolder per block under `src/`.

## Development

```
npm install
npm start   # watch mode
npm run build
```

See [`CLAUDE.md`](CLAUDE.md) for architecture notes and the full command list.
