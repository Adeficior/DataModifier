import {
  extendLoggerContext,
  simpleResolver,
  type Logger,
} from "@adeficior/pack-resolver";
import { type LoaderContext } from "../common/context";
import { type Id } from "../common/id";
import { type RegistryProvider } from "../registry/abstract";
import { toJson } from "../serializer/textHelper";
import { type ClearableEmitter, type PathProvider } from "./abstract";

// TODO this should be replacer or at least nullable replacer?
export type Modifier<T> = (recipe: T) => T | null;

export abstract class Rule<T> {
  protected constructor(private readonly modifier: Modifier<T>) {}

  // TODO why logger?
  abstract matches(id: Id, recipe: T, logger: Logger): boolean;

  abstract printWarning(logger: Logger): void;

  modify(value: T) {
    return this.modifier(value);
  }
}

export class RuledEmitter<
  TEntry,
  TRule extends Rule<TEntry>,
> implements ClearableEmitter {
  constructor(
    private readonly provider: RegistryProvider<TEntry>,
    private readonly pathProvider: PathProvider,
    private readonly emptyValue: unknown,
    private readonly serialize: (entry: TEntry) => unknown,
    private readonly shouldSkip: (id: Id) => boolean = () => true,
  ) {}

  private rulesArray: TRule[] = [];
  private requiredRules = new Set<TRule>();

  protected get rules(): ReadonlyArray<TRule> {
    return this.rulesArray;
  }

  clear() {
    this.rulesArray = [];
    this.requiredRules.clear();
  }

  addRule(rule: TRule, required: boolean = true) {
    this.rulesArray.push(rule);
    if (required) this.requiredRules.add(rule);
  }

  resolver(context: LoaderContext) {
    return simpleResolver(async (acceptor) => {
      const missingRules = new Set<TRule>(this.requiredRules);
      await this.provider.forEachAsync(async (recipe, id) => {
        if (this.shouldSkip(id)) return;

        const path = this.pathProvider(id);

        const rules = this.rules.filter((it) =>
          it.matches(id, recipe, extendLoggerContext(context.logger, { path })),
        );
        if (rules.length === 0) return;

        rules.forEach((it) => missingRules.delete(it));

        const modified = rules.reduce<TEntry | null>(
          (previous, rule) => previous && rule.modify(previous),
          recipe,
        );

        const serialized = modified
          ? this.serialize(modified)
          : this.emptyValue;

        await acceptor(path, toJson(serialized));
      });

      missingRules.forEach((rule) => {
        rule.printWarning(context.logger);
      });
    }, context);
  }
}
