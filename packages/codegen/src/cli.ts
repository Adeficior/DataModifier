import { generateModuleTypes } from "./modules";
import { generateStubTypes } from "./registry";

const dir = ".";
await generateModuleTypes(dir);
await generateStubTypes(dir);

// TODO find out why this is needed
process.exit(0);
