import type { SerializerBuilder } from "@adeficior/data-modifier-core/serializer";
import { Ingredient } from "../../ingredient/impl";
import { IgnoredResult, ItemResult } from "../../result/impl";
import type { Result } from "../../result/impl";

export function commonSerialization(builder: SerializerBuilder<Result>) {
  builder.deserializer<Ingredient>(
    (it) => it instanceof Ingredient,
    (it) => it.asResult(),
  );

  builder.deserializer<string>(
    (it) => typeof it === "string",
    (input) => new ItemResult(input),
  );

  builder.serializer(IgnoredResult, (it) => it.raw);
}
