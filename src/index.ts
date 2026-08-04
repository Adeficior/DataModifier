export {
  createId,
  encodeId,
  prefix,
  suffix,
  type Id,
  type IdInput,
  type NormalizedId,
  type TagInput,
} from "./common/id";
export * from "./common/ingredient";
export { default as Registry } from "./common/registry";
export * from "./common/result";
export type {
  ClearableEmitter as ClearableEmitter,
  RegistryProvider,
} from "./emit";
export type { BlockstateRules } from "./emit/assets/blockstates";
export type { ModelRules, ModelRulesGroup } from "./emit/assets/models";
export type {
  BlockDefinitionOptions,
  BlockDefinitionRules,
} from "./emit/content/blockDefinition";
export type { BlockDefinitionRulesWithoutId } from "./emit/content/innerBlockDefinition";
export type {
  ItemDefinitionOptions,
  ItemDefinitionRules,
} from "./emit/content/itemDefinition";
export { default as CustomEmitter } from "./emit/custom";
export {
  EMPTY_LOOT_MODIFIER,
  EMPTY_LOOT_TABLE,
  type LootRules,
} from "./emit/data/loot";
export { EMPTY_RECIPE } from "./emit/data/recipe";
export type { RecipeRules } from "./emit/data/recipe";
export type { TagRules } from "./emit/data/tags";
export { default as RuledEmitter } from "./emit/ruled";
export { IllegalShapeError, UnknownRegistryEntry } from "./error";
export { JsonLoader } from "./loader";
export {
  default as PackLoader,
  type LoaderEmitOptions,
  type PackLoaderOptions,
} from "./loader/pack";
export type { TagRegistry, TagRegistryHolder } from "./loader/tags";
export * from "./packFormat";
export type { LootItemInput } from "./parser/lootTable";
export type { Blockstate } from "./schema/assets/blockstate";
export type { Model } from "./schema/assets/model";
export type {
  BlockDefinition,
  BlockProperties,
  CogBlockDefinition,
} from "./schema/content/blockDefinition";
export type {
  BlockItemDefinition,
  ItemDefinition,
  ItemProperties,
  Rarity,
} from "./schema/content/itemDefinition";
export { EmptyLootEntry } from "./schema/data/loot";
export type {
  LootEntry,
  LootModifier,
  LootPool,
  LootTable,
} from "./schema/data/loot";
export type {
  FabricCondition,
  ForgeCondition,
  RecipeDefinition,
} from "./schema/data/recipe";
export type { TagDefinition, TagEntry } from "./schema/data/tag";
