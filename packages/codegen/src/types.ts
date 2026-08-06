import type {
  ModuleConfig,
  PackLoaderOptions,
} from "@adeficior/data-modifier-core";
import { join } from "node:path";
import { generateServices } from "./services";
import { writeTemplate } from "./write";

export async function generateTypes(
  dir: string,
  modules: ModuleConfig[],
  options: PackLoaderOptions,
) {
  const servicesTypes = generateServices(modules, options);
  const typesDir = join(dir, "@types");
  await writeTemplate(typesDir, "modules", servicesTypes);
}
