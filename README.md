# Mealie Recipe Cards
A collection of cards to display a Recipe from Mealie.

Requieres a Mealie installation as well as a configured Mealie HA Integration.

## Cards

All cards support UI configuration.
To setup one of the cards you need:
- The mealie integration
- A Mealie Host url
- The ID of the recipe. You can get the ids of your recipes with the mealie.get_recipes service call.

### Mealie Recipe Card
A simple card to display a mealie recipe

![misc/images/image1.png](misc/images/image1.png)

Features:
- Simple display of the recipe
- Star rating
- Cooking duration
- Tags
- Automatically aligns to the Homeasistant layouting size

Perfect for a display with auto-entities-card

### Mealie Detail Card
A more detailed Card to display a recipe.

![misc/images/image2.png](misc/images/image2.png)

Features:
- Title page with shortcuts to mealie, original url
- Carousel style viewer for displaying ingredients and cooking
- Button to add all ingredients to a shopping list
- many design config options
- Custom configurable button and click actions
- mobile friendly
- popup friendly with Browser mod and Bubble Card
- Automatically aligns to the Homeasistant layouting size

## Installation

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Phil0L&repository=mealie-recipe-card&category=plugin)
