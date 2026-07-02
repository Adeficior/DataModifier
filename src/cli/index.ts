import {
  createLogger,
  createResolver,
  type Logger,
} from "@adeficior/pack-resolver";
import { existsSync, mkdirSync } from "fs";
import { resolve } from "path";
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
  if (!existsSync(output)) mkdirSync(output, { recursive: true });
  const file = resolve(output, "registry.d.ts");

  if (dumpDir && existsSync(dumpDir)) {
    const resolver = createResolver({ from: dumpDir, logger });

    const registry = new RegistryDumpLoader();
    await resolver.extract(registry);

    await generateRegistryTypes(registry, file);
    logger.info("successfully generated registry entry types");
  } else {
    logger.warn("registry dump missing, generating stub types");
    await generateStubTypes(file);
  }
}
