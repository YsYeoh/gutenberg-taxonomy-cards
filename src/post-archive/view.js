/**
 * Frontend hydration for the Post Archive block.
 *
 * save.js only outputs a static placeholder (no PHP rendering, so no
 * server-fetched data can be baked in). This script fetches the taxonomy's
 * terms as a category menu and the post grid, then wires the menu, search
 * box, and "Load more" button so they filter/extend the grid in place —
 * no page reload. All state (selected term, search text, current page,
 * total pages) lives in this function's closures, scoped per block
 * instance, so multiple Post Archive blocks on the same page don't
 * interfere with each other.
 */

const BLOCK_SELECTOR = '.wp-block-gutenberg-taxonomy-cards-post-archive';
const SEARCH_DEBOUNCE_MS = 350;

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

function createCard( post, el ) {
	const showImage = el.dataset.showImage !== 'false';
	const showExcerpt = el.dataset.showExcerpt !== 'false';
	const showAuthor = el.dataset.showAuthor !== 'false';
	const showDate = el.dataset.showDate !== 'false';
	const showCta = el.dataset.showCta === 'true';

	const card = document.createElement( 'a' );
	card.className = `wp-block-post-archive__card is-animation-${
		el.dataset.hoverAnimation || 'lift'
	}`;
	card.href = post.link;

	if ( showImage ) {
		const imageUrl =
			post._embedded?.[ 'wp:featuredmedia' ]?.[ 0 ]?.source_url;
		const image = document.createElement( 'div' );
		if ( imageUrl ) {
			image.className = 'wp-block-post-archive__image';
			image.style.backgroundImage = `url(${ imageUrl })`;
		} else {
			image.className = 'wp-block-post-archive__image is-placeholder';
		}
		card.appendChild( image );
	}

	const content = document.createElement( 'div' );
	content.className = 'wp-block-post-archive__content';

	const title = document.createElement( 'h3' );
	title.className = 'wp-block-post-archive__title';
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
		excerpt.className = 'wp-block-post-archive__description';
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
		meta.className = 'wp-block-post-archive__count';
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
		cta.className = 'wp-block-post-archive__cta';
		cta.textContent = 'Read more';
		content.appendChild( cta );
	}

	card.appendChild( content );
	return card;
}

function renderGridMessage( grid, message ) {
	grid.className = 'wp-block-post-archive__grid';
	grid.textContent = '';
	const p = document.createElement( 'p' );
	p.className = 'wp-block-post-archive__message';
	p.textContent = message;
	grid.appendChild( p );
}

function buildMenu( el, categories, onSelect ) {
	const menu = document.createElement( 'ul' );
	menu.className = 'wp-block-post-archive__menu';

	let activeButton = null;

	function selectTerm( button, termId ) {
		if ( activeButton ) {
			activeButton.classList.remove( 'is-active' );
		}
		button.classList.add( 'is-active' );
		activeButton = button;
		onSelect( termId );
	}

	function addItem( label, termId ) {
		const item = document.createElement( 'li' );
		item.className = 'wp-block-post-archive__menu-item';

		const button = document.createElement( 'button' );
		button.type = 'button';
		button.className = 'wp-block-post-archive__pill';
		button.textContent = label;
		button.addEventListener( 'click', () => selectTerm( button, termId ) );

		item.appendChild( button );
		menu.appendChild( item );
		return button;
	}

	const allButton = addItem( el.dataset.allTermsLabel || 'All', 0 );
	categories.forEach( ( category ) => addItem( category.name, category.id ) );
	allButton.classList.add( 'is-active' );
	activeButton = allButton;

	return menu;
}

function buildSearchInput( el, onSearch ) {
	const input = document.createElement( 'input' );
	input.type = 'search';
	input.className = 'wp-block-post-archive__search';
	input.placeholder = el.dataset.searchPlaceholder || 'Search…';

	let debounceTimer;
	input.addEventListener( 'input', () => {
		clearTimeout( debounceTimer );
		debounceTimer = setTimeout( () => {
			onSearch( input.value.trim() );
		}, SEARCH_DEBOUNCE_MS );
	} );

	return input;
}

