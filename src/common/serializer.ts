import { type ZodType } from "zod";
import { IllegalShapeError, transformErrors } from "../error";
import type RegistryLookup from "../loader/registry";
import { isAtLeastVersion, type SemVerInput } from "../packFormat";
import type { Class } from "./class";
import type { Predicate } from "./filters";
import type { InputOutput } from "./inputOutput";

type Mapper<From extends Out, To extends In, Out, In> = (
  it: From,
  nested: (it: Out) => In,
) => To;

export interface IOSerializer<Out, In = unknown> {
  deserialize(input: In, nested: (it: In) => Out): Out | false;
  serialize(input: Out, nested: (it: Out) => In): In | false;
}

export interface SerializerBuilder<Out, In> {
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

export function createSerializer<Out>(
  factory: (builder: SerializerBuilder<Out, unknown>) => void,
): IOSerializer<Out, unknown> {
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

export abstract class VersionedSerializer<Out extends InputOutput> {
  private readonly serializer: IOSerializer<Out>;
  private readonly typeName: string;

  constructor(
    packFormat: SemVerInput,
    private readonly lookup: RegistryLookup,
    private readonly type: Class<Out>,
    serializers: Record<string, IOSerializer<Out>>,
  ) {
    const match = Object.entries(serializers).findLast(([it]) =>
      isAtLeastVersion(packFormat, it),
    )?.[1];

    this.typeName = type.name.toLowerCase();

    if (!match)
      throw new Error(
        `could not find ${this.typeName} serializer working for ${packFormat}`,
      );

    this.serializer = match;
  }

  serialize(ingredient: Out) {
    const serialized = this.serializer.serialize(ingredient, (it) =>
      this.serialize(it),
    );
    if (serialized !== false) return serialized;
    throw new IllegalShapeError(
      `unable to serialize ${this.typeName}`,
      ingredient,
    );
  }

  serializeList(ingredients: Out[]) {
    return ingredients.map((it) => this.serialize(it));
  }

  private deserializeUnvalidated(input: unknown): Out {
    if (input instanceof this.type) return input;

    if (!input)
      throw new IllegalShapeError(`${this.typeName} input may not be null`);

    const deserialized = this.serializer.deserialize(
      input as Record<string, unknown>,
      (it) => this.deserialize(it),
    );
    if (deserialized) return deserialized;

    throw new IllegalShapeError(`unknown ${this.typeName} shape`, input);
  }

  deserialize(input: unknown) {
    return transformErrors(() => {
      const deserialized = this.deserializeUnvalidated(input);
      deserialized.validate(this.lookup);
      return deserialized;
    });
  }

  validated<T extends Out>(ingredient: T): T {
    ingredient.validate(this.lookup);
    return ingredient;
  }

  // TODO rename deserializeList
  createList(input: unknown[]) {
    return input.map((it) => this.deserialize(it));
  }
}

export function isObjectWith(property: string) {
  return (input: unknown): input is Record<string, unknown> =>
    input !== undefined &&
    input !== null &&
    typeof input === "object" &&
    property in input;
}
