import { basename, dirname, join, resolve } from "node:path";
import {
  generateModuleStubTypes,
  generateModuleTypes,
} from "../../codegen/src/modules";
import { generateStubTypes } from "../../codegen/src/stubs";

export async function generateTypes(dir: string) {
  const type = basename(dirname(resolve(dir)));
  const typesDir = join(dir, "@types");

  if (type === "packages") {
    await generateModuleStubTypes(typesDir);
  } else {
    await generateModuleTypes(dir, typesDir);
  }

  await generateStubTypes(typesDir);
}
