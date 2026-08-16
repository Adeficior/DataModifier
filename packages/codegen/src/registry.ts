import type {
  Id,
  IdInput,
  RegistryLookup,
} from "@adeficior/data-modifier-core";
import { createId, encodeId } from "@adeficior/data-modifier-core";
import { camelCase } from "lodash-es";
import { moduleTemplate } from "./typescript";
import { writeTemplate } from "./write";

function idType(id: Id) {
  const cased = camelCase(id.path.replaceAll("/", " "));
  return cased.charAt(0).toUpperCase() + cased.substring(1);
}

function idTemplate(type: string, values: string[]) {
  return `
        export type ${type}Id = ${values.map((it) => `'${it}'`).join(" | ")}
   `;
}

function inferRegistryTemplate(keys: IdInput[]) {
  if (keys.length === 0) throw new Error("no registry found");
  return `
        export type InferIds<T extends RegistryId> = {
            ${keys
              .map((it) => `'${encodeId(it)}': ${idType(createId(it))}Id`)
              .join("\n")}
        }[T]
      `;
}

export async function generateRegistryTypes(
  typesDir: string,
  lookup: RegistryLookup,
) {
  const registryBlock = idTemplate("Registry", lookup.registries());
  const inferIdBlock = inferRegistryTemplate(lookup.registries());

  const idBlocks = lookup
    .registries()
    .map(createId)
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
