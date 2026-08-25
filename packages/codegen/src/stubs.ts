import { createId } from "@adeficior/data-modifier-core";
import type { ModuleConfig } from "@adeficior/data-modifier-core";
import { uniq } from "@adeficior/pack-resolver";
import { idType } from "./registry";
import { moduleTemplate } from "./typescript";
import { writeTemplate } from "./write";

export async function generateStubTypes(
  typesDir: string,
  modules: ModuleConfig[] = [],
  strictIds = true,
) {
  const stubIdType = strictIds ? "`${string}:${string}`" : "string";

  const idTypes = uniq(
    modules
      .flatMap((it) => it.types.registries)
      .map(createId)
      .map(idType),
  );

  await writeTemplate(
    typesDir,
    "registry",
    await moduleTemplate(
      "@adeficior/data-modifier/generated",
      /* typescript */ `
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            export type InferIds<T extends RegistryId> = ${stubIdType}

            export type RegistryId = ${stubIdType}
      `,
      ...idTypes.map(
        (it) => /* typescript */ `export type ${it} = ${stubIdType}`,
      ),
    ),
  );
}
