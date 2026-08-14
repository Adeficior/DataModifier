import type { SerializerModule } from "@adeficior/data-modifier-core/serializer";
import type { Ingredient } from "../ingredient/impl";
import type { Result } from "../result/impl";

export interface WithSerializerModules {
  ingredientModules(): Record<string, SerializerModule<Ingredient>>;
  resultModules(): Record<string, SerializerModule<Result>>;
}
