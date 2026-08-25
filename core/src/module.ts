import type { Logger, Resolver } from "@adeficior/pack-resolver";
import { createLogger } from "@adeficior/pack-resolver";
import { resolveDumpDir } from ".";
import type { NormalizedId } from ".";
import { name } from "../package.json";
import type { AfterSetupEvent } from "./modules/define";
import { defineModule } from "./modules/define";
import { RegistryDumpLoader } from "./registry/dump";
import { EmptyRegistryLookup } from "./registry/empty";
import type { RegistryLookup } from "./registry/lookup";

export type CoreModuleOptions = {
  logger?: Logger;
  dump?: boolean | string | Resolver;
};

const registries: NormalizedId[] = [
  "minecraft:item",
  "minecraft:block",
  "minecraft:fluid",
  "minecraft:recipe_serializer",
  "minecraft:entity_type",
  "minecraft:creative_mode_tab",
];

export default defineModule<{
  hooks: {
    "setup:after": AfterSetupEvent;
  };
  services: {
    registries: RegistryLookup;
    logger: Logger;
  };
  options: CoreModuleOptions;
}>({
  importModule: name,
  types: {
    registries,
    options: "CoreModuleOptions",
    services: {
      registries: "RegistryLookup",
      logger: {
        module: "@adeficior/pack-resolver",
        name: "Logger",
      },
    },
    hooks: {
      "setup:after": "AfterSetupEvent<T>",
    },
  },
  setup: async (pack) => {
    const dumpResolver = await resolveDumpDir(pack.options.dump);

    if (dumpResolver) {
      const loader = new RegistryDumpLoader();
      await dumpResolver.extract(loader);
      pack.service("registries", () => loader);
    } else {
      pack.service("registries", () => new EmptyRegistryLookup());
    }

    pack.service("logger", () => pack.options.logger ?? createLogger());
  },
});
