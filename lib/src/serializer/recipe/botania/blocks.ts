import {
  BlockIngredient,
  BlockResult,
  BlockTagIngredient,
  createSerializerModule,
  hasType,
  IdSchema,
  type Ingredient,
  type Result,
} from "@adeficior/data-modifier-core";
import {
  OneToOneRecipe,
  RecipeParser,
  type RecipeDefinition,
  type RecipeParseContext,
} from "@adeficior/data-modifier-recipes";
import * as z from "zod";

export type BotaniaBlockRecipeDefinition = RecipeDefinition &
  Readonly<{
    input: unknown;
    output: unknown;
  }>;

const ingredientSerializer15 = createSerializerModule<Ingredient>((builder) => {
  const blockType = "block" as const;
  builder.register(
    BlockIngredient,
    hasType(blockType),
    z.object({
      type: z.literal(blockType),
      block: IdSchema,
    }),
    ({ block }) => new BlockIngredient(block),
    ({ id }) => ({ block: id, type: blockType }),
  );

  const tagType = "tag" as const;
  builder.register(
    BlockTagIngredient,
    hasType(tagType),
    z.object({
      type: z.literal(tagType),
      tag: IdSchema,
    }),
    ({ tag }) => new BlockTagIngredient(tag),
    ({ tag }) => ({ tag, type: tagType }),
  );
});

const resultSerializer15 = createSerializerModule<Result>((builder) => {
  const blockType = "block" as const;
  builder.register(
    BlockResult,
    hasType(blockType),
    z.object({
      type: z.literal(blockType),
      block: IdSchema,
    }),
    ({ block }) => new BlockResult(block),
    ({ id }) => ({ block: id, type: blockType }),
  );
});

export class BotaniaBlockRecipe extends OneToOneRecipe {
  override serialize(
    context: RecipeParseContext,
  ): Partial<BotaniaBlockRecipeDefinition> {
    return {
      output: context.results.serialize(this.result),
      input: context.ingredients.serialize(this.ingredient),
    };
  }
}

export const resultSerializerModules = {
  15: resultSerializer15,
};

export const ingredientSerializerModules = {
  15: ingredientSerializer15,
};

export class BotaniaBlockRecipeParser<
  TDefinition extends BotaniaBlockRecipeDefinition,
> extends RecipeParser<TDefinition, BotaniaBlockRecipe> {
  override resultModules() {
    return resultSerializerModules;
  }

  override ingredientModules() {
    return ingredientSerializerModules;
  }

  deserialize(
    definition: TDefinition,
    context: RecipeParseContext,
  ): BotaniaBlockRecipe {
    const ingredient = context.ingredients.deserialize(definition.input);
    const result = context.results.deserialize(definition.output);
    return new BotaniaBlockRecipe(ingredient, result);
  }
}
