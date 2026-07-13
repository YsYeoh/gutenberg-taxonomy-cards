=== Gutenberg Taxonomy Cards ===
Contributors: yongsen
Tags: gutenberg, block, taxonomy, category, cards
Requires at least: 6.5
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 0.7.0
License: MIT
License URI: https://opensource.org/licenses/MIT

Displays any taxonomy's terms from the REST API as responsive cards, with no PHP rendering required.

== Description ==

Gutenberg Taxonomy Cards adds a **Taxonomy Category Cards** block to the block editor. Insert it into any post or page, choose a post type and one of its taxonomies in the block settings, and it dynamically fetches that taxonomy's terms from the WordPress REST API and displays them as a responsive grid of cards — image, name, description, and item count. Each whole card links to the term's archive, so there's no separate click target to hunt for.

Because the block fetches data client-side (in both the editor and on the live frontend) rather than using PHP server-side rendering, it works on hosts that only allow plugin uploads and don't permit custom server code, such as WordPress.com Premium.

Block settings, available in the editor sidebar when the block is selected:

* **Source** — post type, then taxonomy (only taxonomies registered for the chosen post type are offered)
* **Layout** — number of columns (2–4), gap between cards
* **Content** — show/hide image, description, item count, and an optional "View archive" text link inside the card (off by default, since the whole card is already clickable)
* **Query** — hide empty categories, order by name/item count/ID, ascending or descending
* **Style** — card corner radius, image aspect ratio, image fit (cover/contain), and hover animation (Lift/Zoom/Grow/Fade/None)
* **Border & Card Background** — an independent card background color (separate from the container/grid background in the Color panel), plus card border width, style (solid/dashed/dotted), and color
* **Text Style** — independent font size and color for the title, description, and item count
* **Icons** — an optional small image/SVG badge per category (picked from the Media Library), placed in any of the four corners of its image
* **Card Overrides** — per-category border color and hover animation, overriding the shared Border/Style settings for individual categories in the same grid
* Standard WordPress **Color**, **Typography**, and **Spacing** panels — colors, font size/family/line-height, and margin/padding all pull from your active theme's design settings

If a category has no image, a placeholder is shown. If the categories can't be loaded, the block shows "Unable to load categories." If there are no categories, it shows "No {taxonomy} found."

This plugin does not create any taxonomy itself — it displays whatever terms already exist for the taxonomy you select, from any post type on your site.

== Installation ==

1. In your WordPress admin, go to **Plugins → Add New → Upload Plugin**.
2. Choose the plugin zip file and click **Install Now**.
3. Click **Activate**.
4. Edit any post or page, open the block inserter, and add the **Taxonomy Category Cards** block.
5. In the block's Source panel, pick a post type and a taxonomy.

== Frequently Asked Questions ==

= The block shows "No categories found." =

This means the selected taxonomy has no terms yet, or the terms are all marked empty and "Hide empty categories" is enabled in the block's Query settings.

= The block shows "Unable to load categories." =

The REST API request for the selected taxonomy failed. Confirm the taxonomy is registered with `show_in_rest` enabled, and that the REST API is reachable (not blocked by a security plugin or `.htaccess` rule).

= Does this plugin register any taxonomies or post types? =

No. It only reads and displays terms from whichever taxonomy you select in the block's Source panel — that taxonomy must already exist on your site, provided by another plugin or theme.

= Why don't I see any taxonomies after picking a post type? =

The chosen post type has no taxonomies registered with `show_in_rest` enabled, so none are available to select.

= Can I use an SVG as a category icon? =

Yes, as long as your site already allows SVG uploads to the Media Library. WordPress disables SVG uploads by default for security reasons; this plugin doesn't change that setting, so you'll need a plugin like Safe SVG (or a custom `upload_mimes` filter) if you haven't already enabled it.

== Changelog ==

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
