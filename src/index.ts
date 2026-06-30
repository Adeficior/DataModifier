export {
  createId,
  encodeId,
  prefix,
  suffix,
  type Id,
  type IdInput,
  type NormalizedId,
  type TagInput,
} from "./common/id.js";
export { default as Registry } from "./common/registry.js";
export type { BlockstateRules } from "./emit/assets/blockstates.js";
export type { ModelRules, ModelRulesGroup } from "./emit/assets/models.js";
export type {
  BlockDefinitionOptions,
  BlockDefinitionRules,
} from "./emit/content/blockDefinition.js";
export type { BlockDefinitionRulesWithoutId } from "./emit/content/innerBlockDefinition.js";
export type {
  ItemDefinitionOptions,
  ItemDefinitionRules,
} from "./emit/content/itemDefinition.js";
export { default as CustomEmitter } from "./emit/custom.js";
export {
  EMPTY_LOOT_MODIFIER,
  EMPTY_LOOT_TABLE,
  type LootRules,
} from "./emit/data/loot.js";
export { EMPTY_RECIPE } from "./emit/data/recipe.js";
export type { RecipeRules } from "./emit/data/recipe.js";
export type { TagRules } from "./emit/data/tags.js";
export type {
  ClearableEmitter as ClearableEmitter,
  RegistryProvider,
} from "./emit/index.js";
export { default as RuledEmitter } from "./emit/ruled.js";
export { IllegalShapeError, UnknownRegistryEntry } from "./error.js";
export { default as PackLoader } from "./loader/pack.js";
export type { TagRegistry, TagRegistryHolder } from "./loader/tags.js";
export * from "./packFormat.js";
export type { LootItemInput } from "./parser/lootTable.js";
export type { Blockstate } from "./schema/assets/blockstate.js";
export type { Model } from "./schema/assets/model.js";
export type {
  BlockDefinition,
  BlockProperties,
  CogBlockDefinition,
} from "./schema/content/blockDefinition.js";
export type {
  BlockItemDefinition,
  ItemDefinition,
  ItemProperties,
  Rarity,
} from "./schema/content/itemDefinition.js";
export { EmptyLootEntry } from "./schema/data/loot.js";
export type {
  LootEntry,
  LootModifier,
  LootPool,
  LootTable,
} from "./schema/data/loot.js";
export type {
  FabricCondition,
  ForgeCondition,
  RecipeDefinition,
} from "./schema/data/recipe.js";
export type { TagDefinition, TagEntry } from "./schema/data/tag.js";
