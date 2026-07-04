import { type ZodType } from "zod";
import type { Class } from "../common/class";
import type { Predicate } from "../common/filters";
import type { Ingredient } from "../common/ingredient";
import type { Result } from "../common/result";
import { isAtLeastVersion, type SemVerInput } from "../packFormat";

type Mapper<From extends Out, To extends In, Out, In> = (
  it: From,
  nested: (it: Out) => In,
) => To;

export interface SerializerModule<Out, In = unknown> {
  deserialize(input: In, nested: (it: In) => Out): Out | false;
  serialize(input: Out, nested: (it: Out) => In): In | false;
}

export interface SerializerBuilder<Out, In = unknown> {
  deserializer<TIn extends In>(
    test: Predicate<In>,
    mapper: Mapper<TIn, Out, In, Out>,
  ): void;

  serializer<TOut extends Out, TIn extends In>(
    clazz: Class<TOut>,
    mapper: Mapper<TOut, TIn, Out, In>,
  ): void;

  register<TOut extends Out, TIn extends In>(
    clazz: Class<TOut>,
    test: Predicate<In>,
    schema: ZodType<TIn>,
    deserialize: Mapper<TIn, TOut, In, Out>,
    serialize: Mapper<TOut, TIn, Out, In>,
  ): void;
}

export function createSerializerModule<Out>(
  factory: (builder: SerializerBuilder<Out, unknown>) => void,
): SerializerModule<Out, unknown> {
  const deserializers: Array<{
    test: Predicate<unknown>;
    mapper: Mapper<unknown, Out, unknown, Out>;
  }> = [];

  const serializers: Array<{
    clazz: Class<Out>;
    mapper: Mapper<Out, unknown, Out, unknown>;
  }> = [];

  factory({
    deserializer: (test, mapper) => {
      deserializers.push({
        test,
        mapper: mapper as unknown as Mapper<unknown, Out, unknown, Out>,
      });
    },
    serializer: (clazz, mapper) => {
      serializers.push({
        clazz,
        mapper: mapper as unknown as Mapper<Out, unknown, Out, unknown>,
      });
    },
    register(clazz, test, schema, deserialize, serialize) {
      this.serializer(clazz, (it, nested) =>
        schema.encode(serialize(it, nested)),
      );
      this.deserializer(test, (it, nested) =>
        deserialize(schema.parse(it), nested),
      );
    },
  });

  return {
    deserialize: (input, nested) => {
      const match = deserializers.find((it) => it.test(input));
      if (!match) return false;
      return match.mapper(input, nested);
    },
    serialize(output, nested) {
      const match = serializers.find((it) => output instanceof it.clazz);
      if (!match) return false;
      return match.mapper(output, nested);
    },
  };
}

export function selectSerializerModule<Out>(
  packFormat: SemVerInput,
  serializers: Record<string, SerializerModule<Out>>,
) {
  return Object.entries(serializers).findLast(([it]) =>
    isAtLeastVersion(packFormat, it),
  )?.[1];
}

export interface WithSerializerModules {
  ingredientModules(): Record<string, SerializerModule<Ingredient>>;
  resultModules(): Record<string, SerializerModule<Result>>;
}
