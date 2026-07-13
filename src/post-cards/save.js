import { useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const {
		postTypeRestBase,
		taxonomyRestBase,
		term,
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
	} = attributes;

	const blockProps = useBlockProps.save( {
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
		'data-post-type-rest-base': postTypeRestBase,
		'data-taxonomy-rest-base': taxonomyRestBase,
		'data-term': term || '',
		'data-per-page': perPage,
		'data-order-by': orderBy,
		'data-order': order,
		'data-show-image': showImage,
		'data-show-excerpt': showExcerpt,
		'data-show-author': showAuthor,
		'data-show-date': showDate,
		'data-show-cta': showCta,
		'data-hover-animation': hoverAnimation,
		'data-title-font-size': titleFontSize || '',
		'data-title-color': titleColor,
		'data-excerpt-font-size': excerptFontSize || '',
		'data-excerpt-color': excerptColor,
		'data-meta-font-size': metaFontSize || '',
		'data-meta-color': metaColor,
	} );

	// Markup is a static placeholder only. view.js fetches the live posts
	// and populates the grid on the frontend, so post content is never
	// baked into saved post content and can't go stale.
	return <div { ...blockProps } />;
}
