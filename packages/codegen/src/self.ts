import { generateStubTypes } from "./registry";
import { generateTypes } from "./types";

await generateTypes(".", []);
await generateStubTypes(".");

// TODO find out why this is needed
process.exit(0);
