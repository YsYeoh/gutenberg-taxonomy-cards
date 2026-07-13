/**
 * Frontend hydration for the Featured Post block.
 *
 * save.js only outputs a static placeholder (no PHP rendering, so no
 * server-fetched data can be baked in). This script fetches the live post
 * on every page load and builds the card in the browser, so title/image/
 * excerpt/author/date are always current.
 */

const BLOCK_SELECTOR = '.wp-block-gutenberg-taxonomy-cards-featured-post';

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

function renderMessage( el, message ) {
	el.textContent = '';
	const p = document.createElement( 'p' );
	p.className = 'wp-block-featured-post__message';
	p.textContent = message;
	el.appendChild( p );
}

function renderCard( post, el ) {
	const showImage = el.dataset.showImage !== 'false';
	const showExcerpt = el.dataset.showExcerpt !== 'false';
	const showAuthor = el.dataset.showAuthor !== 'false';
	const showDate = el.dataset.showDate !== 'false';
	const showCta = el.dataset.showCta === 'true';
	const layout = el.dataset.layout || 'stacked';

	const card = document.createElement( 'a' );
	card.className = `wp-block-featured-post__card is-animation-${
		el.dataset.hoverAnimation || 'lift'
	} is-layout-${ layout }`;
	card.href = post.link;

	if ( showImage ) {
		const imageUrl =
			post._embedded?.[ 'wp:featuredmedia' ]?.[ 0 ]?.source_url;
		const image = document.createElement( 'div' );
		if ( imageUrl ) {
			image.className = 'wp-block-featured-post__image';
			image.style.backgroundImage = `url(${ imageUrl })`;
		} else {
			image.className = 'wp-block-featured-post__image is-placeholder';
		}
		card.appendChild( image );
	}

	const content = document.createElement( 'div' );
	content.className = 'wp-block-featured-post__content';

	const title = document.createElement( 'h3' );
	title.className = 'wp-block-featured-post__title';
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
		excerpt.className = 'wp-block-featured-post__description';
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
		meta.className = 'wp-block-featured-post__count';
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
		cta.className = 'wp-block-featured-post__cta';
		cta.textContent = 'Read more';
		content.appendChild( cta );
	}

	card.appendChild( content );

	el.textContent = '';
	el.appendChild( card );
}

async function hydrate( el ) {
	const restBase = el.dataset.postTypeRestBase;
	const mode = el.dataset.postSelectionMode || 'latest';
	const postId = el.dataset.post;

	if ( ! restBase ) {
		renderMessage( el, 'This block has no post type selected yet.' );
		return;
	}
	if ( mode === 'manual' && ! postId ) {
		renderMessage( el, 'This block has no post selected yet.' );
		return;
	}

	try {
		if ( mode === 'latest' ) {
			const response = await fetch(
				`/wp-json/wp/v2/${ restBase }?per_page=1&orderby=date&order=desc&_embed=1`
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
			renderCard( posts[ 0 ], el );
			return;
		}

		const response = await fetch(
			`/wp-json/wp/v2/${ restBase }/${ postId }?_embed=1`
		);
		if ( ! response.ok ) {
			throw new Error(
				`Request failed with status ${ response.status }`
			);
		}
		const post = await response.json();
		renderCard( post, el );
	} catch ( error ) {
		renderMessage( el, 'Unable to load post.' );
	}
}

document.addEventListener( 'DOMContentLoaded', () => {
	document.querySelectorAll( BLOCK_SELECTOR ).forEach( hydrate );
} );
