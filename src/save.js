import { useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const {
		taxonomyRestBase,
		taxonomyLabel,
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
		hoverAnimation,
		iconPosition,
		categoryBorderColors,
		categoryAnimations,
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
		},
		'data-taxonomy-rest-base': taxonomyRestBase,
		'data-taxonomy-label': taxonomyLabel,
		'data-show-image': showImage,
		'data-show-description': showDescription,
		'data-show-count': showCount,
		'data-show-cta': showCta,
		'data-hide-empty': hideEmpty,
		'data-order-by': orderBy,
		'data-order': order,
		'data-title-font-size': titleFontSize || '',
		'data-title-color': titleColor,
		'data-description-font-size': descriptionFontSize || '',
		'data-description-color': descriptionColor,
		'data-count-font-size': countFontSize || '',
		'data-count-color': countColor,
		'data-category-icons': JSON.stringify( categoryIcons || {} ),
		'data-hover-animation': hoverAnimation,
		'data-icon-position': iconPosition,
		'data-category-border-colors': JSON.stringify(
			categoryBorderColors || {}
		),
		'data-category-animations': JSON.stringify( categoryAnimations || {} ),
	} );

	// Markup is a static placeholder only. view.js fetches the live
	// taxonomy data and populates the grid on the frontend, so category
	// content is never baked into saved post content and can't go stale.
	return <div { ...blockProps } />;
}
