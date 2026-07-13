/**
 * Frontend hydration for the Author Cards block.
 *
 * save.js only outputs a static placeholder (no PHP rendering, so no
 * server-fetched data can be baked in). This script fetches the live
 * author list on every page load and builds the card grid in the
 * browser, so name/avatar/bio are always current.
 *
 * `who=authors` is required for the /wp/v2/users endpoint to return
 * results to logged-out visitors — WordPress core only exposes users
 * who have published at least one public post under that parameter,
 * to avoid leaking the full user list to anonymous requests.
 */

const BLOCK_SELECTOR = '.wp-block-gutenberg-taxonomy-cards-author-cards';

function buildQuery( el ) {
	return new URLSearchParams( {
		who: 'authors',
		per_page: el.dataset.perPage || '12',
		orderby: el.dataset.orderBy || 'name',
		order: el.dataset.order || 'asc',
	} ).toString();
}

function createCard( author, el ) {
	const showAvatar = el.dataset.showAvatar !== 'false';
	const showBio = el.dataset.showBio !== 'false';
	const showCta = el.dataset.showCta === 'true';

	const card = document.createElement( 'a' );
	card.className = `wp-block-author-cards__card is-animation-${
		el.dataset.hoverAnimation || 'lift'
	}`;
	card.href = author.link;

	if ( showAvatar ) {
		const avatarUrl =
			author.avatar_urls?.[ '96' ] || author.avatar_urls?.[ '48' ];
		const image = document.createElement( 'div' );
		image.className = 'wp-block-author-cards__image';
		if ( avatarUrl ) {
			image.style.backgroundImage = `url(${ avatarUrl })`;
		}
		card.appendChild( image );
	}

	const content = document.createElement( 'div' );
	content.className = 'wp-block-author-cards__content';

	const title = document.createElement( 'h3' );
	title.className = 'wp-block-author-cards__title';
	title.textContent = author.name;
	if ( el.dataset.titleFontSize ) {
		title.style.fontSize = `${ el.dataset.titleFontSize }px`;
	}
	if ( el.dataset.titleColor ) {
		title.style.color = el.dataset.titleColor;
	}
	content.appendChild( title );

	if ( showBio && author.description ) {
		const bio = document.createElement( 'p' );
		bio.className = 'wp-block-author-cards__description';
		bio.textContent = author.description;
		if ( el.dataset.bioFontSize ) {
			bio.style.fontSize = `${ el.dataset.bioFontSize }px`;
		}
		if ( el.dataset.bioColor ) {
			bio.style.color = el.dataset.bioColor;
		}
		content.appendChild( bio );
	}

	if ( showCta ) {
		const cta = document.createElement( 'span' );
		cta.className = 'wp-block-author-cards__cta';
		cta.textContent = 'View posts';
		content.appendChild( cta );
	}

	card.appendChild( content );
	return card;
}

function renderMessage( el, message ) {
	el.textContent = '';
	const p = document.createElement( 'p' );
	p.className = 'wp-block-author-cards__message';
	p.textContent = message;
	el.appendChild( p );
}

async function hydrate( el ) {
	try {
		const response = await fetch(
			`/wp-json/wp/v2/users?${ buildQuery( el ) }`
		);
		if ( ! response.ok ) {
			throw new Error(
				`Request failed with status ${ response.status }`
			);
		}
		const authors = await response.json();

		if ( ! Array.isArray( authors ) || authors.length === 0 ) {
			renderMessage( el, 'No authors found.' );
			return;
		}

		const grid = document.createElement( 'div' );
		grid.className = 'wp-block-author-cards__grid';
		authors.forEach( ( author ) =>
			grid.appendChild( createCard( author, el ) )
		);

		el.textContent = '';
		el.appendChild( grid );
	} catch ( error ) {
		renderMessage( el, 'Unable to load authors.' );
	}
}

document.addEventListener( 'DOMContentLoaded', () => {
	document.querySelectorAll( BLOCK_SELECTOR ).forEach( hydrate );
} );
