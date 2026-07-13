import { useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const {
		taxonomyRestBase,
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

	const blockProps = useBlockProps.save( {
		style: {
			'--rcc-radius': `${ cardRadius }px`,
			'--rcc-ratio': imageRatio,
			'--rcc-image-fit': imageFit,
			'--rcc-border-width': `${ borderWidth }px`,
			'--rcc-border-style': borderStyle,
			'--rcc-border-color': borderColor || undefined,
			'--rcc-card-bg': cardBackgroundColor || undefined,
		},
		'data-taxonomy-rest-base': taxonomyRestBase,
		'data-term': term || '',
		'data-layout': layout,
		'data-show-image': showImage,
		'data-show-description': showDescription,
		'data-show-count': showCount,
		'data-show-cta': showCta,
		'data-hover-animation': hoverAnimation,
		'data-title-font-size': titleFontSize || '',
		'data-title-color': titleColor,
		'data-description-font-size': descriptionFontSize || '',
		'data-description-color': descriptionColor,
		'data-count-font-size': countFontSize || '',
		'data-count-color': countColor,
	} );

	// Markup is a static placeholder only. view.js fetches the live term
	// data and populates the card on the frontend, so it never goes stale.
	return <div { ...blockProps } />;
}
