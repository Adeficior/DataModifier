import {
  createLogger,
  createResolver,
  type Logger,
  type Resolver,
} from "@adeficior/pack-resolver";
import { name } from "../package.json";
import { defineModule, type AfterSetupEvent } from "./modules/define";
import { RegistryDumpLoader } from "./registry/dump";
import { EmptyRegistryLookup } from "./registry/empty";
import { type RegistryLookup } from "./registry/lookup";

export type CoreModuleOptions = {
  logger?: Logger;
  dump?: true | string | Resolver;
};

async function resolveDumpDir({
  dump,
}: CoreModuleOptions): Promise<Resolver | null> {
  if (!dump) return null;
  if (dump === true) return resolveDumpDir({ dump: "dump" });
  if (typeof dump === "string")
    return createResolver({ from: dump, logger: false });
  return dump;
}

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
    const dumpResolver = await resolveDumpDir(pack.options);

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
