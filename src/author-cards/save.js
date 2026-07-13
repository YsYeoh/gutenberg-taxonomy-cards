import { useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
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

	const blockProps = useBlockProps.save( {
		style: {
			'--rcc-columns': columns,
			'--rcc-gap': `${ gap }px`,
			'--rcc-radius': `${ cardRadius }px`,
			'--rcc-border-width': `${ borderWidth }px`,
			'--rcc-border-style': borderStyle,
			'--rcc-border-color': borderColor || undefined,
			'--rcc-card-bg': cardBackgroundColor || undefined,
		},
		'data-per-page': perPage,
		'data-order-by': orderBy,
		'data-order': order,
		'data-show-avatar': showAvatar,
		'data-show-bio': showBio,
		'data-show-cta': showCta,
		'data-hover-animation': hoverAnimation,
		'data-title-font-size': titleFontSize || '',
		'data-title-color': titleColor,
		'data-bio-font-size': bioFontSize || '',
		'data-bio-color': bioColor,
	} );

	// Markup is a static placeholder only. view.js fetches the live author
	// list and populates the grid on the frontend, so it never goes stale.
	return <div { ...blockProps } />;
}
