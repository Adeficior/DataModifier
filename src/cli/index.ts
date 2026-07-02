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
import { fromArgs, printHelp } from "./config.js";

const logger = createLogger();

runCli().catch((e) => logger.error("an error occurred", e));

async function runCli() {
  const config = fromArgs();

  switch (config.action) {
    case "help":
      return printHelp(logger);
    case "codegen": {
      if (!config.output) throw new Error("output not specified");
      return runCodegen(config.registryDump, config.output, logger);
    }
    default:
      throw new Error(`unknown action '${config.action}'`);
  }
}

export async function runCodegen(
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
