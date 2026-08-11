import { basename, dirname, resolve } from "node:path";
import {
  generateModuleStubTypes,
  generateModuleTypes,
} from "../../codegen/src/modules";
import { generateStubTypes } from "../../codegen/src/registry";

export async function generateTypes(dir: string) {
  const type = basename(dirname(resolve(dir)));

  if (type === "packages") {
    await generateModuleStubTypes(dir);
  } else {
    await generateModuleTypes(dir);
  }

  await generateStubTypes(dir);
}
