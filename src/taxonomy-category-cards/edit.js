import { __, sprintf } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	useSetting,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	ToggleControl,
	SelectControl,
	ColorPalette,
	Button,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

// The REST API returns term name/description HTML-encoded (e.g. an ampersand
// comes back as "&amp;"); rendering that string directly would print the raw
// entity. Decode it (and strip any tags) the same way view.js and post-cards
// do, so the editor preview matches the frontend.
function stripHtml( html ) {
	const div = document.createElement( 'div' );
	div.innerHTML = html || '';
	return div.textContent || '';
}

export default function Edit( { attributes, setAttributes } ) {
	const {
		postType,
		taxonomy,
		columns,
		gap,
		showImage,
		showDescription,
		showCount,
		showCta,
		hideEmpty,
		orderBy,
		order,
		cardRadius,
		imageRatio,
		imageFit,
		titleFontSize,
		titleColor,
		descriptionFontSize,
		descriptionColor,
		countFontSize,
		countColor,
		categoryIcons,
		borderWidth,
		borderStyle,
		borderColor,
		cardBackgroundColor,
		hoverAnimation,
		iconPosition,
		categoryBorderColors,
		categoryAnimations,
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

	const { categories, hasResolved } = useSelect(
		( select ) => {
			if ( ! taxonomy ) {
				return { categories: [], hasResolved: true };
			}
			const query = {
				per_page: 100,
				orderby: orderBy,
				order,
				hide_empty: hideEmpty,
			};
			const selectorArgs = [ 'taxonomy', taxonomy, query ];
			return {
				categories: select( coreStore ).getEntityRecords(
					...selectorArgs
				),
				hasResolved: select( coreStore ).hasFinishedResolution(
					'getEntityRecords',
					selectorArgs
				),
			};
		},
		[ taxonomy, orderBy, order, hideEmpty ]
	);

	const handlePostTypeChange = ( value ) => {
		setAttributes( {
			postType: value,
			taxonomy: '',
			taxonomyRestBase: '',
			taxonomyLabel: '',
		} );
	};

	const handleTaxonomyChange = ( value ) => {
		const taxonomyItem = taxonomies.find( ( item ) => item.slug === value );
		setAttributes( {
			taxonomy: value,
			taxonomyRestBase: taxonomyItem?.rest_base || value,
			taxonomyLabel: taxonomyItem?.name || value,
		} );
	};

	const handleCategoryIconSelect = ( categoryId, media ) => {
		setAttributes( {
			categoryIcons: {
				...categoryIcons,
				[ categoryId ]: { id: media.id, url: media.url },
			},
		} );
	};

	const handleCategoryIconRemove = ( categoryId ) => {
		const nextIcons = { ...categoryIcons };
		delete nextIcons[ categoryId ];
		setAttributes( { categoryIcons: nextIcons } );
	};

	const handleCategoryBorderColorChange = ( categoryId, value ) => {
		const next = { ...categoryBorderColors };
		if ( value ) {
			next[ categoryId ] = value;
		} else {
			delete next[ categoryId ];
		}
		setAttributes( { categoryBorderColors: next } );
	};

	const handleCategoryAnimationChange = ( categoryId, value ) => {
		const next = { ...categoryAnimations };
		if ( value ) {
			next[ categoryId ] = value;
		} else {
			delete next[ categoryId ];
		}
		setAttributes( { categoryAnimations: next } );
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
						label={ __( 'Taxonomy', 'gutenberg-taxonomy-cards' ) }
						value={ taxonomy }
						disabled={ ! postType }
						options={ [
							{
								label: __(
									'Select a taxonomy…',
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
						label={ __( 'Show image', 'gutenberg-taxonomy-cards' ) }
						checked={ showImage }
						onChange={ ( value ) =>
							setAttributes( { showImage: value } )
						}
					/>
					<ToggleControl
						label={ __(
							'Show description',
							'gutenberg-taxonomy-cards'
						) }
						checked={ showDescription }
						onChange={ ( value ) =>
							setAttributes( { showDescription: value } )
						}
					/>
					<ToggleControl
						label={ __(
							'Show item count',
							'gutenberg-taxonomy-cards'
						) }
						checked={ showCount }
						onChange={ ( value ) =>
							setAttributes( { showCount: value } )
						}
					/>
					<ToggleControl
						label={ __(
							'Show "View archive" link',
							'gutenberg-taxonomy-cards'
						) }
						help={ __(
							'The whole card always links to the category archive; this adds a visible text link inside it too.',
							'gutenberg-taxonomy-cards'
						) }
						checked={ showCta }
						onChange={ ( value ) =>
							setAttributes( { showCta: value } )
						}
					/>
				</PanelBody>
				<PanelBody title={ __( 'Query', 'gutenberg-taxonomy-cards' ) }>
					<ToggleControl
						label={ __(
							'Hide empty categories',
							'gutenberg-taxonomy-cards'
						) }
						checked={ hideEmpty }
						onChange={ ( value ) =>
							setAttributes( { hideEmpty: value } )
						}
					/>
					<SelectControl
						label={ __( 'Order by', 'gutenberg-taxonomy-cards' ) }
						value={ orderBy }
						options={ [
							{ label: __( 'Name' ), value: 'name' },
							{ label: __( 'Item count' ), value: 'count' },
							{ label: __( 'ID' ), value: 'id' },
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
						help={ __(
							'Cover crops the image to fill the frame; Contain shows the whole image, letterboxed if needed.',
							'gutenberg-taxonomy-cards'
						) }
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
					<p style={ { margin: '0 0 8px' } }>
						{ __(
							'Independent from the container background set in the Color panel above — leave unset to keep matching it.',
							'gutenberg-taxonomy-cards'
						) }
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
						{ __( 'Description', 'gutenberg-taxonomy-cards' ) }
					</p>
					<RangeControl
						label={ __(
							'Font size (px)',
							'gutenberg-taxonomy-cards'
						) }
						value={ descriptionFontSize }
						onChange={ ( value ) =>
							setAttributes( {
								descriptionFontSize: value || 0,
							} )
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
						value={ descriptionColor }
						onChange={ ( value ) =>
							setAttributes( { descriptionColor: value || '' } )
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
						{ __( 'Item count', 'gutenberg-taxonomy-cards' ) }
					</p>
					<RangeControl
						label={ __(
							'Font size (px)',
							'gutenberg-taxonomy-cards'
						) }
						value={ countFontSize }
						onChange={ ( value ) =>
							setAttributes( { countFontSize: value || 0 } )
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
						value={ countColor }
						onChange={ ( value ) =>
							setAttributes( { countColor: value || '' } )
						}
						clearable
					/>
				</PanelBody>
				{ taxonomy && !! categories?.length && (
					<PanelBody
						title={ __( 'Icons', 'gutenberg-taxonomy-cards' ) }
						initialOpen={ false }
					>
						<p>
							{ __(
								'Optional image/SVG badge shown on each card’s image.',
								'gutenberg-taxonomy-cards'
							) }
						</p>
						<SelectControl
							label={ __(
								'Icon position',
								'gutenberg-taxonomy-cards'
							) }
							value={ iconPosition }
							options={ [
								{
									label: __( 'Bottom left' ),
									value: 'bottom-left',
								},
								{
									label: __( 'Bottom right' ),
									value: 'bottom-right',
								},
								{
									label: __( 'Top left' ),
									value: 'top-left',
								},
								{
									label: __( 'Top right' ),
									value: 'top-right',
								},
							] }
							onChange={ ( value ) =>
								setAttributes( { iconPosition: value } )
							}
						/>
						{ categories.map( ( category ) => {
							const icon = categoryIcons?.[ category.id ];
							return (
								<div
									key={ category.id }
									style={ {
										display: 'flex',
										alignItems: 'center',
										gap: '8px',
										marginBottom: '8px',
									} }
								>
									{ icon?.url && (
										<img
											src={ icon.url }
											alt=""
											width={ 24 }
											height={ 24 }
											style={ { objectFit: 'contain' } }
										/>
									) }
									<MediaUploadCheck>
										<MediaUpload
											onSelect={ ( media ) =>
												handleCategoryIconSelect(
													category.id,
													media
												)
											}
											allowedTypes={ [ 'image' ] }
											value={ icon?.id }
											render={ ( { open } ) => (
												<Button
													onClick={ open }
													variant="secondary"
													size="small"
												>
													{ icon?.url
														? stripHtml(
																category.name
														  )
														: `${ stripHtml(
																category.name
														  ) } — ${ __(
																'Select icon',
																'gutenberg-taxonomy-cards'
														  ) }` }
												</Button>
											) }
										/>
									</MediaUploadCheck>
									{ icon?.url && (
										<Button
											onClick={ () =>
												handleCategoryIconRemove(
													category.id
												)
											}
											variant="link"
											isDestructive
											size="small"
										>
											{ __(
												'Remove',
												'gutenberg-taxonomy-cards'
											) }
										</Button>
									) }
								</div>
							);
						} ) }
					</PanelBody>
				) }
				{ taxonomy && !! categories?.length && (
					<PanelBody
						title={ __(
							'Card Overrides',
							'gutenberg-taxonomy-cards'
						) }
						initialOpen={ false }
					>
						<p>
							{ __(
								'Per-category border color and hover animation, overriding the shared Border/Style settings above.',
								'gutenberg-taxonomy-cards'
							) }
						</p>
						{ categories.map( ( category ) => (
							<div
								key={ category.id }
								style={ {
									marginBottom: '16px',
									paddingBottom: '16px',
									borderBottom: '1px solid #ddd',
								} }
							>
								<p
									style={ {
										fontWeight: 600,
										margin: '0 0 4px',
									} }
								>
									{ stripHtml( category.name ) }
								</p>
								<ColorPalette
									colors={ colors }
									value={
										categoryBorderColors?.[ category.id ]
									}
									onChange={ ( value ) =>
										handleCategoryBorderColorChange(
											category.id,
											value
										)
									}
									clearable
								/>
								<SelectControl
									label={ __(
										'Hover animation',
										'gutenberg-taxonomy-cards'
									) }
									value={
										categoryAnimations?.[ category.id ] ||
										''
									}
									options={ [
										{
											label: __(
												'Use default',
												'gutenberg-taxonomy-cards'
											),
											value: '',
										},
										{ label: __( 'Lift' ), value: 'lift' },
										{ label: __( 'Zoom' ), value: 'zoom' },
										{ label: __( 'Grow' ), value: 'grow' },
										{ label: __( 'Fade' ), value: 'fade' },
										{ label: __( 'None' ), value: 'none' },
									] }
									onChange={ ( value ) =>
										handleCategoryAnimationChange(
											category.id,
											value
										)
									}
								/>
							</div>
						) ) }
					</PanelBody>
				) }
			</InspectorControls>
			<div { ...blockProps }>
				{ ! taxonomy && (
					<p>
						{ __(
							'Select a post type and taxonomy in the block settings sidebar to display category cards.',
							'gutenberg-taxonomy-cards'
						) }
					</p>
				) }
				{ taxonomy && ! hasResolved && (
					<p>
						{ __(
							'Loading categories…',
							'gutenberg-taxonomy-cards'
						) }
					</p>
				) }
				{ taxonomy && hasResolved && ! categories?.length && (
					<p>
						{ __(
							'No categories found.',
							'gutenberg-taxonomy-cards'
						) }
					</p>
				) }
				{ taxonomy && hasResolved && !! categories?.length && (
					<div className="wp-block-taxonomy-category-cards__grid">
						{ categories.map( ( category ) => (
							<a
								href={ category.link }
								onClick={ ( event ) => event.preventDefault() }
								className={ `wp-block-taxonomy-category-cards__card is-animation-${
									categoryAnimations?.[ category.id ] ||
									hoverAnimation
								}` }
								style={ {
									'--rcc-border-color':
										categoryBorderColors?.[ category.id ] ||
										borderColor ||
										undefined,
								} }
								key={ category.id }
							>
								{ showImage && (
									<div
										className={
											category.z_taxonomy_image_url
												? 'wp-block-taxonomy-category-cards__image'
												: 'wp-block-taxonomy-category-cards__image is-placeholder'
										}
										style={
											category.z_taxonomy_image_url
												? {
														backgroundImage: `url(${ category.z_taxonomy_image_url })`,
												  }
												: undefined
										}
									>
										{ categoryIcons?.[ category.id ]
											?.url && (
											<img
												className={ `wp-block-taxonomy-category-cards__icon is-position-${ iconPosition }` }
												src={
													categoryIcons[ category.id ]
														.url
												}
												alt=""
											/>
										) }
									</div>
								) }
								<div className="wp-block-taxonomy-category-cards__content">
									<h3
										className="wp-block-taxonomy-category-cards__title"
										style={ {
											fontSize: titleFontSize
												? `${ titleFontSize }px`
												: undefined,
											color: titleColor || undefined,
										} }
									>
										{ stripHtml( category.name ) }
									</h3>
									{ showDescription &&
										category.description && (
											<p
												className="wp-block-taxonomy-category-cards__description"
												style={ {
													fontSize:
														descriptionFontSize
															? `${ descriptionFontSize }px`
															: undefined,
													color:
														descriptionColor ||
														undefined,
												} }
											>
												{ stripHtml(
													category.description
												) }
											</p>
										) }
									{ showCount && (
										<span
											className="wp-block-taxonomy-category-cards__count"
											style={ {
												fontSize: countFontSize
													? `${ countFontSize }px`
													: undefined,
												color: countColor || undefined,
											} }
										>
											{ sprintf(
												/* translators: %d: number of posts in this category */
												__(
													'%d posts',
													'gutenberg-taxonomy-cards'
												),
												category.count
											) }
										</span>
									) }
									{ showCta && (
										<span className="wp-block-taxonomy-category-cards__cta">
											{ __(
												'View archive',
												'gutenberg-taxonomy-cards'
											) }
										</span>
									) }
								</div>
							</a>
						) ) }
					</div>
				) }
			</div>
		</>
	);
}
