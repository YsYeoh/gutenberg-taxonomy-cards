<?php
/**
 * Plugin Name:       Gutenberg Taxonomy Cards
 * Description:       A set of Gutenberg blocks that dynamically display taxonomy terms, posts, and authors from the REST API as responsive cards. No server-side rendering.
 * Version:           1.3.0
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
 * Registers every block built into build/<block-name>/block.json.
 * Editor and view scripts/styles are pulled entirely from each block.json —
 * there is no render_callback, so the frontend markup and data are produced
 * client-side by each block's view.js. New blocks just need a new build/
 * subfolder; nothing here has to change to pick them up.
 */
function gutenberg_taxonomy_cards_init() {
	foreach ( glob( __DIR__ . '/build/*/block.json' ) as $block_metadata_file ) {
		register_block_type( dirname( $block_metadata_file ) );
	}
}
add_action( 'init', 'gutenberg_taxonomy_cards_init' );
