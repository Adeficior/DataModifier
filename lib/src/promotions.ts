import type {
  ModulesContainer,
  ServicePromotion,
} from "@adeficior/data-modifier-core";
import type { Promotions } from "@adeficior/data-modifier-core/generated";
import { orderBy } from "@adeficior/pack-resolver";

export type Promoted<T> = Promotions & T;

function addProperty(
  target: unknown,
  [key, ...path]: string[],
  service: unknown,
): void {
  if (!key) throw new Error("path cannot be empty");
  if (!target || typeof target !== "object")
    throw new Error("target must be an object");
  const record = target as Record<string, unknown>;

  if (path.length === 0) {
    if (key in record) {
      throw new Error(`unable to overwrite property ${key} with promotions`);
    }

    Object.defineProperty(record, key, {
      value: service,
      writable: false,
    });
  } else {
    if (key in record) {
      const existing = record[key] ?? {};
      addProperty(existing, path, service);
    } else {
      const created = {};
      record[key] = created;
      addProperty(created, path, service);
    }
  }
}

export function promote<T>(
  target: T,
  promotions: ServicePromotion[],
  container: ModulesContainer,
) {
  const promoted = target as Promoted<T>;
  orderBy(promotions, (it) => it.path.length).forEach(({ path, service }) => {
    const registered = container.get(service);
    addProperty(promoted, path, registered);
  });
  return promoted;
}
