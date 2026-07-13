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
	ColorPalette,
} from '@wordpress/components';
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
		term,
		perPage,
		offset,
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
	} = attributes;

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

	const terms = useSelect(
		( select ) => {
			if ( ! taxonomy ) {
				return [];
			}
			return (
				select( coreStore ).getEntityRecords( 'taxonomy', taxonomy, {
					per_page: 100,
				} ) || []
			);
		},
		[ taxonomy ]
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
				offset,
				orderby: orderBy,
				order,
				_embed: true,
				...( taxonomy && term && taxonomyItem?.rest_base
					? { [ taxonomyItem.rest_base ]: term }
					: {} ),
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
			term,
			perPage,
			offset,
			orderBy,
			order,
			taxonomies,
		]
	);

	const handlePostTypeChange = ( value ) => {
		const postTypeItem = postTypes.find( ( item ) => item.slug === value );
		setAttributes( {
			postType: value,
			postTypeRestBase: postTypeItem?.rest_base || value,
			taxonomy: '',
			taxonomyRestBase: '',
			term: 0,
		} );
	};

	const handleTaxonomyChange = ( value ) => {
		const taxonomyItem = taxonomies.find( ( item ) => item.slug === value );
		setAttributes( {
			taxonomy: value,
			taxonomyRestBase: taxonomyItem?.rest_base || value,
			term: 0,
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
						label={ __(
							'Filter by taxonomy',
							'gutenberg-taxonomy-cards'
						) }
						value={ taxonomy }
						disabled={ ! postType }
						options={ [
							{
								label: __(
									'No filter (all posts)',
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
					{ taxonomy && (
						<SelectControl
							label={ __( 'Term', 'gutenberg-taxonomy-cards' ) }
							value={ term }
							options={ [
								{
									label: __(
										'Select a term…',
										'gutenberg-taxonomy-cards'
									),
									value: 0,
								},
								...terms.map( ( termItem ) => ( {
									label: termItem.name,
									value: termItem.id,
								} ) ),
							] }
							onChange={ ( value ) =>
								setAttributes( { term: Number( value ) } )
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
						max={ 4 }
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
							'Number of posts',
							'gutenberg-taxonomy-cards'
						) }
						value={ perPage }
						onChange={ ( value ) =>
							setAttributes( { perPage: value || 1 } )
						}
						min={ 1 }
						max={ 24 }
					/>
					<RangeControl
						label={ __( 'Offset', 'gutenberg-taxonomy-cards' ) }
						help={ __(
							'Number of posts to skip from the start of the results, e.g. to avoid repeating a post already shown elsewhere.',
							'gutenberg-taxonomy-cards'
						) }
						value={ offset }
						onChange={ ( value ) =>
							setAttributes( { offset: value || 0 } )
						}
						min={ 0 }
						max={ 48 }
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
					<div className="wp-block-post-cards__grid">
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
									className={ `wp-block-post-cards__card is-animation-${ hoverAnimation }` }
									key={ post.id }
								>
									{ showImage && (
										<div
											className={
												imageUrl
													? 'wp-block-post-cards__image'
													: 'wp-block-post-cards__image is-placeholder'
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
									<div className="wp-block-post-cards__content">
										<h3
											className="wp-block-post-cards__title"
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
													className="wp-block-post-cards__description"
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
												className="wp-block-post-cards__count"
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
											<span className="wp-block-post-cards__cta">
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
			</div>
		</>
	);
}
