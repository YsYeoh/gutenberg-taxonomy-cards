import { __, sprintf } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	ToggleControl,
	SelectControl,
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
		hideEmpty,
		orderBy,
		order,
		cardRadius,
		imageRatio,
	} = attributes;

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

	const blockProps = useBlockProps( {
		style: {
			'--rcc-columns': columns,
			'--rcc-gap': `${ gap }px`,
			'--rcc-radius': `${ cardRadius }px`,
			'--rcc-ratio': imageRatio,
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
				</PanelBody>
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
							<div
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
									/>
								) }
								<div className="wp-block-taxonomy-category-cards__content">
									<h3 className="wp-block-taxonomy-category-cards__title">
										{ category.name }
									</h3>
									{ showDescription &&
										category.description && (
											<p className="wp-block-taxonomy-category-cards__description">
												{ category.description }
											</p>
										) }
									{ showCount && (
										<span className="wp-block-taxonomy-category-cards__count">
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
									<span className="wp-block-taxonomy-category-cards__cta">
										{ __(
											'View archive',
											'gutenberg-taxonomy-cards'
										) }
									</span>
								</div>
							</div>
						) ) }
					</div>
				) }
			</div>
		</>
	);
}
