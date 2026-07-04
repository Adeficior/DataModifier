import { AbstractSerializer, type Serializer } from ".";
import type { SerializerModule } from "./module";

export class WrapperSerializer<
  Out,
  S extends Serializer<Out, S>,
> extends AbstractSerializer<Out, S> {
  constructor(
    protected readonly serializer: S,
    protected readonly module: SerializerModule<Out>,
  ) {
    super();
  }

  override serialize(output: Out) {
    const fromModule = this.module.serialize(output, (it) =>
      this.serialize(it),
    );
    if (fromModule) return fromModule;
    return this.serializer.serialize(output);
  }

  override deserialize(input: unknown) {
    const fromModule = this.module.deserialize(input, (it) =>
      this.deserialize(it),
    );
    if (fromModule) return this.serializer.deserialize(fromModule);
    return this.serializer.deserialize(input);
  }

  override withModule(): never {
    throw new Error("serializer is already wrapped with module");
  }

  override selectModule(): never {
    throw new Error("serializer is already wrapped with module");
  }
}
