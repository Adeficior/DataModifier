import type { Acceptor, IResolver, Logger } from "@adeficior/pack-resolver";
import type { Id } from "../common/id.js";
import Registry from "../common/registry.js";
import type { RegistryProvider } from "../emit/index.js";
import { tryCatching } from "../error.js";
import { fromJson } from "../textHelper.js";

export default interface Loader {
  loadFrom(resolver: IResolver): Promise<void>;
}

export function tryParseJson(logger: Logger, content: string) {
  try {
    return fromJson(content);
  } catch (error) {
    if (error instanceof SyntaxError) {
      logger.warn(`unable to parse json: ${error.message}`);
      return null;
    }
    throw error;
  }
}

export abstract class JsonLoader<T> implements RegistryProvider<T> {
  protected readonly registry = new Registry<T>();

  constructor(protected readonly logger: Logger) {}

  protected abstract parse(json: unknown, id: Id): T | null;

  forEach(consumer: (recipe: T, id: Id) => void): void {
    this.registry.forEach(consumer);
  }

  async forEachAsync(
    consumer: (recipe: T, id: Id) => Promise<void>,
  ): Promise<void> {
    await this.registry.forEachAsync(consumer);
  }

  readonly accept: Acceptor = (path, content) => {
    const match =
      /(data|assets)\/(?<namespace>[\w-]+)\/\w+\/(?<rest>[\w-/]+).json/.exec(
        path,
      );
    if (!match?.groups) return false;

    const { namespace, rest } = match.groups;
    const id: Id = { namespace: namespace!, path: rest! };

    const grouped = this.logger.group(path);

    const json = tryParseJson(grouped, content.toString());
    if (!json) return false;

    const parsed = tryCatching(grouped, () => this.parse(json, id));
    if (!parsed) return false;

    this.registry.set(id, parsed);
  };
}
