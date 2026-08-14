import { encodeId } from "@adeficior/data-modifier-core";
import {
  type ItemLikeIngredient,
  type ItemResult,
} from "@adeficior/data-modifier-ingredients";
import * as z from "zod";

const NumberProviderSchema = z.union([
  z.number(),
  z
    .object({
      type: z.string().optional(),
    })
    .passthrough(),
]);

const LootConditionSchema = z
  .object({
    condition: z.string(),
  })
  .passthrough();

const LootFunctionSchema = z
  .object({
    conditions: z.array(LootConditionSchema).optional(),
    function: z.string(),
  })
  .passthrough();

const LootEntryBaseSchema = z
  .object({
    type: z.string(),
    conditions: z.array(LootConditionSchema).optional(),
    functions: z.array(LootFunctionSchema).optional(),
  })
  .passthrough();

export type LootEntryBase = z.infer<typeof LootEntryBaseSchema>;

const LootEntryAlternativeSchema = z.object({
  type: z.literal("minecraft:alternatives"),
  children: z.array(LootEntryBaseSchema),
});

const LootEntryItemSchema = z.object({
  type: z.literal("minecraft:item"),
  name: z.string(),
});

const LootEntryTagSchema = z.object({
  type: z.literal("minecraft:tag"),
  name: z.string(),
  expand: z.boolean().optional(),
});

const LootEntryEmptySchema = z.object({
  type: z.literal("minecraft:empty"),
});

export const EmptyLootEntry: LootEntry = {
  type: "minecraft:empty",
};

const LootEntryReferenceSchema = z.object({
  type: z.literal("minecraft:loot_table"),
  name: z.string(),
});

const LootEntrySchema = LootEntryBaseSchema.and(
  z.discriminatedUnion("type", [
    LootEntryAlternativeSchema,
    LootEntryItemSchema,
    LootEntryTagSchema,
    LootEntryReferenceSchema,
    LootEntryEmptySchema,
  ]),
);

export function parseLootEntry(input: unknown) {
  return LootEntrySchema.parse(input);
}

export function parseLootTable(input: unknown) {
  return LootTableSchema.parse(input);
}

export type LootEntry = z.infer<typeof LootEntrySchema>;

export const LootPoolSchema = z.object({
  rolls: NumberProviderSchema,
  bonus_rolls: NumberProviderSchema.optional(),
  entries: z.array(LootEntryBaseSchema),
  conditions: z.array(LootConditionSchema).optional(),
  functions: z.array(LootFunctionSchema).optional(),
});

export type LootPool = z.infer<typeof LootPoolSchema>;

export const LootTableSchema = z.object({
  type: z.string().optional(),
  pools: z.array(LootPoolSchema).default([]),
});

export type LootTable = z.infer<typeof LootTableSchema>;

export function extendLootEntry(base: LootEntryBase): LootEntry {
  if (typeof base === "object" && "type" in base) {
    base.type = encodeId(base.type);
  }
  return LootEntrySchema.parse(base);
}

export type LootModifier = Readonly<{
  type: string;
  conditions?: Array<{
    condition: string;
  }>;
}>;

export type LootItemInput = ItemLikeIngredient | ItemResult | LootEntry;
