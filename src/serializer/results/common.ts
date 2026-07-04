import { IgnoredResult, ItemResult, type Result } from "../../";
import type { SerializerBuilder } from "../module";

export default function commonSerialization(
  builder: SerializerBuilder<Result>,
) {
  builder.deserializer<string>(
    (it) => typeof it === "string",
    (input) => new ItemResult(input),
  );

  builder.serializer(IgnoredResult, (it) => it.raw);
}
