/**
 * Frontend hydration for the Taxonomy Category Cards block.
 *
 * save.js only outputs a static placeholder (no PHP rendering, so no
 * server-fetched data can be baked in). This script fetches the live
 * taxonomy data on every page load and builds the card grid in the browser,
 * so category name/image/count/description are always current.
 */

const BLOCK_SELECTOR =
	'.wp-block-gutenberg-taxonomy-cards-taxonomy-category-cards';

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

function parseIcons( el ) {
	try {
		return JSON.parse( el.dataset.categoryIcons || '{}' );
	} catch ( error ) {
		return {};
	}
}

function createCard( category, el, icons ) {
	const showImage = el.dataset.showImage !== 'false';
	const showDescription = el.dataset.showDescription !== 'false';
	const showCount = el.dataset.showCount !== 'false';
	const showCta = el.dataset.showCta === 'true';

	const card = document.createElement( 'a' );
	card.className = 'wp-block-taxonomy-category-cards__card';
	card.href = category.link;

	if ( showImage ) {
		const image = document.createElement( 'div' );
		if ( category.z_taxonomy_image_url ) {
			image.className = 'wp-block-taxonomy-category-cards__image';
			image.style.backgroundImage = `url(${ category.z_taxonomy_image_url })`;
		} else {
			image.className =
				'wp-block-taxonomy-category-cards__image is-placeholder';
		}
		const icon = icons[ category.id ];
		if ( icon?.url ) {
			const iconBadge = document.createElement( 'img' );
			iconBadge.className = 'wp-block-taxonomy-category-cards__icon';
			iconBadge.src = icon.url;
			iconBadge.alt = '';
			image.appendChild( iconBadge );
		}
		card.appendChild( image );
	}

	const content = document.createElement( 'div' );
	content.className = 'wp-block-taxonomy-category-cards__content';

	const title = document.createElement( 'h3' );
	title.className = 'wp-block-taxonomy-category-cards__title';
	title.textContent = category.name;
	if ( el.dataset.titleFontSize ) {
		title.style.fontSize = `${ el.dataset.titleFontSize }px`;
	}
	if ( el.dataset.titleColor ) {
		title.style.color = el.dataset.titleColor;
	}
	content.appendChild( title );

	if ( showDescription && category.description ) {
		const description = document.createElement( 'p' );
		description.className = 'wp-block-taxonomy-category-cards__description';
		description.textContent = category.description;
		if ( el.dataset.descriptionFontSize ) {
			description.style.fontSize = `${ el.dataset.descriptionFontSize }px`;
		}
		if ( el.dataset.descriptionColor ) {
			description.style.color = el.dataset.descriptionColor;
		}
		content.appendChild( description );
	}

	if ( showCount ) {
		const count = document.createElement( 'span' );
		count.className = 'wp-block-taxonomy-category-cards__count';
		count.textContent = `${ category.count } posts`;
		if ( el.dataset.countFontSize ) {
			count.style.fontSize = `${ el.dataset.countFontSize }px`;
		}
		if ( el.dataset.countColor ) {
			count.style.color = el.dataset.countColor;
		}
		content.appendChild( count );
	}

	if ( showCta ) {
		const cta = document.createElement( 'span' );
		cta.className = 'wp-block-taxonomy-category-cards__cta';
		cta.textContent = 'View archive';
		content.appendChild( cta );
	}

	card.appendChild( content );
	return card;
}

function renderMessage( el, message ) {
	el.textContent = '';
	const p = document.createElement( 'p' );
	p.className = 'wp-block-taxonomy-category-cards__message';
	p.textContent = message;
	el.appendChild( p );
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

		const icons = parseIcons( el );
		const grid = document.createElement( 'div' );
		grid.className = 'wp-block-taxonomy-category-cards__grid';
		categories.forEach( ( category ) =>
			grid.appendChild( createCard( category, el, icons ) )
		);

		el.textContent = '';
		el.appendChild( grid );
	} catch ( error ) {
		renderMessage( el, 'Unable to load categories.' );
	}
}

document.addEventListener( 'DOMContentLoaded', () => {
	document.querySelectorAll( BLOCK_SELECTOR ).forEach( hydrate );
} );
