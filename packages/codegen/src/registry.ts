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
  const path =
    id.namespace === "minecraft" ? id.path : `${id.namespace}/${id.path}`;
  const cased = camelCase(path.replaceAll("/", " "));
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
  const registryBlock = idTemplate("RegistryId", registries);
  const inferIdBlock = inferRegistryTemplate(registries);

  const idBlocks = registries.map((id) => {
    // ID will always have no namespace, fix in registry dump
    const keys = lookup.keys(id)?.toArray().toSorted();
    const type = idType(id);
    if (!keys?.length) return `export type ${type} = never`;
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
