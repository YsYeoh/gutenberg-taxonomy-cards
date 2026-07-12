import { useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
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

	const blockProps = useBlockProps.save( {
		style: {
			'--rcc-columns': columns,
			'--rcc-gap': `${ gap }px`,
			'--rcc-radius': `${ cardRadius }px`,
			'--rcc-ratio': imageRatio,
		},
		'data-show-image': showImage,
		'data-show-description': showDescription,
		'data-show-count': showCount,
		'data-hide-empty': hideEmpty,
		'data-order-by': orderBy,
		'data-order': order,
	} );

	// Markup is a static placeholder only. view.js fetches the live
	// taxonomy data and populates the grid on the frontend, so category
	// content is never baked into saved post content and can't go stale.
	return <div { ...blockProps } />;
}
