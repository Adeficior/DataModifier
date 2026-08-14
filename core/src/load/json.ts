import type { Acceptable, Acceptor } from "@adeficior/pack-resolver";
import type { LoaderContext } from "../common/context";
import type { Id, IdInput } from "../common/id";
import { conditionsPredicate } from "../conditions";
import type { ConditionContext, WithConditions } from "../conditions";
import type { RegistryProvider } from "../registry/abstract";
import { Registry } from "../registry/impl";
import { tryCatching } from "../serializer/error";
import { tryParseJson } from "../serializer/textHelper";

export abstract class JsonLoader<T> implements RegistryProvider<T>, Acceptor {
  private readonly registry = new Registry<T>();

  constructor(private readonly context?: ConditionContext) {}

  protected abstract parse(json: unknown, id: Id): T | null;

  get(id: IdInput): T | undefined {
    return this.registry.get(id);
  }

  forEach(consumer: (value: T, id: Id) => void): void {
    this.registry.forEach(consumer);
  }

  async forEachAsync(
    consumer: (value: T, id: Id) => Promise<void>,
  ): Promise<void> {
    await this.registry.forEachAsync(consumer);
  }

  private shouldLoad(value: WithConditions<T>) {
    if (!this.context) return true;
    const predicate = conditionsPredicate(value);
    return predicate(this.context);
  }

  async accept(
    path: string,
    content: PromiseLike<Acceptable>,
    context: LoaderContext,
  ) {
    const match =
      /(data|assets)\/(?<namespace>[\w-]+)\/\w+\/(?<rest>[\w-_/]+).json/.exec(
        path,
      );
    if (!match?.groups) return false;

    const { namespace, rest } = match.groups;
    const id: Id = { namespace: namespace!, path: rest! };

    const json = tryParseJson<WithConditions<T>>(context.logger, await content);
    if (!json) return false;

    if (!this.shouldLoad(json)) return false;

    const parsed = tryCatching(context.logger, () => this.parse(json, id));
    if (!parsed) return false;

    this.registry.set(id, parsed);
  }
}
