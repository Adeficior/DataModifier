import type { BaseContext } from "@adeficior/pack-resolver";
import type { Id, IdInput } from "../../common/id.js";
import { prefix } from "../../common/id.js";
import type { Blockstate } from "../../schema/assets/blockstate.js";
import CustomEmitter from "../custom.js";
import type { ClearableEmitter } from "../index.js";

export interface BlockstateRules {
  add(id: IdInput, blockstate: Blockstate): void;
  basic(id: IdInput, model?: string): void;
  cog(id: IdInput, model?: string): void;
}

export default class BlockstateEmitter
  implements BlockstateRules, ClearableEmitter
{
  private readonly custom = new CustomEmitter<Blockstate>(this.filePath);

  private filePath(id: Id) {
    return `assets/${id.namespace}/blockstates/${id.path}.json`;
  }

  add(id: IdInput, blockstate: Blockstate) {
    this.custom.add(id, blockstate);
  }

  resolver(context: BaseContext) {
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
