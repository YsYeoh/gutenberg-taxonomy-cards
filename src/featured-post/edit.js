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
		postSelectionMode,
		post,
		layout,
		showImage,
		showExcerpt,
		showAuthor,
		showDate,
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

	const availablePosts = useSelect(
		( select ) => {
			if ( ! postType || postSelectionMode !== 'manual' ) {
				return [];
			}
			return (
				select( coreStore ).getEntityRecords( 'postType', postType, {
					per_page: 100,
					orderby: 'date',
					order: 'desc',
				} ) || []
			);
		},
		[ postType, postSelectionMode ]
	);

	const { featuredPost, hasResolved } = useSelect(
		( select ) => {
			if ( ! postType ) {
				return { featuredPost: null, hasResolved: true };
			}
			if ( postSelectionMode === 'latest' ) {
				const query = {
					per_page: 1,
					orderby: 'date',
					order: 'desc',
					_embed: true,
				};
				const selectorArgs = [ 'postType', postType, query ];
				const posts = select( coreStore ).getEntityRecords(
					...selectorArgs
				);
				return {
					featuredPost: posts?.[ 0 ] || null,
					hasResolved: select( coreStore ).hasFinishedResolution(
						'getEntityRecords',
						selectorArgs
					),
				};
			}
			if ( ! post ) {
				return { featuredPost: null, hasResolved: true };
			}
			const selectorArgs = [
				'postType',
				postType,
				post,
				{ _embed: true },
			];
			return {
				featuredPost: select( coreStore ).getEntityRecord(
					...selectorArgs
				),
				hasResolved: select( coreStore ).hasFinishedResolution(
					'getEntityRecord',
					selectorArgs
				),
			};
		},
		[ postType, postSelectionMode, post ]
	);

	const handlePostTypeChange = ( value ) => {
		const postTypeItem = postTypes.find( ( item ) => item.slug === value );
		setAttributes( {
			postType: value,
			postTypeRestBase: postTypeItem?.rest_base || value,
			post: 0,
		} );
	};

	const handlePostSelectionModeChange = ( value ) => {
		setAttributes( { postSelectionMode: value, post: 0 } );
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

	const isConfigured =
		!! postType && ( postSelectionMode === 'latest' || !! post );

	const metaParts = [];
	if ( featuredPost ) {
		const authorName = featuredPost._embedded?.author?.[ 0 ]?.name;
		if ( showAuthor && authorName ) {
			metaParts.push(
				sprintf(
					/* translators: %s: author name */
					__( 'By %s', 'gutenberg-taxonomy-cards' ),
					authorName
				)
			);
		}
		if ( showDate ) {
			metaParts.push( formatDate( featuredPost.date ) );
		}
	}
	const imageUrl =
		featuredPost?._embedded?.[ 'wp:featuredmedia' ]?.[ 0 ]?.source_url;

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
					{ postType && (
						<SelectControl
							label={ __(
								'Post selection',
								'gutenberg-taxonomy-cards'
							) }
							value={ postSelectionMode }
							options={ [
								{
									label: __(
										'Always use the latest post',
										'gutenberg-taxonomy-cards'
									),
									value: 'latest',
								},
								{
									label: __(
										'Choose a specific post',
										'gutenberg-taxonomy-cards'
									),
									value: 'manual',
								},
							] }
							onChange={ handlePostSelectionModeChange }
						/>
					) }
					{ postType && postSelectionMode === 'manual' && (
						<SelectControl
							label={ __(
								'Featured post',
								'gutenberg-taxonomy-cards'
							) }
							value={ post }
							options={ [
								{
									label: __(
										'Select a post…',
										'gutenberg-taxonomy-cards'
									),
									value: 0,
								},
								...availablePosts.map( ( postItem ) => ( {
									label: stripHtml(
										postItem.title?.rendered || ''
									),
									value: postItem.id,
								} ) ),
							] }
							onChange={ ( value ) =>
								setAttributes( { post: Number( value ) } )
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
				{ ! isConfigured && (
					<p>
						{ postSelectionMode === 'manual'
							? __(
									'Select a post type and post in the block settings sidebar to feature a post.',
									'gutenberg-taxonomy-cards'
							  )
							: __(
									'Select a post type in the block settings sidebar to feature the latest post.',
									'gutenberg-taxonomy-cards'
							  ) }
					</p>
				) }
				{ isConfigured && ! hasResolved && (
					<p>{ __( 'Loading post…', 'gutenberg-taxonomy-cards' ) }</p>
				) }
				{ isConfigured && hasResolved && ! featuredPost && (
					<p>
						{ __( 'Post not found.', 'gutenberg-taxonomy-cards' ) }
					</p>
				) }
				{ isConfigured && hasResolved && !! featuredPost && (
					<a
						href={ featuredPost.link }
						onClick={ ( event ) => event.preventDefault() }
						className={ `wp-block-featured-post__card is-animation-${ hoverAnimation } is-layout-${ layout }` }
					>
						{ showImage && (
							<div
								className={
									imageUrl
										? 'wp-block-featured-post__image'
										: 'wp-block-featured-post__image is-placeholder'
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
						<div className="wp-block-featured-post__content">
							<h3
								className="wp-block-featured-post__title"
								style={ {
									fontSize: titleFontSize
										? `${ titleFontSize }px`
										: undefined,
									color: titleColor || undefined,
								} }
							>
								{ stripHtml(
									featuredPost.title?.rendered || ''
								) }
							</h3>
							{ showExcerpt && featuredPost.excerpt?.rendered && (
								<p
									className="wp-block-featured-post__description"
									style={ {
										fontSize: excerptFontSize
											? `${ excerptFontSize }px`
											: undefined,
										color: excerptColor || undefined,
									} }
								>
									{ stripHtml(
										featuredPost.excerpt.rendered
									) }
								</p>
							) }
							{ !! metaParts.length && (
								<span
									className="wp-block-featured-post__count"
									style={ {
										fontSize: metaFontSize
											? `${ metaFontSize }px`
											: undefined,
										color: metaColor || undefined,
									} }
								>
									{ metaParts.join( ' · ' ) }
								</span>
							) }
							{ showCta && (
								<span className="wp-block-featured-post__cta">
									{ __(
										'Read more',
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
