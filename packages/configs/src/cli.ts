import { generateTypes } from "./codegen";
import generateConfigs from "./lib";

await generateConfigs(".");
await generateTypes(".");

// TODO find out why this is needed
process.exit(0);
