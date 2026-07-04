import type { SerializerModule } from "./module";

export interface Serializer<Out, S extends Serializer<Out, S>> {
  serialize(output: Out): unknown;
  deserialize(input: unknown): Out;

  serializeList(outputs: Out[]): unknown[];

  serializeOptional(output: Out | undefined): unknown;

  deserializeOptional(input: unknown): Out | undefined;

  deserializeList(input: unknown[]): Out[];

  withModule(module: SerializerModule<Out>): S;
}

export abstract class AbstractSerializer<
  Out,
  S extends Serializer<Out, S>,
> implements Serializer<Out, S> {
  abstract serialize(output: Out): unknown;
  abstract deserialize(input: unknown): Out;

  abstract withModule(module: SerializerModule<Out, unknown>): S;

  abstract selectModule(
    modules: Record<string, SerializerModule<Out, unknown>>,
  ): S;

  serializeList(outputs: Out[]) {
    return outputs.map((it) => this.serialize(it));
  }

  serializeOptional(output: Out | undefined) {
    if (output === undefined) return undefined;
    return this.serialize(output);
  }

  deserializeOptional(input: unknown) {
    if (input === undefined) return undefined;
    return this.deserialize(input);
  }

  deserializeList(input: unknown[]) {
    return input.map((it) => this.deserialize(it));
  }
}
