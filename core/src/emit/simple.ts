import type { Registry } from "../registry/abstract";
import { filterRegistry } from "../registry/filtered";
import type { PathProvider } from "./abstract";
import { WrappedEmitter } from "./combined";
import { CustomEmitter } from "./custom";
import { RuledEmitter } from "./ruled";

/**
 * helper class including ruled and custom emitter
 */
export abstract class SimpleEmitter<T, D> extends WrappedEmitter {
  protected readonly ruled;
  protected readonly custom;

  constructor(
    type: string,
    registry: Registry<T>,
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
}
