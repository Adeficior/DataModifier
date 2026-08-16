import type {
  Container,
  ServicePromotion,
} from "@adeficior/data-modifier-core";
import type { Promotions } from "@adeficior/data-modifier-core/generated";

//export type Promoted<
//  T,
//  TTarget extends string,
//> = TTarget extends keyof Promotions ? T & Promotions[TTarget] : T;

export type Promoted<
  T,
  TTarget extends keyof Promotions,
> = Promotions[TTarget] & T;

export function promote<T, TTarget extends keyof Promotions>(
  value: T,
  promotions: Omit<ServicePromotion, "target">[],
  container: Container,
) {
  const promoted = value as Promoted<T, TTarget>;
  promotions.forEach(({ key, service }) => {
    const registered = container.get(service);
    Object.defineProperty(promoted, key, {
      value: registered,
      writable: false,
    });
  });
  return promoted;
}
