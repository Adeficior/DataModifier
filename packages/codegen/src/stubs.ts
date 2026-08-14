import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { format } from "prettier";

export async function generateStubTypes(dir: string, strictIds = false) {
  const stubIdType = strictIds ? "`${string}:${string}`" : "string";

  await writeFile(
    join(dir, "@types", "registry.d.ts"),
    await format(
      `
         declare module '@adeficior/data-modifier/generated' {
            type StubId = ${stubIdType}

            export type RegistryId = StubId

            export type CreativeModeTabId = StubId
            
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            export type InferIds<T extends RegistryId> = StubId
         
            export type ItemId = StubId
         
            export type BlockId = StubId
         
            export type FluidId = StubId
         
            export type RecipeSerializerId = StubId

            export type EntityTypeId = StubId
         }`,
      { parser: "typescript" },
    ),
  );
}
