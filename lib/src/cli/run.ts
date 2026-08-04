import { createLogger } from "@adeficior/pack-resolver";
import { generateDumpTypes } from ".";
import { fromArgs, printHelp } from "./config";

const logger = createLogger();

runCli().catch((e) => logger.error("an error occurred", e));

async function runCli() {
  const config = fromArgs();

  switch (config.action) {
    case "help":
      return printHelp(logger);
    case "codegen":
      return generateDumpTypes(config.registryDump, config.output, logger);

    default:
      throw new Error(`unknown action '${config.action}'`);
  }
}
