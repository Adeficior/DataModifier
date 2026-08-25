import { combineResolvers, extendContext } from "@adeficior/pack-resolver";
import type { LoaderContext } from "../common/context";
import type { ClearableEmitter } from "./abstract";

export class CombinedEmitters implements ClearableEmitter {
  private entries: ClearableEmitter[] = [];

  add<T extends ClearableEmitter>(emitter: T): T {
    this.entries.push(emitter);
    return emitter;
  }

  resolver(context: LoaderContext) {
    return combineResolvers(
      this.entries.map((it) =>
        it.resolver(extendContext(context, { emitter: it.constructor.name })),
      ),
      { async: true },
    );
  }

  clear() {
    this.entries.forEach((it) => it.clear());
  }
}

export abstract class WrappedEmitter implements ClearableEmitter {
  private emitters = new CombinedEmitters();

  protected addEmitter<T extends ClearableEmitter>(emitter: T): T {
    return this.emitters.add(emitter);
  }

  resolver(context: LoaderContext) {
    return this.emitters.resolver(context);
  }

  clear() {
    this.emitters.clear();
  }
}
