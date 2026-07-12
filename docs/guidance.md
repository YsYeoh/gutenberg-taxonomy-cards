# Recipe Category Cards Gutenberg Block Guide

## Goal

Build a custom Gutenberg block named **Recipe Category Cards** that
dynamically displays Recipe Categories from the WordPress REST API as
responsive cards.

The block must work on WordPress Premium (plugin uploads allowed) and
**must not require PHP rendering**.

------------------------------------------------------------------------

# Tech Stack

-   Gutenberg Block API
-   React
-   @wordpress/scripts
-   @wordpress/core-data (preferred) or @wordpress/api-fetch
-   REST API
-   Static block (save markup)

------------------------------------------------------------------------

# Project Structure

``` text
recipe-category-cards/
├── recipe-category-cards.php
├── block.json
├── package.json
├── src/
│   ├── index.js
│   ├── edit.js
│   ├── save.js
│   ├── editor.scss
│   └── style.scss
└── build/
```

------------------------------------------------------------------------

# Phase 1 -- Create the Block

1.  Scaffold a Gutenberg block.
2.  Register it as **Recipe Category Cards**.
3.  Verify it can be inserted into the editor.

Initial output can simply be:

``` text
Hello World
```

------------------------------------------------------------------------

# Phase 2 -- Fetch Categories

Use the REST API:

``` text
/wp-json/wp/v2/recipe_category?per_page=100
```

Expected object:

``` ts
interface RecipeCategory {
    id: number;
    name: string;
    slug: string;
    description: string;
    count: number;
    link: string;
    z_taxonomy_image_url: string;
}
```

------------------------------------------------------------------------

# Phase 3 -- Render Simple List

Before building cards, render:

``` text
Recipe Categories

Air Fryer Recipes

One Pot Meals

20-Minute Meals

Freezer-Friendly Meals
```

If this works, the REST integration is complete.

------------------------------------------------------------------------

# Phase 4 -- Convert to Cards

Each category becomes:

``` text
┌────────────────────────────┐
│        Category Image      │
├────────────────────────────┤
│ Air Fryer Recipes          │
│ Easy meals with minimal... │
│ Explore Recipes            │
└────────────────────────────┘
```

Image source:

``` text
category.z_taxonomy_image_url
```

Title:

``` text
category.name
```

Description:

``` text
category.description
```

Link:

``` text
category.link
```

Recipe Count:

``` text
category.count
```

------------------------------------------------------------------------

# Desktop Layout

-   4 cards per row
-   Responsive
-   Equal height cards

Mobile:

-   Single column

------------------------------------------------------------------------

# Card Design

Image ratio:

-   4:3

Border radius:

-   16px

Image:

-   Cover
-   Rounded top corners

Content:

-   Category Name
-   Description
-   Optional Recipe Count
-   CTA button

Hover:

-   Slight lift
-   Shadow
-   Scale image slightly

------------------------------------------------------------------------

# Inspector Controls

Provide block settings:

## Layout

-   Columns (2,3,4)
-   Gap

## Content

-   Show Image
-   Show Description
-   Show Recipe Count

## Query

-   Hide Empty Categories
-   Order By
-   Order

## Style

-   Card Radius
-   Image Ratio

------------------------------------------------------------------------

# Responsive Behaviour

Desktop

``` text
□□□□□□□□□□□□□□□□
□□□□□□□□□□□□□□□□
```

Tablet

``` text
□□□□□□□□
□□□□□□□□
```

Mobile

``` text
□□□□
□□□□
```

------------------------------------------------------------------------

# Error Handling

If image missing:

-   Display placeholder

If API fails:

-   Show "Unable to load recipe categories."

If no categories:

-   Show "No recipe categories found."

------------------------------------------------------------------------

# Future Enhancements

-   Horizontal scrolling
-   Carousel
-   Masonry
-   Featured first card
-   Lazy loading
-   Search
-   Filtering
-   Multiple taxonomy support
-   Theme color options

------------------------------------------------------------------------

# Acceptance Criteria

-   Block is insertable from Gutenberg.
-   Fetches Recipe Categories dynamically.
-   Displays taxonomy image.
-   Displays title.
-   Displays description.
-   Links to taxonomy archive.
-   Responsive layout.
-   No hardcoded categories.
-   No PHP template required.
