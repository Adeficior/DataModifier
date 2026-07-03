import type { BaseContext } from "@adeficior/pack-resolver";
import type { IdInput, NormalizedId } from "../../common/id.js";
import { encodeId, prefix, suffix } from "../../common/id.js";
import type { Model } from "../../schema/assets/model.js";
import CustomEmitter from "../custom.js";
import type { ClearableEmitter } from "../index.js";

export interface ModelRules {
  add(id: IdInput, blockstate: Model): NormalizedId;

  cubeAll(id: IdInput, texture?: string): NormalizedId;

  flat(id: IdInput, texture?: string): NormalizedId;

  cog(id: IdInput, large: boolean, texture?: string): NormalizedId;
}

export interface ModelRulesGroup {
  blocks: ModelRules;
  items: ModelRules;
}

export default class ModelEmitter implements ModelRules, ClearableEmitter {
  private readonly custom;

  constructor(type: string) {
    this.custom = new CustomEmitter<Model>(
      (id) => `assets/${id.namespace}/models/${type}/${id.path}.json`,
    );
  }

  clear() {
    this.custom.clear();
  }

  resolver(context: BaseContext) {
    return this.custom.resolver(context);
  }

  add(id: IdInput, model: Model) {
    this.custom.add(id, model);
    return encodeId(id);
  }

  cubeAll(id: IdInput, texture = prefix(id, "block/")) {
    return this.add(id, {
      parent: "minecraft:block/cube_all",
      textures: {
        all: texture,
      },
    });
  }

  flat(id: IdInput, texture = prefix(id, "item/")) {
    return this.add(id, {
      parent: "minecraft:item/generated",
      textures: {
        layer0: texture,
      },
    });
  }

  cog(id: IdInput, large: boolean, texture = prefix(id, "block/")) {
    const suffixes = ["", "_shaftless"];
    const [normal] = suffixes.map((it) => {
      if (large) {
        return this.add(suffix(id, it), {
          parent: "create:block/large_cogwheel" + it,
          textures: {
            "4": texture,
            particle: texture,
          },
        });
      } else {
        return this.add(suffix(id, it), {
          parent: "create:block/cogwheel" + it,
          textures: {
            "1_2": texture,
            particle: texture,
          },
        });
      }
    });

    return normal!;
  }
}
