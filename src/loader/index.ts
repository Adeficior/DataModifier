import type {
  Acceptable,
  Acceptor,
  BaseContext,
  Logger,
  Resolver,
} from "@adeficior/pack-resolver";
import type { Id, IdInput } from "../common/id.js";
import Registry from "../common/registry.js";
import type { RegistryProvider } from "../emit/index.js";
import { tryCatching } from "../error.js";
import { fromJson } from "../textHelper.js";

export default interface Loader {
  loadFrom(resolver: Resolver): Promise<void>;
}

export function tryParseJson(logger: Logger, content: Acceptable) {
  try {
    return fromJson(content);
  } catch (error) {
    if (error instanceof SyntaxError) {
      logger.trace(`unable to parse json: ${error.message}`);
      return null;
    }
    throw error;
  }
}

export abstract class JsonLoader<T> implements RegistryProvider<T>, Acceptor {
  private readonly registry = new Registry<T>();

  protected abstract parse(json: unknown, id: Id): T | null;

  get(id: IdInput): T | undefined {
    return this.registry.get(id);
  }

  forEach(consumer: (recipe: T, id: Id) => void): void {
    this.registry.forEach(consumer);
  }

  async forEachAsync(
    consumer: (recipe: T, id: Id) => Promise<void>,
  ): Promise<void> {
    await this.registry.forEachAsync(consumer);
  }

  async accept(
    path: string,
    content: PromiseLike<Acceptable>,
    context: BaseContext,
  ) {
    const match =
      /(data|assets)\/(?<namespace>[\w-]+)\/\w+\/(?<rest>[\w-/]+).json/.exec(
        path,
      );
    if (!match?.groups) return false;

    const { namespace, rest } = match.groups;
    const id: Id = { namespace: namespace!, path: rest! };

    const json = tryParseJson(context.logger, await content);
    if (!json) return false;

    const parsed = tryCatching(context.logger, () => this.parse(json, id));
    if (!parsed) return false;

    this.registry.set(id, parsed);
  }
}
