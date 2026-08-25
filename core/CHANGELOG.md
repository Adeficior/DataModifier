# @adeficior/data-modifier-core

## 2.2.0

### Minor Changes

- 8e552d5: moved ID Filter -> Predicate logic into tags module. Other modules should use it via `Predicates.id(...)`, which now also validates a given filter against the registry lookup.

### Patch Changes

- e045807: added add PatchedRegistry that received values added to custom emitters

## 2.1.0

### Minor Changes

- - refactored rule logic to seperate it from modifiers
  - added LootRules & RecipeRules helper services
  - let modules define which stub IDs to generate
  - switch to new polytone tab creation format

## 2.0.2

### Patch Changes

- 94bb070: don't load optional modules & more codegen options

## 2.0.1

### Patch Changes

- 90a62a2: allow passing modules as objects instead of by name into modifier config

## 2.0.0

### Major Changes

- 24b3096: refactor to modular system
