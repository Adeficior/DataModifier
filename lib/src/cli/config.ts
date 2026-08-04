import type { Logger } from "@adeficior/pack-resolver";
import parseArgs from "arg";
import commandLineUsage from "command-line-usage";

export type CliAction = "help" | "codegen";

export default interface CliConfig {
  resources: string[];
  output: string;
  registryDump?: string;
  action: CliAction;
}

export function fromArgs(argv = process.argv): CliConfig {
  const args = parseArgs(
    {
      "--help": Boolean,
      "--resources": [String],
      "--output": String,
      "--registry-dump": String,
      "-h": "--help",
    },
    { argv, permissive: true },
  );

  const defaultOutput = "@types";

  if (args["--help"]) {
    return { action: "help", resources: [], output: defaultOutput };
  }

  const action = args["--help"] ? "help" : (args._[2] as CliAction);

  if (!action) throw new Error("no action specified");

  return {
    resources: args["--resources"] ?? [],
    registryDump: args["--registry-dump"],
    output: args["--output"] ?? defaultOutput,
    action,
  };
}

export function printHelp(logger: Logger) {
  const usage = commandLineUsage([
    {
      header: "Data Modifier",
      content: "Generate datapacks by modifying default resources",
    },
    {
      header: "Options",
      optionList: [
        {
          name: "resources",
          typeLabel: "directory[]",
          multiple: true,
          description: "folder to load resources from",
        },
        {
          name: "output",
          typeLabel: "file",
          description: "output folder where generated files are placed",
        },
        {
          name: "registry-dump",
          typeLabel: "directory",
          description: "folder to load registry dump files from",
        },
        {
          name: "help",
          alias: "h",
          type: Boolean,
          description: "Prints this usage guide",
        },
      ],
    },
  ]);

  logger.info(usage);
}
