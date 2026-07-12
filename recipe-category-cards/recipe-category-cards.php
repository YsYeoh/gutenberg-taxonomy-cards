<?php
/**
 * Plugin Name:       Recipe Category Cards
 * Description:       Gutenberg block that dynamically displays Recipe Categories from the REST API as responsive cards. No server-side rendering.
 * Version:           0.1.0
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * Author:            Yongsen
 * License:           MIT
 * Text Domain:       recipe-category-cards
 *
 * @package RecipeCategoryCards
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Editor and view scripts/styles are pulled entirely from block.json —
 * there is no render_callback, so the frontend markup and data are produced
 * client-side by view.js.
 */
function recipe_category_cards_init() {
	register_block_type( __DIR__ . '/build' );
}
add_action( 'init', 'recipe_category_cards_init' );
