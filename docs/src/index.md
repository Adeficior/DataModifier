# Overview

`@adeficior/data-modifier` is a TypeScript library that can load data from multiple minecraft sources (like mod JARs, archives or folder) and generate new data & assets files into an output archive or folder.
It is built to be used by modpack developers to generate their custom data & resourcepacks and bundle them in the pack itself, instead of having to rely on runtime solutions such as [KubeJS](https://kubejs.com/) or [CraftTweaker](https://docs.blamejared.com/).

It's companion `@adeficior/assembler` provides an easy environment for modpack development.

## Usages

- replace a specific ingredient across all recipes from a given set of mods
- generate blockstates, models, loot tables & recipes for custom blocks/items
- remove a specific item from all loot tables
- disable recipes depending on various conditions, like outputs or inputs
- modify translations by replacing specific words with others