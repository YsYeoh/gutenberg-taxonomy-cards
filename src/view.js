/**
 * Frontend hydration for the Recipe Category Cards block.
 *
 * save.js only outputs a static placeholder (no PHP rendering, so no
 * server-fetched data can be baked in). This script fetches the live
 * taxonomy data on every page load and builds the card grid in the browser,
 * so category name/image/count/description are always current.
 */

const TAXONOMY_ENDPOINT = '/wp-json/wp/v2/recipe_category';
const BLOCK_SELECTOR = '.wp-block-recipe-category-cards-recipe-category-cards';

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

function createCard( category, el ) {
	const showImage = el.dataset.showImage !== 'false';
	const showDescription = el.dataset.showDescription !== 'false';
	const showCount = el.dataset.showCount !== 'false';

	const card = document.createElement( 'div' );
	card.className = 'wp-block-recipe-category-cards__card';

	if ( showImage ) {
		const image = document.createElement( 'div' );
		if ( category.z_taxonomy_image_url ) {
			image.className = 'wp-block-recipe-category-cards__image';
			image.style.backgroundImage = `url(${ category.z_taxonomy_image_url })`;
		} else {
			image.className =
				'wp-block-recipe-category-cards__image is-placeholder';
		}
		card.appendChild( image );
	}

	const content = document.createElement( 'div' );
	content.className = 'wp-block-recipe-category-cards__content';

	const title = document.createElement( 'h3' );
	title.className = 'wp-block-recipe-category-cards__title';
	title.textContent = category.name;
	content.appendChild( title );

	if ( showDescription && category.description ) {
		const description = document.createElement( 'p' );
		description.className = 'wp-block-recipe-category-cards__description';
		description.textContent = category.description;
		content.appendChild( description );
	}

	if ( showCount ) {
		const count = document.createElement( 'span' );
		count.className = 'wp-block-recipe-category-cards__count';
		count.textContent = `${ category.count } recipes`;
		content.appendChild( count );
	}

	const link = document.createElement( 'a' );
	link.className = 'wp-block-recipe-category-cards__cta';
	link.href = category.link;
	link.textContent = 'Explore Recipes';
	content.appendChild( link );

	card.appendChild( content );
	return card;
}

function renderMessage( el, message ) {
	el.textContent = '';
	const p = document.createElement( 'p' );
	p.className = 'wp-block-recipe-category-cards__message';
	p.textContent = message;
	el.appendChild( p );
}

async function hydrate( el ) {
	try {
		const response = await fetch(
			`${ TAXONOMY_ENDPOINT }?${ buildQuery( el ) }`
		);
		if ( ! response.ok ) {
			throw new Error(
				`Request failed with status ${ response.status }`
			);
		}
		const categories = await response.json();

		if ( ! Array.isArray( categories ) || categories.length === 0 ) {
			renderMessage( el, 'No recipe categories found.' );
			return;
		}

		const grid = document.createElement( 'div' );
		grid.className = 'wp-block-recipe-category-cards__grid';
		categories.forEach( ( category ) =>
			grid.appendChild( createCard( category, el ) )
		);

		el.textContent = '';
		el.appendChild( grid );
	} catch ( error ) {
		renderMessage( el, 'Unable to load recipe categories.' );
	}
}

document.addEventListener( 'DOMContentLoaded', () => {
	document.querySelectorAll( BLOCK_SELECTOR ).forEach( hydrate );
} );
