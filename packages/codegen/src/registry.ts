import type {
  Id,
  IdInput,
  ModuleConfig,
  RegistryLookup,
} from "@adeficior/data-modifier-core";
import { createId, encodeId } from "@adeficior/data-modifier-core";
import { camelCase, uniqBy } from "lodash-es";
import { moduleTemplate } from "./typescript";
import { writeTemplate } from "./write";

export function idType(id: Id) {
  const cased = camelCase(id.path.replaceAll("/", " "));
  const transformed = cased.charAt(0).toUpperCase() + cased.substring(1);
  return `${transformed}Id`;
}

function idTemplate(type: string, values: IdInput[]) {
  return `
        export type ${type} = ${values.map((it) => `'${encodeId(it)}'`).join(" | ")}
   `;
}

function inferRegistryTemplate(keys: IdInput[]) {
  if (keys.length === 0) throw new Error("no registry found");
  return `
        export type InferIds<T extends RegistryId> = {
            ${keys
              .map((it) => `'${encodeId(it)}': ${idType(createId(it))}`)
              .join("\n")}
        }[T]
      `;
}

export function gatherRegistryIds(modules: ModuleConfig[]) {
  return uniqBy(
    modules.flatMap((it) => it.types.registries).map(createId),
    encodeId,
  );
}

export async function generateRegistryTypes(
  typesDir: string,
  lookup: RegistryLookup,
  modules: ModuleConfig[],
) {
  const registries = gatherRegistryIds(modules);
  const registryBlock = idTemplate("Registry", registries);
  const inferIdBlock = inferRegistryTemplate(registries);

  const idBlocks = gatherRegistryIds(modules)
    .filter((it) => it.namespace === "minecraft")
    .map((id) => {
      const keys = [...lookup.keys(id)!].sort();
      const type = idType(id);
      return idTemplate(type, keys);
    });

  await writeTemplate(
    typesDir,
    "registry",
    await moduleTemplate(
      "@adeficior/data-modifier/generated",
      registryBlock,
      ...idBlocks,
      inferIdBlock,
    ),
  );
}