async function hydrate( el ) {
	const restBase = el.dataset.postTypeRestBase;
	if ( ! restBase ) {
		el.textContent = '';
		const p = document.createElement( 'p' );
		p.className = 'wp-block-post-archive__message';
		p.textContent = 'This block has no post type selected yet.';
		el.appendChild( p );
		return;
	}

	el.textContent = '';

	// Per-instance state — a fresh page load, or a second Post Archive
	// block elsewhere on the page, always starts unfiltered on page 1.
	let currentTerm = 0;
	let currentSearch = '';
	let currentPage = 1;
	let totalPages = 1;

	const grid = document.createElement( 'div' );
	grid.className = 'wp-block-post-archive__grid';

	const showLoadMore = el.dataset.showLoadMore === 'true';
	let loadMoreWrap = null;
	let loadMoreButton = null;

	function updateLoadMoreVisibility() {
		if ( ! loadMoreWrap ) {
			return;
		}
		loadMoreWrap.hidden = currentPage >= totalPages;
	}

	function buildQuery( page ) {
		const params = new URLSearchParams( {
			per_page: el.dataset.perPage || '9',
			orderby: el.dataset.orderBy || 'date',
			order: el.dataset.order || 'desc',
			page: String( page ),
			_embed: '1',
		} );
		if ( el.dataset.taxonomyRestBase && currentTerm ) {
			params.set( el.dataset.taxonomyRestBase, currentTerm );
		}
		if ( currentSearch ) {
			params.set( 'search', currentSearch );
		}
		return params.toString();
	}

	// Replaces the grid entirely — used on first load and whenever the
	// category or search filter changes, always resetting back to page 1.
	async function fetchAndReplace() {
		currentPage = 1;
		renderGridMessage( grid, 'Loading posts…' );
		if ( loadMoreWrap ) {
			loadMoreWrap.hidden = true;
		}

		try {
			const response = await fetch(
				`/wp-json/wp/v2/${ restBase }?${ buildQuery( 1 ) }`
			);
			if ( ! response.ok ) {
				throw new Error(
					`Request failed with status ${ response.status }`
				);
			}
			totalPages =
				parseInt(
					response.headers.get( 'X-WP-TotalPages' ) || '1',
					10
				) || 1;
			const posts = await response.json();

			if ( ! Array.isArray( posts ) || posts.length === 0 ) {
				renderGridMessage( grid, 'No posts found.' );
				return;
			}

			grid.textContent = '';
			grid.className = 'wp-block-post-archive__grid';
			posts.forEach( ( post ) =>
				grid.appendChild( createCard( post, el ) )
			);
			updateLoadMoreVisibility();
		} catch ( error ) {
			renderGridMessage( grid, 'Unable to load posts.' );
		}
	}

	// Appends the next page of results — used only by "Load more", so
	// existing cards stay in place while more are fetched in behind them.
	async function fetchAndAppend() {
		if ( loadMoreButton ) {
			loadMoreButton.disabled = true;
		}

		try {
			const response = await fetch(
				`/wp-json/wp/v2/${ restBase }?${ buildQuery( currentPage ) }`
			);
			if ( ! response.ok ) {
				throw new Error(
					`Request failed with status ${ response.status }`
				);
			}
			totalPages =
				parseInt(
					response.headers.get( 'X-WP-TotalPages' ) || '1',
					10
				) || 1;
			const posts = await response.json();
			if ( Array.isArray( posts ) ) {
				posts.forEach( ( post ) =>
					grid.appendChild( createCard( post, el ) )
				);
			}
			updateLoadMoreVisibility();
		} catch ( error ) {
			// Leave the results already on the page in place; just stop
			// offering more rather than showing an error under a grid
			// that's otherwise working fine.
			if ( loadMoreWrap ) {
				loadMoreWrap.hidden = true;
			}
		} finally {
			if ( loadMoreButton ) {
				loadMoreButton.disabled = false;
			}
		}
	}

	if ( el.dataset.showSearch === 'true' ) {
		el.appendChild(
			buildSearchInput( el, ( value ) => {
				currentSearch = value;
				fetchAndReplace();
			} )
		);
	}

	if (
		el.dataset.showCategoryMenu === 'true' &&
		el.dataset.taxonomyRestBase
	) {
		try {
			const params = new URLSearchParams( {
				per_page: '100',
				orderby: el.dataset.termOrderBy || 'name',
				order: el.dataset.termOrder || 'asc',
			} );
			const response = await fetch(
				`/wp-json/wp/v2/${ el.dataset.taxonomyRestBase }?${ params }`
			);
			if ( response.ok ) {
				const categories = await response.json();
				if ( Array.isArray( categories ) && categories.length ) {
					el.appendChild(
						buildMenu( el, categories, ( termId ) => {
							currentTerm = termId;
							fetchAndReplace();
						} )
					);
				}
			}
		} catch ( error ) {
			// The category menu is a progressive enhancement — if the
			// terms fail to load, still show the (unfiltered) grid below.
		}
	}

	el.appendChild( grid );

	if ( showLoadMore ) {
		loadMoreWrap = document.createElement( 'div' );
		loadMoreWrap.className = 'wp-block-post-archive__load-more-wrap';
		loadMoreWrap.hidden = true;

		loadMoreButton = document.createElement( 'button' );
		loadMoreButton.type = 'button';
		loadMoreButton.className = 'wp-block-post-archive__load-more';
		loadMoreButton.textContent = el.dataset.loadMoreLabel || 'Load more';
		loadMoreButton.addEventListener( 'click', () => {
			currentPage += 1;
			fetchAndAppend();
		} );

		loadMoreWrap.appendChild( loadMoreButton );
		el.appendChild( loadMoreWrap );
	}

	fetchAndReplace();
}

document.addEventListener( 'DOMContentLoaded', () => {
	document.querySelectorAll( BLOCK_SELECTOR ).forEach( hydrate );
} );
