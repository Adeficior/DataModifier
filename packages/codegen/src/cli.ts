import { join } from "node:path";
import { generateModuleTypes } from "./modules";
import { generateStubTypes } from "./registry";

const dir = ".";
await generateModuleTypes(dir);
await generateStubTypes(join(dir, "@types", "registry.d.ts"));

// TODO find out why this is needed
process.exit(0);
