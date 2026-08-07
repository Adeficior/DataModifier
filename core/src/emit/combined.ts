import { combineResolvers, extendContext } from "@adeficior/pack-resolver";
import { type LoaderContext } from "../common/context";
import { type ClearableEmitter } from "./abstract";

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
