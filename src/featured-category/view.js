/**
 * Frontend hydration for the Featured Category block.
 *
 * save.js only outputs a static placeholder (no PHP rendering, so no
 * server-fetched data can be baked in). This script fetches the live term
 * on every page load and builds the card in the browser, so name/image/
 * description/count are always current.
 */

const BLOCK_SELECTOR = '.wp-block-gutenberg-taxonomy-cards-featured-category';

function renderMessage( el, message ) {
	el.textContent = '';
	const p = document.createElement( 'p' );
	p.className = 'wp-block-featured-category__message';
	p.textContent = message;
	el.appendChild( p );
}

function renderCard( category, el ) {
	const showImage = el.dataset.showImage !== 'false';
	const showDescription = el.dataset.showDescription !== 'false';
	const showCount = el.dataset.showCount !== 'false';
	const showCta = el.dataset.showCta === 'true';
	const layout = el.dataset.layout || 'stacked';

	const card = document.createElement( 'a' );
	card.className = `wp-block-featured-category__card is-animation-${
		el.dataset.hoverAnimation || 'lift'
	} is-layout-${ layout }`;
	card.href = category.link;

	if ( showImage ) {
		const image = document.createElement( 'div' );
		if ( category.z_taxonomy_image_url ) {
			image.className = 'wp-block-featured-category__image';
			image.style.backgroundImage = `url(${ category.z_taxonomy_image_url })`;
		} else {
			image.className =
				'wp-block-featured-category__image is-placeholder';
		}
		card.appendChild( image );
	}

	const content = document.createElement( 'div' );
	content.className = 'wp-block-featured-category__content';

	const title = document.createElement( 'h3' );
	title.className = 'wp-block-featured-category__title';
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
		description.className = 'wp-block-featured-category__description';
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
		count.className = 'wp-block-featured-category__count';
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
		cta.className = 'wp-block-featured-category__cta';
		cta.textContent = 'View archive';
		content.appendChild( cta );
	}

	card.appendChild( content );

	el.textContent = '';
	el.appendChild( card );
}

async function hydrate( el ) {
	const restBase = el.dataset.taxonomyRestBase;
	const term = el.dataset.term;
	if ( ! restBase || ! term ) {
		renderMessage( el, 'This block has no category selected yet.' );
		return;
	}

	try {
		const response = await fetch(
			`/wp-json/wp/v2/${ restBase }/${ term }`
		);
		if ( ! response.ok ) {
			throw new Error(
				`Request failed with status ${ response.status }`
			);
		}
		const category = await response.json();
		renderCard( category, el );
	} catch ( error ) {
		renderMessage( el, 'Unable to load category.' );
	}
}

document.addEventListener( 'DOMContentLoaded', () => {
	document.querySelectorAll( BLOCK_SELECTOR ).forEach( hydrate );
} );
