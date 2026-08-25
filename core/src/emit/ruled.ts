import { simpleResolver } from "@adeficior/pack-resolver";
import type { ContextLike } from "@adeficior/pack-resolver";
import type { LoaderContext } from "../common/context";
import type { Id } from "../common/id";
import { RuleHandler } from "../common/rules";
import type { Rule } from "../common/rules";
import type { RegistryProvider } from "../registry/abstract";
import { toJson } from "../serializer/textHelper";
import type { ClearableEmitter, PathProvider } from "./abstract";

export type Modifier<T> = (value: T) => T | null;

export class RuledEmitter<T> implements ClearableEmitter {
  private readonly handler;
  constructor(
    type: string,
    private readonly registry: RegistryProvider<T>,
    private readonly pathProvider: PathProvider,
    private readonly disabledValue: unknown,
    private readonly serialize: (entry: T) => unknown,
    shouldSkip: (id: Id) => boolean = () => true,
  ) {
    this.handler = new RuleHandler<T, Modifier<T>>(type, shouldSkip);
  }

  clear() {
    this.handler.clear();
  }

  addRule(rule: Rule<T>, modifier: Modifier<T>, context: ContextLike) {
    this.handler.addRule(rule, modifier, context);
  }

  addRemoval(rule: Rule<T>, context: ContextLike = {}) {
    this.addRule(rule, () => null, { operation: "remove", ...context });
  }

  resolver(context: LoaderContext) {
    return simpleResolver(async (acceptor) => {
      await this.handler.run(
        this.registry,
        context.logger,
        async (id, value, matches) => {
          const path = this.pathProvider(id);

          const modified = matches.reduce<T | null>(
            (previous, modifier) => previous && modifier(previous),
            value,
          );

          const serialized = modified
            ? this.serialize(modified)
            : this.disabledValue;

          await acceptor(path, toJson(serialized));
        },
      );
    }, context);
  }
}
