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

// Decode HTML-encoded term names from the REST API (e.g. "&amp;") so the
// editor preview matches the frontend; see view.js for the rationale.
function stripHtml( html ) {
	const div = document.createElement( 'div' );
	div.innerHTML = html || '';
	return div.textContent || '';
}

export default function Edit( { attributes, setAttributes } ) {
	const {
		postType,
		taxonomy,
		displayStyle,
		showCount,
		hideEmpty,
		orderBy,
		order,
		gap,
		fontSize,
		pillRadius,
		pillBackgroundColor,
		pillTextColor,
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

	const blockProps = useBlockProps( {
		style: {
			'--rcc-pill-gap': `${ gap }px`,
			'--rcc-pill-font-size': fontSize ? `${ fontSize }px` : undefined,
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
				<PanelBody
					title={ __( 'Display', 'gutenberg-taxonomy-cards' ) }
				>
					<SelectControl
						label={ __( 'Style', 'gutenberg-taxonomy-cards' ) }
						value={ displayStyle }
						options={ [
							{ label: __( 'Pills' ), value: 'pills' },
							{ label: __( 'List' ), value: 'list' },
						] }
						onChange={ ( value ) =>
							setAttributes( { displayStyle: value } )
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
					<RangeControl
						label={ __( 'Gap (px)', 'gutenberg-taxonomy-cards' ) }
						value={ gap }
						onChange={ ( value ) =>
							setAttributes( { gap: value } )
						}
						min={ 0 }
						max={ 32 }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Style', 'gutenberg-taxonomy-cards' ) }>
					<RangeControl
						label={ __(
							'Font size (px)',
							'gutenberg-taxonomy-cards'
						) }
						value={ fontSize }
						onChange={ ( value ) =>
							setAttributes( { fontSize: value || 0 } )
						}
						min={ 0 }
						max={ 24 }
						help={ __(
							'0 uses the theme default.',
							'gutenberg-taxonomy-cards'
						) }
					/>
					{ displayStyle === 'pills' && (
						<RangeControl
							label={ __(
								'Pill corner radius (px)',
								'gutenberg-taxonomy-cards'
							) }
							value={ pillRadius }
							onChange={ ( value ) =>
								setAttributes( { pillRadius: value || 0 } )
							}
							min={ 0 }
							max={ 999 }
						/>
					) }
					<p
						style={ {
							fontWeight: 600,
							textTransform: 'uppercase',
							margin: '8px 0 4px',
						} }
					>
						{ __( 'Pill background', 'gutenberg-taxonomy-cards' ) }
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
						{ __( 'Pill text color', 'gutenberg-taxonomy-cards' ) }
					</p>
					<ColorPalette
						colors={ colors }
						value={ pillTextColor }
						onChange={ ( value ) =>
							setAttributes( { pillTextColor: value || '' } )
						}
						clearable
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				{ ! taxonomy && (
					<p>
						{ __(
							'Select a post type and taxonomy in the block settings sidebar to display categories.',
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
					<ul
						className={ `wp-block-category-pills__list is-display-${ displayStyle }` }
					>
						{ categories.map( ( category ) => (
							<li
								className="wp-block-category-pills__item"
								key={ category.id }
							>
								<a
									href={ category.link }
									onClick={ ( event ) =>
										event.preventDefault()
									}
									className="wp-block-category-pills__pill"
								>
									{ stripHtml( category.name ) }
									{ showCount && (
										<span className="wp-block-category-pills__count">
											{ sprintf(
												/* translators: %d: number of posts in this category */
												__(
													'(%d)',
													'gutenberg-taxonomy-cards'
												),
												category.count
											) }
										</span>
									) }
								</a>
							</li>
						) ) }
					</ul>
				) }
			</div>
		</>
	);
}
