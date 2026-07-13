<?php
/**
 * Plugin Name:       Gutenberg Taxonomy Cards
 * Description:       Gutenberg block that dynamically displays any taxonomy's terms from the REST API as responsive cards. No server-side rendering.
 * Version:           0.5.0
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * Author:            Yongsen
 * License:           MIT
 * Text Domain:       gutenberg-taxonomy-cards
 *
 * @package GutenbergTaxonomyCards
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
function gutenberg_taxonomy_cards_init() {
	register_block_type( __DIR__ . '/build' );
}
add_action( 'init', 'gutenberg_taxonomy_cards_init' );
