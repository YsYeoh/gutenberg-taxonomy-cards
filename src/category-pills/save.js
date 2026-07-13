import { useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const {
		taxonomyRestBase,
		taxonomyLabel,
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

	const blockProps = useBlockProps.save( {
		style: {
			'--rcc-pill-gap': `${ gap }px`,
			'--rcc-pill-font-size': fontSize ? `${ fontSize }px` : undefined,
			'--rcc-pill-radius': `${ pillRadius }px`,
			'--rcc-pill-bg': pillBackgroundColor || undefined,
			'--rcc-pill-color': pillTextColor || undefined,
		},
		'data-taxonomy-rest-base': taxonomyRestBase,
		'data-taxonomy-label': taxonomyLabel,
		'data-display-style': displayStyle,
		'data-show-count': showCount,
		'data-hide-empty': hideEmpty,
		'data-order-by': orderBy,
		'data-order': order,
	} );

	// Markup is a static placeholder only. view.js fetches the live
	// taxonomy data and populates the list on the frontend, so category
	// content is never baked into saved post content and can't go stale.
	return <div { ...blockProps } />;
}
