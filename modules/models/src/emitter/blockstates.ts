import type {
  ClearableEmitter,
  Id,
  IdInput,
  LoaderContext,
} from "@adeficior/data-modifier-core";
import { CustomEmitter, prefix } from "@adeficior/data-modifier-core";
import type { Blockstate } from "../schema";

export interface BlockstateEmitter {
  add(id: IdInput, blockstate: Blockstate): void;
  basic(id: IdInput, model?: string): void;
  cog(id: IdInput, model?: string): void;
}

export class BlockstateEmitterImpl
  implements BlockstateEmitter, ClearableEmitter
{
  private readonly custom = new CustomEmitter<Blockstate>(this.filePath);

  private filePath(id: Id) {
    return `assets/${id.namespace}/blockstates/${id.path}.json`;
  }

  add(id: IdInput, blockstate: Blockstate) {
    this.custom.add(id, blockstate);
  }

  resolver(context: LoaderContext) {
    return this.custom.resolver(context);
  }

  clear() {
    this.custom.clear();
  }

  basic(id: IdInput, model = prefix(id, "block/")) {
    this.add(id, {
      variants: {
        "": {
          model,
        },
      },
    });
  }

  cog(id: IdInput, model = prefix(id, "block/")) {
    this.add(id, {
      variants: {
        "axis=x": {
          model,
          x: 90,
          y: 90,
        },
        "axis=y": {
          model,
        },
        "axis=z": {
          model,
          x: 90,
          y: 180,
        },
      },
    });
  }
}
