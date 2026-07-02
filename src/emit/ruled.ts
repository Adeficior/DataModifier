import {
  extendLoggerContext,
  simpleResolver,
  type BaseContext,
} from "@adeficior/pack-resolver";
import type { Id } from "../common/id.js";
import { toJson } from "../textHelper.js";
import type {
  ClearableEmitter,
  PathProvider,
  RegistryProvider,
} from "./index.js";
import type Rule from "./rule/index.js";

export default class RuledEmitter<
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

  resolver(context: BaseContext) {
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
