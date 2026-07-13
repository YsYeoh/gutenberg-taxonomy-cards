/**
 * Frontend hydration for the Post Cards block.
 *
 * save.js only outputs a static placeholder (no PHP rendering, so no
 * server-fetched data can be baked in). This script fetches the live posts
 * on every page load and builds the card grid in the browser, so title/
 * excerpt/image/author/date are always current.
 */

const BLOCK_SELECTOR = '.wp-block-gutenberg-taxonomy-cards-post-cards';

function stripHtml( html ) {
	const div = document.createElement( 'div' );
	div.innerHTML = html;
	return div.textContent || '';
}

function formatDate( dateString ) {
	return new Date( dateString ).toLocaleDateString( undefined, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	} );
}

function buildQuery( el ) {
	const params = new URLSearchParams( {
		per_page: el.dataset.perPage || '6',
		orderby: el.dataset.orderBy || 'date',
		order: el.dataset.order || 'desc',
		_embed: '1',
	} );
	if ( el.dataset.taxonomyRestBase && el.dataset.term ) {
		params.set( el.dataset.taxonomyRestBase, el.dataset.term );
	}
	if ( el.dataset.offset ) {
		params.set( 'offset', el.dataset.offset );
	}
	return params.toString();
}

function createCard( post, el ) {
	const showImage = el.dataset.showImage !== 'false';
	const showExcerpt = el.dataset.showExcerpt !== 'false';
	const showAuthor = el.dataset.showAuthor !== 'false';
	const showDate = el.dataset.showDate !== 'false';
	const showCta = el.dataset.showCta === 'true';

	const card = document.createElement( 'a' );
	card.className = `wp-block-post-cards__card is-animation-${
		el.dataset.hoverAnimation || 'lift'
	}`;
	card.href = post.link;

	if ( showImage ) {
		const imageUrl =
			post._embedded?.[ 'wp:featuredmedia' ]?.[ 0 ]?.source_url;
		const image = document.createElement( 'div' );
		if ( imageUrl ) {
			image.className = 'wp-block-post-cards__image';
			image.style.backgroundImage = `url(${ imageUrl })`;
		} else {
			image.className = 'wp-block-post-cards__image is-placeholder';
		}
		card.appendChild( image );
	}

	const content = document.createElement( 'div' );
	content.className = 'wp-block-post-cards__content';

	const title = document.createElement( 'h3' );
	title.className = 'wp-block-post-cards__title';
	title.textContent = stripHtml( post.title?.rendered || '' );
	if ( el.dataset.titleFontSize ) {
		title.style.fontSize = `${ el.dataset.titleFontSize }px`;
	}
	if ( el.dataset.titleColor ) {
		title.style.color = el.dataset.titleColor;
	}
	content.appendChild( title );

	if ( showExcerpt && post.excerpt?.rendered ) {
		const excerpt = document.createElement( 'p' );
		excerpt.className = 'wp-block-post-cards__description';
		excerpt.textContent = stripHtml( post.excerpt.rendered );
		if ( el.dataset.excerptFontSize ) {
			excerpt.style.fontSize = `${ el.dataset.excerptFontSize }px`;
		}
		if ( el.dataset.excerptColor ) {
			excerpt.style.color = el.dataset.excerptColor;
		}
		content.appendChild( excerpt );
	}

	const metaParts = [];
	const authorName = post._embedded?.author?.[ 0 ]?.name;
	if ( showAuthor && authorName ) {
		metaParts.push( `By ${ authorName }` );
	}
	if ( showDate ) {
		metaParts.push( formatDate( post.date ) );
	}
	if ( metaParts.length ) {
		const meta = document.createElement( 'span' );
		meta.className = 'wp-block-post-cards__count';
		meta.textContent = metaParts.join( ' · ' );
		if ( el.dataset.metaFontSize ) {
			meta.style.fontSize = `${ el.dataset.metaFontSize }px`;
		}
		if ( el.dataset.metaColor ) {
			meta.style.color = el.dataset.metaColor;
		}
		content.appendChild( meta );
	}

	if ( showCta ) {
		const cta = document.createElement( 'span' );
		cta.className = 'wp-block-post-cards__cta';
		cta.textContent = 'Read more';
		content.appendChild( cta );
	}

	card.appendChild( content );
	return card;
}

function renderMessage( el, message ) {
	el.textContent = '';
	const p = document.createElement( 'p' );
	p.className = 'wp-block-post-cards__message';
	p.textContent = message;
	el.appendChild( p );
}

async function hydrate( el ) {
	const restBase = el.dataset.postTypeRestBase;
	if ( ! restBase ) {
		renderMessage( el, 'This block has no post type selected yet.' );
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
		const posts = await response.json();

		if ( ! Array.isArray( posts ) || posts.length === 0 ) {
			renderMessage( el, 'No posts found.' );
			return;
		}

		const grid = document.createElement( 'div' );
		grid.className = 'wp-block-post-cards__grid';
		posts.forEach( ( post ) => grid.appendChild( createCard( post, el ) ) );

		el.textContent = '';
		el.appendChild( grid );
	} catch ( error ) {
		renderMessage( el, 'Unable to load posts.' );
	}
}

document.addEventListener( 'DOMContentLoaded', () => {
	document.querySelectorAll( BLOCK_SELECTOR ).forEach( hydrate );
} );
