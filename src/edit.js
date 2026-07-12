import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	ToggleControl,
	SelectControl,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

const TAXONOMY = 'recipe_category';

export default function Edit( { attributes, setAttributes } ) {
	const {
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

	const { categories, hasResolved } = useSelect(
		( select ) => {
			const query = {
				per_page: 100,
				orderby: orderBy,
				order,
				hide_empty: hideEmpty,
			};
			const selectorArgs = [ 'taxonomy', TAXONOMY, query ];
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
		[ orderBy, order, hideEmpty ]
	);

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
				<PanelBody title={ __( 'Layout', 'recipe-category-cards' ) }>
					<RangeControl
						label={ __( 'Columns', 'recipe-category-cards' ) }
						value={ columns }
						onChange={ ( value ) =>
							setAttributes( { columns: value } )
						}
						min={ 2 }
						max={ 4 }
					/>
					<RangeControl
						label={ __( 'Gap (px)', 'recipe-category-cards' ) }
						value={ gap }
						onChange={ ( value ) =>
							setAttributes( { gap: value } )
						}
						min={ 0 }
						max={ 64 }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Content', 'recipe-category-cards' ) }>
					<ToggleControl
						label={ __( 'Show image', 'recipe-category-cards' ) }
						checked={ showImage }
						onChange={ ( value ) =>
							setAttributes( { showImage: value } )
						}
					/>
					<ToggleControl
						label={ __(
							'Show description',
							'recipe-category-cards'
						) }
						checked={ showDescription }
						onChange={ ( value ) =>
							setAttributes( { showDescription: value } )
						}
					/>
					<ToggleControl
						label={ __(
							'Show recipe count',
							'recipe-category-cards'
						) }
						checked={ showCount }
						onChange={ ( value ) =>
							setAttributes( { showCount: value } )
						}
					/>
				</PanelBody>
				<PanelBody title={ __( 'Query', 'recipe-category-cards' ) }>
					<ToggleControl
						label={ __(
							'Hide empty categories',
							'recipe-category-cards'
						) }
						checked={ hideEmpty }
						onChange={ ( value ) =>
							setAttributes( { hideEmpty: value } )
						}
					/>
					<SelectControl
						label={ __( 'Order by', 'recipe-category-cards' ) }
						value={ orderBy }
						options={ [
							{ label: __( 'Name' ), value: 'name' },
							{ label: __( 'Recipe count' ), value: 'count' },
							{ label: __( 'ID' ), value: 'id' },
						] }
						onChange={ ( value ) =>
							setAttributes( { orderBy: value } )
						}
					/>
					<SelectControl
						label={ __( 'Order', 'recipe-category-cards' ) }
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
				<PanelBody title={ __( 'Style', 'recipe-category-cards' ) }>
					<RangeControl
						label={ __(
							'Card corner radius (px)',
							'recipe-category-cards'
						) }
						value={ cardRadius }
						onChange={ ( value ) =>
							setAttributes( { cardRadius: value } )
						}
						min={ 0 }
						max={ 32 }
					/>
					<SelectControl
						label={ __( 'Image ratio', 'recipe-category-cards' ) }
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
				{ ! hasResolved && (
					<p>
						{ __(
							'Loading recipe categories…',
							'recipe-category-cards'
						) }
					</p>
				) }
				{ hasResolved && ! categories?.length && (
					<p>
						{ __(
							'No recipe categories found.',
							'recipe-category-cards'
						) }
					</p>
				) }
				{ hasResolved && !! categories?.length && (
					<div className="wp-block-recipe-category-cards__grid">
						{ categories.map( ( category ) => (
							<div
								className="wp-block-recipe-category-cards__card"
								key={ category.id }
							>
								{ showImage && (
									<div
										className={
											category.z_taxonomy_image_url
												? 'wp-block-recipe-category-cards__image'
												: 'wp-block-recipe-category-cards__image is-placeholder'
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
								<div className="wp-block-recipe-category-cards__content">
									<h3 className="wp-block-recipe-category-cards__title">
										{ category.name }
									</h3>
									{ showDescription &&
										category.description && (
											<p className="wp-block-recipe-category-cards__description">
												{ category.description }
											</p>
										) }
									{ showCount && (
										<span className="wp-block-recipe-category-cards__count">
											{ category.count }{ ' ' }
											{ __(
												'recipes',
												'recipe-category-cards'
											) }
										</span>
									) }
									<span className="wp-block-recipe-category-cards__cta">
										{ __(
											'Explore Recipes',
											'recipe-category-cards'
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
