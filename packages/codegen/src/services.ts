import {
  type ImportOptions,
  type ModuleConfig,
  type PackLoaderOptions,
  type SetupEvent,
} from "@adeficior/data-modifier-core";

function hasNeccessaryOptions(
  options: ImportOptions,
): options is Required<ImportOptions> {
  return !!options.name && !!options.module;
}

export function generateServices(
  modules: ModuleConfig[],
  options: PackLoaderOptions,
) {
  const services = gatherServices(modules, options);

  return /* typescript */ `
    declare module "@adeficior/data-modifier-core/generated" {
      export type Services = {
        ${services
          .map((it) => `"${it.key}": import("${it.module}").${it.name};`)
          .join("\n")}
      };
    }
  `;
}

function gatherServices(modules: ModuleConfig[], options: PackLoaderOptions) {
  const services = new Map<string, Required<ImportOptions>>();

  modules.forEach((module) => {
    const event: SetupEvent = {
      options,
      service: (key, _, options = {}) => {
        const importOptions: ImportOptions = {
          module: module.importModule,
          ...options?.import,
        };

        if (hasNeccessaryOptions(importOptions)) {
          services.set(key, importOptions);
        }

        return () => {
          throw new Error("services should only be loaded in factory method");
        };
      },
      emitter: (key, ...args) => event.service(`emitter:${key}`, ...args),
      loader: (key, ...args) => event.service(`loader:${key}`, ...args),
    };

    module.setup?.(event);
  });

  return services
    .entries()
    .map(([key, options]) => ({ key, ...options }))
    .toArray();
}
