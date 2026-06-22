import type { Logger } from "@adeficior/pack-resolver";
import type { Id } from "../../common/id.js";

export type Modifier<T> = (recipe: T) => T | null;

export default abstract class Rule<T> {
  protected constructor(private readonly modifier: Modifier<T>) {}

  abstract matches(id: Id, recipe: T, logger: Logger): boolean;

  abstract printWarning(logger: Logger): void;

  modify(value: T) {
    return this.modifier(value);
  }
}
