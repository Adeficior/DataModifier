import { writeTemplate } from "./write";

export async function generateStubTypes(typesDir: string, strictIds = false) {
  const stubIdType = strictIds ? "`${string}:${string}`" : "string";

  await writeTemplate(
    typesDir,
    "registry",
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
  );
}
