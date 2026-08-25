import type { ContextLike, Logger } from "@adeficior/pack-resolver";
import type { Registry } from "../registry/abstract";
import type { Id } from "./id";

export type Rule<T> = {
  matches(id: Id, value: T): boolean;
};

type RuleEntry<T, V> = {
  rule: Rule<T>;
  value: V;
  context: ContextLike;
};

export class RuleHandler<T, V> {
  private entries: RuleEntry<T, V>[] = [];

  constructor(private readonly type: string) {}

  addRule(rule: Rule<T>, value: V, context: ContextLike) {
    this.entries.push({ rule, value, context });
  }

  clear() {
    this.entries = [];
  }

  findMatching(id: Id, value: T) {
    return this.entries.filter(({ rule }) => rule.matches(id, value));
  }

  async run(
    registry: Registry<T>,
    logger: Logger,
    acceptor: (id: Id, value: T, matches: V[]) => PromiseLike<void>,
  ) {
    const missing = new Set<RuleEntry<T, V>>(this.entries);

    await registry.forEachAsync(async (value, id) => {
      const matches = this.findMatching(id, value);
      if (matches.length === 0) return;

      matches.forEach((it) => missing.delete(it));

      await acceptor(
        id,
        value,
        matches.map((it) => it.value),
      );
    });

    missing.forEach((it) => {
      logger.trace(`could not find any ${this.type} matching`, it.context);
    });
  }
}
