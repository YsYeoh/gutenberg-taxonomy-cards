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

export default function Edit( { attributes, setAttributes } ) {
	const {
		postType,
		taxonomy,
		term,
		layout,
		showImage,
		showDescription,
		showCount,
		showCta,
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
		descriptionFontSize,
		descriptionColor,
		countFontSize,
		countColor,
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

	const { category, hasResolved } = useSelect(
		( select ) => {
			if ( ! taxonomy || ! term ) {
				return { category: null, hasResolved: true };
			}
			const selectorArgs = [ 'taxonomy', taxonomy, term ];
			return {
				category: select( coreStore ).getEntityRecord(
					...selectorArgs
				),
				hasResolved: select( coreStore ).hasFinishedResolution(
					'getEntityRecord',
					selectorArgs
				),
			};
		},
		[ taxonomy, term ]
	);

	const handlePostTypeChange = ( value ) => {
		setAttributes( {
			postType: value,
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
					{ taxonomy && (
						<SelectControl
							label={ __(
								'Featured term',
								'gutenberg-taxonomy-cards'
							) }
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
					<SelectControl
						label={ __( 'Layout', 'gutenberg-taxonomy-cards' ) }
						value={ layout }
						options={ [
							{ label: __( 'Stacked' ), value: 'stacked' },
							{ label: __( 'Horizontal' ), value: 'horizontal' },
						] }
						onChange={ ( value ) =>
							setAttributes( { layout: value } )
						}
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
						max={ 48 }
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
			</InspectorControls>
			<div { ...blockProps }>
				{ ! term && (
					<p>
						{ __(
							'Select a post type, taxonomy, and term in the block settings sidebar to feature a category.',
							'gutenberg-taxonomy-cards'
						) }
					</p>
				) }
				{ !! term && ! hasResolved && (
					<p>
						{ __(
							'Loading category…',
							'gutenberg-taxonomy-cards'
						) }
					</p>
				) }
				{ !! term && hasResolved && ! category && (
					<p>
						{ __(
							'Category not found.',
							'gutenberg-taxonomy-cards'
						) }
					</p>
				) }
				{ !! term && hasResolved && !! category && (
					<a
						href={ category.link }
						onClick={ ( event ) => event.preventDefault() }
						className={ `wp-block-featured-category__card is-animation-${ hoverAnimation } is-layout-${ layout }` }
					>
						{ showImage && (
							<div
								className={
									category.z_taxonomy_image_url
										? 'wp-block-featured-category__image'
										: 'wp-block-featured-category__image is-placeholder'
								}
								style={
									category.z_taxonomy_image_url
										? {
												backgroundImage: `url(${ category.z_taxonomy_image_url })`,
										  }
										: undefined
								}
							/>
						) }
						<div className="wp-block-featured-category__content">
							<h3
								className="wp-block-featured-category__title"
								style={ {
									fontSize: titleFontSize
										? `${ titleFontSize }px`
										: undefined,
									color: titleColor || undefined,
								} }
							>
								{ category.name }
							</h3>
							{ showDescription && category.description && (
								<p
									className="wp-block-featured-category__description"
									style={ {
										fontSize: descriptionFontSize
											? `${ descriptionFontSize }px`
											: undefined,
										color: descriptionColor || undefined,
									} }
								>
									{ category.description }
								</p>
							) }
							{ showCount && (
								<span
									className="wp-block-featured-category__count"
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
								<span className="wp-block-featured-category__cta">
									{ __(
										'View archive',
										'gutenberg-taxonomy-cards'
									) }
								</span>
							) }
						</div>
					</a>
				) }
			</div>
		</>
	);
}
