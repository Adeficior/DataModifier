import {
  createLogger,
  createResolver,
  type Logger,
} from "@adeficior/pack-resolver";
import { existsSync } from "fs";
import RegistryDumpLoader from "../loader/registry/dump.js";
import {
  generateRegistryTypes,
  generateStubTypes,
} from "./codegen/registry.js";

export async function generateDumpTypes(
  dumpDir: string | undefined,
  output: string,
  logger: Logger = createLogger(),
) {
  if (dumpDir && existsSync(dumpDir)) {
    const resolver = createResolver({ from: dumpDir, logger });

    const registry = new RegistryDumpLoader();
    await resolver.extract(registry);

    await generateRegistryTypes(registry, output);
    logger.info("successfully generated registry entry types");
  } else {
    logger.warn("registry dump missing, generating stub types");
    await generateStubTypes(output);
  }
}
