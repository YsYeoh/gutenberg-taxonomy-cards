=== Gutenberg Taxonomy Cards ===
Contributors: yongsen
Tags: gutenberg, block, taxonomy, posts, cards
Requires at least: 6.5
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.0
License: MIT
License URI: https://opensource.org/licenses/MIT

Five blocks that dynamically display taxonomy terms, posts, and authors from the REST API as responsive cards, with no PHP rendering required.

== Description ==

Gutenberg Taxonomy Cards adds five blocks to the block editor, all fetching data client-side (in both the editor and on the live frontend) rather than using PHP server-side rendering — so they work on hosts that only allow plugin uploads and don't permit custom server code, such as WordPress.com Premium.

= Taxonomy Category Cards =

A responsive grid of **all** terms in a taxonomy you pick (post type → taxonomy). Each card shows an image, name, description, and item count, and links to the term's archive. This is the richest block in the set:

* **Source** — post type, then taxonomy (only taxonomies registered for the chosen post type are offered)
* **Layout** — number of columns (2–4), gap between cards
* **Content** — show/hide image, description, item count, and an optional "View archive" text link inside the card (off by default, since the whole card is already clickable)
* **Query** — hide empty categories, order by name/item count/ID, ascending or descending
* **Style** — card corner radius, image aspect ratio, image fit (cover/contain), and hover animation (Lift/Zoom/Grow/Fade/None)
* **Border & Card Background** — an independent card background color (separate from the container/grid background in the Color panel), plus card border width, style, and color
* **Text Style** — independent font size and color for the title, description, and item count
* **Icons** — an optional small image/SVG badge per category (from the Media Library), placed in any of the four corners of its image
* **Card Overrides** — per-category border color and hover animation, overriding the shared defaults for individual categories in the same grid
* Standard WordPress **Color**, **Typography**, and **Spacing** panels — pull from your active theme's design settings

If a category has no image, a placeholder is shown. If the categories can't be loaded, the block shows "Unable to load categories." If there are no categories, it shows "No {taxonomy} found."

= Post Cards =

A responsive grid of posts from any post type, optionally filtered to one taxonomy term (post type → taxonomy → term). Each card shows a featured image, title, excerpt, author, and date. Includes the same Layout/Style/Border & Card Background/Text Style richness as Taxonomy Category Cards, plus a "Number of posts" and Order by (Date/Title/Menu order) query control.

= Featured Category =

Showcases **one** specific term (post type → taxonomy → term) as a single large callout card, in a Stacked or Horizontal layout — good for "Explore our Desserts" landing-page sections.

= Category Pills =

A lightweight, non-card display of a taxonomy's terms as clickable pills or a plain list — no images, configurable pill color/radius/gap. Good for sidebars and filter bars where a full card grid is too heavy.

= Author Cards =

A responsive grid of site authors (avatar, name, bio) linking to each author's archive. Only shows users who have published at least one public post, matching how WordPress itself decides which authors are safe to expose to anonymous visitors.

This plugin does not create any taxonomies, post types, or users itself — every block only reads and displays what already exists on your site.

== Installation ==

1. In your WordPress admin, go to **Plugins → Add New → Upload Plugin**.
2. Choose the plugin zip file and click **Install Now**.
3. Click **Activate**.
4. Edit any post or page, open the block inserter, and add any of: **Taxonomy Category Cards**, **Post Cards**, **Featured Category**, **Category Pills**, or **Author Cards**.
5. In the block's Source panel, pick a post type and (where applicable) a taxonomy or term.

== Frequently Asked Questions ==

= The block shows "No categories found." =

This means the selected taxonomy has no terms yet, or the terms are all marked empty and "Hide empty categories" is enabled in the block's Query settings.

= The block shows "Unable to load categories." or "Unable to load posts." =

The REST API request failed. Confirm the taxonomy/post type is registered with `show_in_rest` enabled, and that the REST API is reachable (not blocked by a security plugin or `.htaccess` rule).

= Does this plugin register any taxonomies, post types, or users? =

No. Every block only reads and displays content that already exists on your site, provided by WordPress core, your theme, or another plugin.

= Why don't I see any taxonomies after picking a post type? =

The chosen post type has no taxonomies registered with `show_in_rest` enabled, so none are available to select.

= Can I use an SVG as a category icon? =

Yes, as long as your site already allows SVG uploads to the Media Library. WordPress disables SVG uploads by default for security reasons; this plugin doesn't change that setting, so you'll need a plugin like Safe SVG (or a custom `upload_mimes` filter) if you haven't already enabled it.

= Why doesn't Author Cards show a post count per author? =

The WordPress REST API doesn't expose a post count field on user objects, and adding one would require a separate request per author. Each card still links to that author's archive, where the count is visible.

== Changelog ==

= 1.0.0 =
* Added four new blocks alongside the original Taxonomy Category Cards: Post Cards, Featured Category, Category Pills, and Author Cards.
* Extracted the shared card/grid design system into reusable Sass mixins so all card-based blocks share the same look and feel.
* Restructured the plugin to register any number of blocks automatically — no PHP changes needed to add more in the future.

= 0.7.0 =
* The card's own background is now a separate color control from the container/grid background (previously the Color panel's background applied to both, so they couldn't differ).

= 0.6.0 =
* Added a Card Overrides panel: per-category border color and hover animation, so individual categories in the same grid can look/behave differently from the shared defaults.

= 0.5.0 =
* Added a Border panel: card border width, style (solid/dashed/dotted), and color.
* Added a Hover animation option (Lift/Zoom/Grow/Fade/None) in the Style panel.
* Added an Icon position option (bottom-left/bottom-right/top-left/top-right) in the Icons panel.

= 0.4.0 =
* Category icons are now Media Library images/SVGs (picked via a media picker in the Icons panel) instead of typed emoji/text.

= 0.3.0 =
* Cards are now clickable in full, linking to the term archive; the text "View archive" link is optional and off by default.
* Added independent Text Style controls (font size + color) for the title, description, and item count.
* Added an Icons panel to set a small icon/emoji badge per category, shown at the bottom-left of its image.
* Added an image fit option (cover/contain) alongside the existing image aspect ratio control.

= 0.2.0 =
* Generalized the block to any post type/taxonomy via a new Source panel, instead of being hardcoded to a single recipe taxonomy.
* Added Color, Typography, and Spacing block supports so the block follows the active theme's palette, font settings, and spacing scale, plus wide/full alignment.

= 0.1.0 =
* Initial release: Recipe Category Cards block with Layout, Content, Query, and Style controls.
