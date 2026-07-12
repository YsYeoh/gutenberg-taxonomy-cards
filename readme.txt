=== Gutenberg Taxonomy Cards ===
Contributors: yongsen
Tags: gutenberg, block, taxonomy, recipe, cards
Requires at least: 6.5
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 0.1.0
License: MIT
License URI: https://opensource.org/licenses/MIT

Displays Recipe Categories from the REST API as responsive cards, with no PHP rendering required.

== Description ==

Gutenberg Taxonomy Cards adds a **Recipe Category Cards** block to the block editor. Insert it into any post or page and it dynamically fetches your site's Recipe Categories from the WordPress REST API (`/wp-json/wp/v2/recipe_category`) and displays them as a responsive grid of cards — image, name, description, recipe count, and a link to the category archive.

Because the block fetches data client-side (in both the editor and on the live frontend) rather than using PHP server-side rendering, it works on hosts that only allow plugin uploads and don't permit custom server code, such as WordPress.com Premium.

Block settings, available in the editor sidebar when the block is selected:

* **Layout** — number of columns (2–4), gap between cards
* **Content** — show/hide image, description, recipe count
* **Query** — hide empty categories, order by name/recipe count/ID, ascending or descending
* **Style** — card corner radius, image aspect ratio

If a category has no image, a placeholder is shown. If the categories can't be loaded, the block shows "Unable to load recipe categories." If there are no categories, it shows "No recipe categories found."

This plugin does not create the Recipe Categories taxonomy itself — it displays whatever `recipe_category` terms already exist on your site (for example, from a recipe plugin that registers that taxonomy).

== Installation ==

1. In your WordPress admin, go to **Plugins → Add New → Upload Plugin**.
2. Choose the plugin zip file and click **Install Now**.
3. Click **Activate**.
4. Edit any post or page, open the block inserter, and add the **Recipe Category Cards** block.

== Frequently Asked Questions ==

= The block shows "No recipe categories found." =

This means the `recipe_category` taxonomy has no terms yet, or the terms are all marked empty and "Hide empty categories" is enabled in the block's Query settings.

= The block shows "Unable to load recipe categories." =

The REST API request to `/wp-json/wp/v2/recipe_category` failed. Confirm the taxonomy exists, is registered with `show_in_rest` enabled, and that the REST API is reachable (not blocked by a security plugin or `.htaccess` rule).

= Does this plugin register the Recipe Categories taxonomy? =

No. It only reads and displays terms from a `recipe_category` taxonomy that already exists on your site, provided by another plugin or theme.

== Changelog ==

= 0.1.0 =
* Initial release: Recipe Category Cards block with Layout, Content, Query, and Style controls.
