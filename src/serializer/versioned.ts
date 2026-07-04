import { AbstractSerializer, type Serializer } from ".";
import type { Class } from "../common/class";
import type { InputOutput } from "../common/inputOutput";
import { IllegalShapeError, transformErrors } from "../error";
import type RegistryLookup from "../loader/registry";
import { type SemVerInput } from "../packFormat";
import { selectSerializerModule, type SerializerModule } from "./module";

export abstract class VersionedSerializer<
  Out extends InputOutput,
  S extends Serializer<Out, S>,
> extends AbstractSerializer<Out, S> {
  private readonly serializer: SerializerModule<Out>;
  private readonly typeName: string;

  constructor(
    private readonly packFormat: SemVerInput,
    private readonly lookup: RegistryLookup,
    private readonly type: Class<Out>,
    serializers: Record<string, SerializerModule<Out>>,
  ) {
    super();

    this.typeName = type.name.toLowerCase();

    const match = selectSerializerModule(packFormat, serializers);

    if (!match)
      throw new Error(
        `could not find ${this.typeName} serializer working for ${packFormat}`,
      );

    this.serializer = match;
  }

  override serialize(output: Out) {
    const serialized = this.serializer.serialize(output, (it) =>
      this.serialize(it),
    );
    if (serialized !== false) return serialized;
    throw new IllegalShapeError(`unable to serialize ${this.typeName}`, output);
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

  override deserialize(input: unknown) {
    return transformErrors(() => {
      const deserialized = this.deserializeUnvalidated(input);
      deserialized.validate(this.lookup);
      return deserialized;
    });
  }

  validated<T extends Out>(output: T): T {
    output.validate(this.lookup);
    return output;
  }

  override selectModule(
    modules: Record<string, SerializerModule<Out, unknown>>,
  ): S {
    const selected = selectSerializerModule(this.packFormat, modules);
    if (selected) return this.withModule(selected);
    return this as unknown as S;
  }
}
