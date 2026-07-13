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
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

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

	const handleCategoryIconChange = ( categoryId, value ) => {
		setAttributes( {
			categoryIcons: { ...categoryIcons, [ categoryId ]: value },
		} );
	};

	const blockProps = useBlockProps( {
		style: {
			'--rcc-columns': columns,
			'--rcc-gap': `${ gap }px`,
			'--rcc-radius': `${ cardRadius }px`,
			'--rcc-ratio': imageRatio,
			'--rcc-image-fit': imageFit,
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
								'Optional badge shown at the bottom-left corner of each card’s image (emoji or short text).',
								'gutenberg-taxonomy-cards'
							) }
						</p>
						{ categories.map( ( category ) => (
							<TextControl
								key={ category.id }
								label={ category.name }
								value={ categoryIcons?.[ category.id ] || '' }
								maxLength={ 4 }
								onChange={ ( value ) =>
									handleCategoryIconChange(
										category.id,
										value
									)
								}
							/>
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
								className="wp-block-taxonomy-category-cards__card"
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
										{ categoryIcons?.[ category.id ] && (
											<span className="wp-block-taxonomy-category-cards__icon">
												{ categoryIcons[ category.id ] }
											</span>
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
										{ category.name }
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
												{ category.description }
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
