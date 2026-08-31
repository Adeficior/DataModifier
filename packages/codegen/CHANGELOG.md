# @adeficior/data-modifier-codegen

## 2.1.3

### Patch Changes

- - only generate dump registry types for registered registries
  - add `.entries()` and `.values()` methods to `Registry`
  - export pack metadata helpers & types from lib
- Updated dependencies
  - @adeficior/data-modifier-core@2.2.1
  - @adeficior/data-modifier-loader@2.1.3

## 2.1.2

### Patch Changes

- Updated dependencies [8e552d5]
- Updated dependencies [e045807]
  - @adeficior/data-modifier-core@2.2.0
  - @adeficior/data-modifier-loader@2.1.2

## 2.1.1

### Patch Changes

- - refactored rule logic to seperate it from modifiers
  - added LootRules & RecipeRules helper services
  - let modules define which stub IDs to generate
  - switch to new polytone tab creation format
- Updated dependencies
  - @adeficior/data-modifier-core@2.1.0
  - @adeficior/data-modifier-loader@2.1.1

## 2.1.0

### Minor Changes

- 94bb070: don't load optional modules & more codegen options

### Patch Changes

- Updated dependencies [94bb070]
  - @adeficior/data-modifier-loader@2.1.0
  - @adeficior/data-modifier-core@2.0.2

## 2.0.1

### Patch Changes

- 90a62a2: allow passing modules as objects instead of by name into modifier config
- Updated dependencies [90a62a2]
  - @adeficior/data-modifier-core@2.0.1
  - @adeficior/data-modifier-loader@2.0.1

## 2.0.0

### Major Changes

- 24b3096: refactor to modular system

### Patch Changes

- Updated dependencies [24b3096]
  - @adeficior/data-modifier-loader@2.0.0
  - @adeficior/data-modifier-core@2.0.0
