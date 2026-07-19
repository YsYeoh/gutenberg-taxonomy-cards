import { __, sprintf } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	useSetting,
} from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	ToggleControl,
	SelectControl,
	TextControl,
	ColorPalette,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

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

export default function Edit( { attributes, setAttributes } ) {
	const {
		postType,
		taxonomy,
		showCategoryMenu,
		allTermsLabel,
		termOrderBy,
		termOrder,
		showSearch,
		searchPlaceholder,
		showLoadMore,
		loadMoreLabel,
		perPage,
		columns,
		gap,
		showImage,
		showExcerpt,
		showAuthor,
		showDate,
		showCta,
		orderBy,
		order,
		cardRadius,
		imageRatio,
		imageFit,
		hoverAnimation,
		borderWidth,
		borderStyle,
		borderColor,
		cardBackgroundColor,
		titleFontSize,
		titleColor,
		excerptFontSize,
		excerptColor,
		metaFontSize,
		metaColor,
		pillGap,
		pillRadius,
		pillBackgroundColor,
		pillTextColor,
	} = attributes;

	// Which category is active, and the current search text, in THIS editor
	// preview only — never saved. The frontend always starts unfiltered
	// ("All", empty search) on page load; there is no notion of a "default"
	// filter state for an archive page.
	const [ selectedTerm, setSelectedTerm ] = useState( 0 );
	const [ searchQuery, setSearchQuery ] = useState( '' );

	const colors = useSetting( 'color.palette' ) || [];

	const postTypes = useSelect(
		( select ) =>
			select( coreStore ).getPostTypes( { per_page: -1 } ) || [],
		[]
	).filter( ( postTypeItem ) => postTypeItem.viewable );

	const taxonomies = useSelect(
		( select ) =>
			select( coreStore ).getTaxonomies( { per_page: -1 } ) || [],
		[]
	);

	const availableTaxonomies = taxonomies.filter( ( taxonomyItem ) =>
		taxonomyItem.types?.includes( postType )
	);

	const categories = useSelect(
		( select ) => {
			if ( ! taxonomy || ! showCategoryMenu ) {
				return [];
			}
			return (
				select( coreStore ).getEntityRecords( 'taxonomy', taxonomy, {
					per_page: 100,
					orderby: termOrderBy,
					order: termOrder,
				} ) || []
			);
		},
		[ taxonomy, showCategoryMenu, termOrderBy, termOrder ]
	);

	const { posts, hasResolved } = useSelect(
		( select ) => {
			if ( ! postType ) {
				return { posts: [], hasResolved: true };
			}
			const taxonomyItem = taxonomies.find(
				( item ) => item.slug === taxonomy
			);
			const query = {
				per_page: perPage,
				orderby: orderBy,
				order,
				_embed: true,
				...( taxonomy && selectedTerm && taxonomyItem?.rest_base
					? { [ taxonomyItem.rest_base ]: selectedTerm }
					: {} ),
				...( searchQuery ? { search: searchQuery } : {} ),
			};
			const selectorArgs = [ 'postType', postType, query ];
			return {
				posts: select( coreStore ).getEntityRecords( ...selectorArgs ),
				hasResolved: select( coreStore ).hasFinishedResolution(
					'getEntityRecords',
					selectorArgs
				),
			};
		},
		[
			postType,
			taxonomy,
			selectedTerm,
			searchQuery,
			perPage,
			orderBy,
			order,
			taxonomies,
		]
	);

	const handlePostTypeChange = ( value ) => {
		const postTypeItem = postTypes.find( ( item ) => item.slug === value );
		setSelectedTerm( 0 );
		setAttributes( {
			postType: value,
			postTypeRestBase: postTypeItem?.rest_base || value,
			taxonomy: '',
			taxonomyRestBase: '',
			taxonomyLabel: '',
		} );
	};

	const handleTaxonomyChange = ( value ) => {
		const taxonomyItem = taxonomies.find( ( item ) => item.slug === value );
		setSelectedTerm( 0 );
		setAttributes( {
			taxonomy: value,
			taxonomyRestBase: taxonomyItem?.rest_base || value,
			taxonomyLabel: taxonomyItem?.name || value,
		} );
	};

	const blockProps = useBlockProps( {
		style: {
			'--rcc-columns': columns,
			'--rcc-gap': `${ gap }px`,
			'--rcc-radius': `${ cardRadius }px`,
			'--rcc-ratio': imageRatio,
			'--rcc-image-fit': imageFit,
			'--rcc-border-width': `${ borderWidth }px`,
			'--rcc-border-style': borderStyle,
			'--rcc-border-color': borderColor || undefined,
			'--rcc-card-bg': cardBackgroundColor || undefined,
			'--rcc-pill-gap': `${ pillGap }px`,
			'--rcc-pill-radius': `${ pillRadius }px`,
			'--rcc-pill-bg': pillBackgroundColor || undefined,
			'--rcc-pill-color': pillTextColor || undefined,
		},
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Source', 'gutenberg-taxonomy-cards' ) }>
					<SelectControl
						label={ __( 'Post type', 'gutenberg-taxonomy-cards' ) }
						value={ postType }
						options={ [
							{
								label: __(
									'Select a post type…',
									'gutenberg-taxonomy-cards'
								),
								value: '',
							},
							...postTypes.map( ( postTypeItem ) => ( {
								label: postTypeItem.name,
								value: postTypeItem.slug,
							} ) ),
						] }
						onChange={ handlePostTypeChange }
					/>
					<SelectControl
						label={ __( 'Taxonomy', 'gutenberg-taxonomy-cards' ) }
						value={ taxonomy }
						disabled={ ! postType }
						options={ [
							{
								label: __(
									'No categories (all posts)',
									'gutenberg-taxonomy-cards'
								),
								value: '',
							},
							...availableTaxonomies.map( ( taxonomyItem ) => ( {
								label: taxonomyItem.name,
								value: taxonomyItem.slug,
							} ) ),
						] }
						onChange={ handleTaxonomyChange }
					/>
				</PanelBody>
				<PanelBody
					title={ __( 'Category Menu', 'gutenberg-taxonomy-cards' ) }
				>
					<ToggleControl
						label={ __(
							'Show category menu',
							'gutenberg-taxonomy-cards'
						) }
						help={ __(
							'A row of clickable categories above the grid that filters it live, with no page reload.',
							'gutenberg-taxonomy-cards'
						) }
						checked={ showCategoryMenu }
						disabled={ ! taxonomy }
						onChange={ ( value ) =>
							setAttributes( { showCategoryMenu: value } )
						}
					/>
					{ showCategoryMenu && (
						<>
							<TextControl
								label={ __(
									'"Show all" label',
									'gutenberg-taxonomy-cards'
								) }
								value={ allTermsLabel }
								onChange={ ( value ) =>
									setAttributes( {
										allTermsLabel: value,
									} )
								}
							/>
							<SelectControl
								label={ __(
									'Order categories by',
									'gutenberg-taxonomy-cards'
								) }
								value={ termOrderBy }
								options={ [
									{ label: __( 'Name' ), value: 'name' },
									{
										label: __( 'Item count' ),
										value: 'count',
									},
									{ label: __( 'ID' ), value: 'id' },
								] }
								onChange={ ( value ) =>
									setAttributes( { termOrderBy: value } )
								}
							/>
							<SelectControl
								label={ __(
									'Category order',
									'gutenberg-taxonomy-cards'
								) }
								value={ termOrder }
								options={ [
									{
										label: __( 'Ascending' ),
										value: 'asc',
									},
									{
										label: __( 'Descending' ),
										value: 'desc',
									},
								] }
								onChange={ ( value ) =>
									setAttributes( { termOrder: value } )
								}
							/>
							<RangeControl
								label={ __(
									'Pill gap (px)',
									'gutenberg-taxonomy-cards'
								) }
								value={ pillGap }
								onChange={ ( value ) =>
									setAttributes( { pillGap: value } )
								}
								min={ 0 }
								max={ 32 }
							/>
							<RangeControl
								label={ __(
									'Pill corner radius (px)',
									'gutenberg-taxonomy-cards'
								) }
								value={ pillRadius }
								onChange={ ( value ) =>
									setAttributes( {
										pillRadius: value || 0,
									} )
								}
								min={ 0 }
								max={ 999 }
							/>
							<p
								style={ {
									fontWeight: 600,
									textTransform: 'uppercase',
									margin: '8px 0 4px',
								} }
							>
								{ __(
									'Pill background',
									'gutenberg-taxonomy-cards'
								) }
							</p>
							<ColorPalette
								colors={ colors }
								value={ pillBackgroundColor }
								onChange={ ( value ) =>
									setAttributes( {
										pillBackgroundColor: value || '',
									} )
								}
								clearable
							/>
							<p
								style={ {
									fontWeight: 600,
									textTransform: 'uppercase',
									margin: '8px 0 4px',
								} }
							>
								{ __(
									'Pill text color',
									'gutenberg-taxonomy-cards'
								) }
							</p>
							<ColorPalette
								colors={ colors }
								value={ pillTextColor }
								onChange={ ( value ) =>
									setAttributes( {
										pillTextColor: value || '',
									} )
								}
								clearable
							/>
						</>
					) }
				</PanelBody>
				<PanelBody title={ __( 'Search', 'gutenberg-taxonomy-cards' ) }>
					<ToggleControl
						label={ __(
							'Show search box',
							'gutenberg-taxonomy-cards'
						) }
						help={ __(
							'A text search above the grid, combined with the active category filter.',
							'gutenberg-taxonomy-cards'
						) }
						checked={ showSearch }
						onChange={ ( value ) =>
							setAttributes( { showSearch: value } )
						}
					/>
					{ showSearch && (
						<TextControl
							label={ __(
								'Placeholder text',
								'gutenberg-taxonomy-cards'
							) }
							value={ searchPlaceholder }
							onChange={ ( value ) =>
								setAttributes( {
									searchPlaceholder: value,
								} )
							}
						/>
					) }
				</PanelBody>
				<PanelBody title={ __( 'Layout', 'gutenberg-taxonomy-cards' ) }>
					<RangeControl
						label={ __( 'Columns', 'gutenberg-taxonomy-cards' ) }
						value={ columns }
						onChange={ ( value ) =>
							setAttributes( { columns: value } )
						}
						min={ 2 }
						max={ 6 }
					/>
					<RangeControl
						label={ __( 'Gap (px)', 'gutenberg-taxonomy-cards' ) }
						value={ gap }
						onChange={ ( value ) =>
							setAttributes( { gap: value } )
						}
						min={ 0 }
						max={ 64 }
					/>
				</PanelBody>
				<PanelBody
					title={ __( 'Content', 'gutenberg-taxonomy-cards' ) }
				>
					<ToggleControl
						label={ __(
							'Show featured image',
							'gutenberg-taxonomy-cards'
						) }
						checked={ showImage }
						onChange={ ( value ) =>
							setAttributes( { showImage: value } )
						}
					/>
					<ToggleControl
						label={ __(
							'Show excerpt',
							'gutenberg-taxonomy-cards'
						) }
						checked={ showExcerpt }
						onChange={ ( value ) =>
							setAttributes( { showExcerpt: value } )
						}
					/>
					<ToggleControl
						label={ __(
							'Show author',
							'gutenberg-taxonomy-cards'
						) }
						checked={ showAuthor }
						onChange={ ( value ) =>
							setAttributes( { showAuthor: value } )
						}
					/>
					<ToggleControl
						label={ __( 'Show date', 'gutenberg-taxonomy-cards' ) }
						checked={ showDate }
						onChange={ ( value ) =>
							setAttributes( { showDate: value } )
						}
					/>
					<ToggleControl
						label={ __(
							'Show "Read more" link',
							'gutenberg-taxonomy-cards'
						) }
						help={ __(
							'The whole card always links to the post; this adds a visible text link inside it too.',
							'gutenberg-taxonomy-cards'
						) }
						checked={ showCta }
						onChange={ ( value ) =>
							setAttributes( { showCta: value } )
						}
					/>
				</PanelBody>
				<PanelBody title={ __( 'Query', 'gutenberg-taxonomy-cards' ) }>
					<RangeControl
						label={ __(
							'Posts per page',
							'gutenberg-taxonomy-cards'
						) }
						help={
							showLoadMore
								? __(
										'How many posts to show at a time; "Load more" fetches the next batch of this size.',
										'gutenberg-taxonomy-cards'
								  )
								: undefined
						}
						value={ perPage }
						onChange={ ( value ) =>
							setAttributes( { perPage: value || 1 } )
						}
						min={ 1 }
						max={ 24 }
					/>
					<SelectControl
						label={ __( 'Order by', 'gutenberg-taxonomy-cards' ) }
						value={ orderBy }
						options={ [
							{ label: __( 'Date' ), value: 'date' },
							{ label: __( 'Title' ), value: 'title' },
							{ label: __( 'Menu order' ), value: 'menu_order' },
						] }
						onChange={ ( value ) =>
							setAttributes( { orderBy: value } )
						}
					/>
					<SelectControl
						label={ __( 'Order', 'gutenberg-taxonomy-cards' ) }
						value={ order }
						options={ [
							{ label: __( 'Ascending' ), value: 'asc' },
							{ label: __( 'Descending' ), value: 'desc' },
						] }
						onChange={ ( value ) =>
							setAttributes( { order: value } )
						}
					/>
					<ToggleControl
						label={ __(
							'Show "Load more" button',
							'gutenberg-taxonomy-cards'
						) }
						help={ __(
							'Fetches and appends the next page of results in place, with no page reload.',
							'gutenberg-taxonomy-cards'
						) }
						checked={ showLoadMore }
						onChange={ ( value ) =>
							setAttributes( { showLoadMore: value } )
						}
					/>
					{ showLoadMore && (
						<TextControl
							label={ __(
								'Button label',
								'gutenberg-taxonomy-cards'
							) }
							value={ loadMoreLabel }
							onChange={ ( value ) =>
								setAttributes( { loadMoreLabel: value } )
							}
						/>
					) }
				</PanelBody>
				<PanelBody title={ __( 'Style', 'gutenberg-taxonomy-cards' ) }>
					<RangeControl
						label={ __(
							'Card corner radius (px)',
							'gutenberg-taxonomy-cards'
						) }
						value={ cardRadius }
						onChange={ ( value ) =>
							setAttributes( { cardRadius: value } )
						}
						min={ 0 }
						max={ 32 }
					/>
					<SelectControl
						label={ __(
							'Image ratio',
							'gutenberg-taxonomy-cards'
						) }
						value={ imageRatio }
						options={ [
							{ label: '4:3', value: '4/3' },
							{ label: '1:1', value: '1/1' },
							{ label: '16:9', value: '16/9' },
						] }
						onChange={ ( value ) =>
							setAttributes( { imageRatio: value } )
						}
					/>
					<SelectControl
						label={ __( 'Image fit', 'gutenberg-taxonomy-cards' ) }
						value={ imageFit }
						options={ [
							{ label: __( 'Cover' ), value: 'cover' },
							{ label: __( 'Contain' ), value: 'contain' },
						] }
						onChange={ ( value ) =>
							setAttributes( { imageFit: value } )
						}
					/>
					<SelectControl
						label={ __(
							'Hover animation',
							'gutenberg-taxonomy-cards'
						) }
						value={ hoverAnimation }
						options={ [
							{ label: __( 'Lift' ), value: 'lift' },
							{ label: __( 'Zoom' ), value: 'zoom' },
							{ label: __( 'Grow' ), value: 'grow' },
							{ label: __( 'Fade' ), value: 'fade' },
							{ label: __( 'None' ), value: 'none' },
						] }
						onChange={ ( value ) =>
							setAttributes( { hoverAnimation: value } )
						}
					/>
				</PanelBody>
				<PanelBody
					title={ __(
						'Border & Card Background',
						'gutenberg-taxonomy-cards'
					) }
					initialOpen={ false }
				>
					<p
						style={ {
							fontWeight: 600,
							textTransform: 'uppercase',
							margin: '8px 0 4px',
						} }
					>
						{ __( 'Card background', 'gutenberg-taxonomy-cards' ) }
					</p>
					<ColorPalette
						colors={ colors }
						value={ cardBackgroundColor }
						onChange={ ( value ) =>
							setAttributes( {
								cardBackgroundColor: value || '',
							} )
						}
						clearable
					/>
					<p
						style={ {
							fontWeight: 600,
							textTransform: 'uppercase',
							margin: '16px 0 4px',
						} }
					>
						{ __( 'Border', 'gutenberg-taxonomy-cards' ) }
					</p>
					<RangeControl
						label={ __(
							'Border width (px)',
							'gutenberg-taxonomy-cards'
						) }
						value={ borderWidth }
						onChange={ ( value ) =>
							setAttributes( { borderWidth: value || 0 } )
						}
						min={ 0 }
						max={ 10 }
					/>
					<SelectControl
						label={ __(
							'Border style',
							'gutenberg-taxonomy-cards'
						) }
						value={ borderStyle }
						options={ [
							{ label: __( 'Solid' ), value: 'solid' },
							{ label: __( 'Dashed' ), value: 'dashed' },
							{ label: __( 'Dotted' ), value: 'dotted' },
						] }
						onChange={ ( value ) =>
							setAttributes( { borderStyle: value } )
						}
					/>
					<ColorPalette
						colors={ colors }
						value={ borderColor }
						onChange={ ( value ) =>
							setAttributes( { borderColor: value || '' } )
						}
						clearable
					/>
				</PanelBody>
				<PanelBody
					title={ __( 'Text Style', 'gutenberg-taxonomy-cards' ) }
					initialOpen={ false }
				>
					<p
						style={ {
							fontWeight: 600,
							textTransform: 'uppercase',
							margin: '8px 0 4px',
						} }
					>
						{ __( 'Title', 'gutenberg-taxonomy-cards' ) }
					</p>
					<RangeControl
						label={ __(
							'Font size (px)',
							'gutenberg-taxonomy-cards'
						) }
						value={ titleFontSize }
						onChange={ ( value ) =>
							setAttributes( { titleFontSize: value || 0 } )
						}
						min={ 0 }
						max={ 40 }
						help={ __(
							'0 uses the theme default.',
							'gutenberg-taxonomy-cards'
						) }
					/>
					<ColorPalette
						colors={ colors }
						value={ titleColor }
						onChange={ ( value ) =>
							setAttributes( { titleColor: value || '' } )
						}
						clearable
					/>
					<p
						style={ {
							fontWeight: 600,
							textTransform: 'uppercase',
							margin: '8px 0 4px',
						} }
					>
						{ __( 'Excerpt', 'gutenberg-taxonomy-cards' ) }
					</p>
					<RangeControl
						label={ __(
							'Font size (px)',
							'gutenberg-taxonomy-cards'
						) }
						value={ excerptFontSize }
						onChange={ ( value ) =>
							setAttributes( { excerptFontSize: value || 0 } )
						}
						min={ 0 }
						max={ 32 }
						help={ __(
							'0 uses the theme default.',
							'gutenberg-taxonomy-cards'
						) }
					/>
					<ColorPalette
						colors={ colors }
						value={ excerptColor }
						onChange={ ( value ) =>
							setAttributes( { excerptColor: value || '' } )
						}
						clearable
					/>
					<p
						style={ {
							fontWeight: 600,
							textTransform: 'uppercase',
							margin: '8px 0 4px',
						} }
					>
						{ __( 'Author/date', 'gutenberg-taxonomy-cards' ) }
					</p>
					<RangeControl
						label={ __(
							'Font size (px)',
							'gutenberg-taxonomy-cards'
						) }
						value={ metaFontSize }
						onChange={ ( value ) =>
							setAttributes( { metaFontSize: value || 0 } )
						}
						min={ 0 }
						max={ 24 }
						help={ __(
							'0 uses the theme default.',
							'gutenberg-taxonomy-cards'
						) }
					/>
					<ColorPalette
						colors={ colors }
						value={ metaColor }
						onChange={ ( value ) =>
							setAttributes( { metaColor: value || '' } )
						}
						clearable
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				{ ! postType && (
					<p>
						{ __(
							'Select a post type in the block settings sidebar to display posts.',
							'gutenberg-taxonomy-cards'
						) }
					</p>
				) }
				{ postType && showSearch && (
					<input
						type="search"
						className="wp-block-post-archive__search"
						placeholder={ searchPlaceholder }
						value={ searchQuery }
						onChange={ ( event ) =>
							setSearchQuery( event.target.value )
						}
					/>
				) }
				{ postType && showCategoryMenu && taxonomy && (
					<ul className="wp-block-post-archive__menu">
						<li className="wp-block-post-archive__menu-item">
							<button
								type="button"
								className={ `wp-block-post-archive__pill${
									selectedTerm === 0 ? ' is-active' : ''
								}` }
								onClick={ () => setSelectedTerm( 0 ) }
							>
								{ allTermsLabel }
							</button>
						</li>
						{ categories.map( ( category ) => (
							<li
								className="wp-block-post-archive__menu-item"
								key={ category.id }
							>
								<button
									type="button"
									className={ `wp-block-post-archive__pill${
										selectedTerm === category.id
											? ' is-active'
											: ''
									}` }
									onClick={ () =>
										setSelectedTerm( category.id )
									}
								>
									{ category.name }
								</button>
							</li>
						) ) }
					</ul>
				) }
				{ postType && ! hasResolved && (
					<p>
						{ __( 'Loading posts…', 'gutenberg-taxonomy-cards' ) }
					</p>
				) }
				{ postType && hasResolved && ! posts?.length && (
					<p>
						{ __( 'No posts found.', 'gutenberg-taxonomy-cards' ) }
					</p>
				) }
				{ postType && hasResolved && !! posts?.length && (
					<div className="wp-block-post-archive__grid">
						{ posts.map( ( post ) => {
							const imageUrl =
								post._embedded?.[ 'wp:featuredmedia' ]?.[ 0 ]
									?.source_url;
							const authorName =
								post._embedded?.author?.[ 0 ]?.name;
							const metaParts = [];
							if ( showAuthor && authorName ) {
								metaParts.push(
									sprintf(
										/* translators: %s: author name */
										__(
											'By %s',
											'gutenberg-taxonomy-cards'
										),
										authorName
									)
								);
							}
							if ( showDate ) {
								metaParts.push( formatDate( post.date ) );
							}
							return (
								<a
									href={ post.link }
									onClick={ ( event ) =>
										event.preventDefault()
									}
									className={ `wp-block-post-archive__card is-animation-${ hoverAnimation }` }
									key={ post.id }
								>
									{ showImage && (
										<div
											className={
												imageUrl
													? 'wp-block-post-archive__image'
													: 'wp-block-post-archive__image is-placeholder'
											}
											style={
												imageUrl
													? {
															backgroundImage: `url(${ imageUrl })`,
													  }
													: undefined
											}
										/>
									) }
									<div className="wp-block-post-archive__content">
										<h3
											className="wp-block-post-archive__title"
											style={ {
												fontSize: titleFontSize
													? `${ titleFontSize }px`
													: undefined,
												color: titleColor || undefined,
											} }
										>
											{ stripHtml(
												post.title?.rendered || ''
											) }
										</h3>
										{ showExcerpt &&
											post.excerpt?.rendered && (
												<p
													className="wp-block-post-archive__description"
													style={ {
														fontSize:
															excerptFontSize
																? `${ excerptFontSize }px`
																: undefined,
														color:
															excerptColor ||
															undefined,
													} }
												>
													{ stripHtml(
														post.excerpt.rendered
													) }
												</p>
											) }
										{ !! metaParts.length && (
											<span
												className="wp-block-post-archive__count"
												style={ {
													fontSize: metaFontSize
														? `${ metaFontSize }px`
														: undefined,
													color:
														metaColor || undefined,
												} }
											>
												{ metaParts.join( ' · ' ) }
											</span>
										) }
										{ showCta && (
											<span className="wp-block-post-archive__cta">
												{ __(
													'Read more',
													'gutenberg-taxonomy-cards'
												) }
											</span>
										) }
									</div>
								</a>
							);
						} ) }
					</div>
				) }
				{ postType &&
					hasResolved &&
					showLoadMore &&
					posts?.length >= perPage && (
						<div className="wp-block-post-archive__load-more-wrap">
							<button
								type="button"
								className="wp-block-post-archive__load-more"
								onClick={ ( event ) => event.preventDefault() }
							>
								{ loadMoreLabel }
							</button>
						</div>
					) }
			</div>
		</>
	);
}
