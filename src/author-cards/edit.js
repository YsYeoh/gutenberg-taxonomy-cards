import { __ } from '@wordpress/i18n';
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
		perPage,
		columns,
		gap,
		showAvatar,
		showBio,
		showCta,
		orderBy,
		order,
		cardRadius,
		hoverAnimation,
		borderWidth,
		borderStyle,
		borderColor,
		cardBackgroundColor,
		titleFontSize,
		titleColor,
		bioFontSize,
		bioColor,
	} = attributes;

	const colors = useSetting( 'color.palette' ) || [];

	const { authors, hasResolved } = useSelect(
		( select ) => {
			const query = {
				who: 'authors',
				per_page: perPage,
				orderby: orderBy,
				order,
			};
			const selectorArgs = [ 'root', 'user', query ];
			return {
				authors: select( coreStore ).getEntityRecords(
					...selectorArgs
				),
				hasResolved: select( coreStore ).hasFinishedResolution(
					'getEntityRecords',
					selectorArgs
				),
			};
		},
		[ perPage, orderBy, order ]
	);

	const blockProps = useBlockProps( {
		style: {
			'--rcc-columns': columns,
			'--rcc-gap': `${ gap }px`,
			'--rcc-radius': `${ cardRadius }px`,
			'--rcc-border-width': `${ borderWidth }px`,
			'--rcc-border-style': borderStyle,
			'--rcc-border-color': borderColor || undefined,
			'--rcc-card-bg': cardBackgroundColor || undefined,
		},
	} );

	return (
		<>
			<InspectorControls>
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
							'Show avatar',
							'gutenberg-taxonomy-cards'
						) }
						checked={ showAvatar }
						onChange={ ( value ) =>
							setAttributes( { showAvatar: value } )
						}
					/>
					<ToggleControl
						label={ __( 'Show bio', 'gutenberg-taxonomy-cards' ) }
						checked={ showBio }
						onChange={ ( value ) =>
							setAttributes( { showBio: value } )
						}
					/>
					<ToggleControl
						label={ __(
							'Show "View posts" link',
							'gutenberg-taxonomy-cards'
						) }
						help={ __(
							'The whole card always links to the author archive; this adds a visible text link inside it too.',
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
							'Number of authors',
							'gutenberg-taxonomy-cards'
						) }
						value={ perPage }
						onChange={ ( value ) =>
							setAttributes( { perPage: value || 1 } )
						}
						min={ 1 }
						max={ 48 }
					/>
					<SelectControl
						label={ __( 'Order by', 'gutenberg-taxonomy-cards' ) }
						value={ orderBy }
						options={ [
							{ label: __( 'Name' ), value: 'name' },
							{
								label: __( 'Registered date' ),
								value: 'registered_date',
							},
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
						{ __( 'Name', 'gutenberg-taxonomy-cards' ) }
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
						{ __( 'Bio', 'gutenberg-taxonomy-cards' ) }
					</p>
					<RangeControl
						label={ __(
							'Font size (px)',
							'gutenberg-taxonomy-cards'
						) }
						value={ bioFontSize }
						onChange={ ( value ) =>
							setAttributes( { bioFontSize: value || 0 } )
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
						value={ bioColor }
						onChange={ ( value ) =>
							setAttributes( { bioColor: value || '' } )
						}
						clearable
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				{ ! hasResolved && (
					<p>
						{ __( 'Loading authors…', 'gutenberg-taxonomy-cards' ) }
					</p>
				) }
				{ hasResolved && ! authors?.length && (
					<p>
						{ __(
							'No authors found.',
							'gutenberg-taxonomy-cards'
						) }
					</p>
				) }
				{ hasResolved && !! authors?.length && (
					<div className="wp-block-author-cards__grid">
						{ authors.map( ( author ) => (
							<a
								href={ author.link }
								onClick={ ( event ) => event.preventDefault() }
								className={ `wp-block-author-cards__card is-animation-${ hoverAnimation }` }
								key={ author.id }
							>
								{ showAvatar && (
									<div
										className="wp-block-author-cards__image"
										style={ {
											backgroundImage: `url(${
												author.avatar_urls?.[ '96' ] ||
												author.avatar_urls?.[ '48' ]
											})`,
										} }
									/>
								) }
								<div className="wp-block-author-cards__content">
									<h3
										className="wp-block-author-cards__title"
										style={ {
											fontSize: titleFontSize
												? `${ titleFontSize }px`
												: undefined,
											color: titleColor || undefined,
										} }
									>
										{ author.name }
									</h3>
									{ showBio && author.description && (
										<p
											className="wp-block-author-cards__description"
											style={ {
												fontSize: bioFontSize
													? `${ bioFontSize }px`
													: undefined,
												color: bioColor || undefined,
											} }
										>
											{ author.description }
										</p>
									) }
									{ showCta && (
										<span className="wp-block-author-cards__cta">
											{ __(
												'View posts',
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
