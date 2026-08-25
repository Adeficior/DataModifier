import type { Logger } from "@adeficior/pack-resolver";
import { encodeId } from "../common/id";
import type { IdInput, NormalizedId } from "../common/id";
import type { Registry } from "../registry/abstract";
import { filterRegistry } from "../registry/filtered";
import { PatchedRegistry } from "../registry/patched";
import type { PathProvider } from "./abstract";
import { WrappedEmitter } from "./combined";
import { CustomEmitter } from "./custom";
import { RuledEmitter } from "./ruled";

/**
 * helper class including ruled and custom emitter
 */
export abstract class SimpleEmitter<T, D> extends WrappedEmitter {
  protected readonly ruled;
  private readonly custom;

  constructor(
    private readonly type: string,
    private readonly registry: Registry<T>,
    private readonly logger: Logger,
    pathProvider: PathProvider,
    disabledValue: D,
    serialize: (entry: T) => D = (it) => it as unknown as D,
  ) {
    super();

    this.custom = this.addEmitter(new CustomEmitter(pathProvider, serialize));

    const filteredRegistry = filterRegistry(registry, (id) =>
      this.custom.has(id),
    );

    this.ruled = this.addEmitter(
      new RuledEmitter(
        type,
        filteredRegistry,
        pathProvider,
        disabledValue,
        serialize,
      ),
    );
  }

  protected addCustom(id: IdInput, value: T): NormalizedId {
    if (this.custom.has(id))
      this.logger.error(
        `overwriting custom ${this.type} with ID ${encodeId(id)}`,
      );

    this.custom.add(id, value);

    if (this.registry instanceof PatchedRegistry) {
      this.registry.set(id, value);
    }

    return encodeId(id);
  }
}
