import {
  IgnoredIngredient,
  type Ingredient,
  ItemIngredient,
  ItemTagIngredient,
  ListIngredient,
} from "../../io/ingredient/impl";
import { Result } from "../../io/result/impl";
import type { SerializerBuilder } from "../module";

export function commonSerialization(builder: SerializerBuilder<Ingredient>) {
  builder.deserializer<Result>(
    (it) => it instanceof Result,
    (it) => it.asIngredient(),
  );

  builder.deserializer<string>(
    (it) => typeof it === "string",
    (input) => {
      if (input.startsWith("#")) {
        return new ItemTagIngredient(input);
      }
      return new ItemIngredient(input);
    },
  );

  builder.serializer(ListIngredient, (it, serialize) =>
    it.entries.flatMap(serialize),
  );

  builder.deserializer<unknown[]>(
    Array.isArray,
    (it, deserialize) => new ListIngredient(it.map(deserialize)),
  );

  builder.serializer(IgnoredIngredient, (it) => it.raw);
}
