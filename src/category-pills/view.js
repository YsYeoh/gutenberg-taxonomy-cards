/**
 * Frontend hydration for the Category Pills block.
 *
 * save.js only outputs a static placeholder (no PHP rendering, so no
 * server-fetched data can be baked in). This script fetches the live
 * taxonomy data on every page load and builds the pill/list in the
 * browser, so category names/counts are always current.
 */

const BLOCK_SELECTOR = '.wp-block-gutenberg-taxonomy-cards-category-pills';

function buildQuery( el ) {
	const params = new URLSearchParams( {
		per_page: '100',
		orderby: el.dataset.orderBy || 'name',
		order: el.dataset.order || 'asc',
	} );
	if ( el.dataset.hideEmpty === 'true' ) {
		params.set( 'hide_empty', 'true' );
	}
	return params.toString();
}

function renderMessage( el, message ) {
	el.textContent = '';
	const p = document.createElement( 'p' );
	p.className = 'wp-block-category-pills__message';
	p.textContent = message;
	el.appendChild( p );
}

function createItem( category, el ) {
	const showCount = el.dataset.showCount !== 'false';

	const item = document.createElement( 'li' );
	item.className = 'wp-block-category-pills__item';

	const pill = document.createElement( 'a' );
	pill.className = 'wp-block-category-pills__pill';
	pill.href = category.link;
	pill.appendChild( document.createTextNode( category.name ) );

	if ( showCount ) {
		const count = document.createElement( 'span' );
		count.className = 'wp-block-category-pills__count';
		count.textContent = `(${ category.count })`;
		pill.appendChild( count );
	}

	item.appendChild( pill );
	return item;
}

async function hydrate( el ) {
	const restBase = el.dataset.taxonomyRestBase;
	if ( ! restBase ) {
		renderMessage(
			el,
			'This block has no post type/taxonomy selected yet.'
		);
		return;
	}

	try {
		const response = await fetch(
			`/wp-json/wp/v2/${ restBase }?${ buildQuery( el ) }`
		);
		if ( ! response.ok ) {
			throw new Error(
				`Request failed with status ${ response.status }`
			);
		}
		const categories = await response.json();

		if ( ! Array.isArray( categories ) || categories.length === 0 ) {
			renderMessage(
				el,
				`No ${ el.dataset.taxonomyLabel || 'categories' } found.`
			);
			return;
		}

		const list = document.createElement( 'ul' );
		list.className = `wp-block-category-pills__list is-display-${
			el.dataset.displayStyle || 'pills'
		}`;
		categories.forEach( ( category ) =>
			list.appendChild( createItem( category, el ) )
		);

		el.textContent = '';
		el.appendChild( list );
	} catch ( error ) {
		renderMessage( el, 'Unable to load categories.' );
	}
}

document.addEventListener( 'DOMContentLoaded', () => {
	document.querySelectorAll( BLOCK_SELECTOR ).forEach( hydrate );
} );
