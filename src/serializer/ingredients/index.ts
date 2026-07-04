import { mapValues } from "lodash-es";
import type { Serializer } from "..";
import { Ingredient } from "../../common/ingredient";
import type RegistryLookup from "../../loader/registry";
import type { SemVerInput } from "../../packFormat";
import {
  IngredientMap,
  type IngredientMapInput,
} from "../../parser/recipe/ingredientMap";
import type { SerializerModule } from "../module";
import { VersionedSerializer } from "../versioned";
import { WrapperSerializer } from "../wrapped";
import { serializer15 } from "./15";
import { serializer44 } from "./44";

export interface IngredientSerializer extends Serializer<
  Ingredient,
  IngredientSerializer
> {
  deserializeIngredientMap(input: IngredientMapInput): IngredientMap;

  serializeIngredientMap(map: IngredientMap): IngredientMapInput;
}
export class IngredientSerializerImpl
  extends VersionedSerializer<Ingredient, IngredientSerializer>
  implements IngredientSerializer
{
  constructor(packFormat: SemVerInput, lookup: RegistryLookup) {
    super(packFormat, lookup, Ingredient, {
      15: serializer15,
      44: serializer44,
    });
  }

  deserializeIngredientMap(input: IngredientMapInput) {
    return new IngredientMap(mapValues(input, (it) => this.deserialize(it)));
  }

  serializeIngredientMap(map: IngredientMap) {
    return mapValues(map.ingredients, (it) => this.serialize(it));
  }

  override withModule(
    module: SerializerModule<Ingredient>,
  ): IngredientSerializer {
    return new WrappedIngredientSerializer(this, module);
  }
}

class WrappedIngredientSerializer extends WrapperSerializer<
  Ingredient,
  IngredientSerializer
> {
  deserializeIngredientMap(input: IngredientMapInput) {
    return this.serializer.deserializeIngredientMap(input);
  }

  serializeIngredientMap(map: IngredientMap) {
    return this.serializer.serializeIngredientMap(map);
  }
}

export function createIngredientSerializer(
  packFormat: SemVerInput,
  lookup: RegistryLookup,
): IngredientSerializer {
  return new IngredientSerializerImpl(packFormat, lookup);
}
