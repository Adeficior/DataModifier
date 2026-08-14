import arg from "arg";
import { exists, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { generateTemplate } from "./templates";

const args = arg({
  "--help": Boolean,
  "--module": Boolean,
  "--path": String,
});

const name = args._[0];

// TODO use input
if (!name) throw new Error("no name given");

const parent = resolve(args["--path"] ?? ".");
const path = join(parent, name);

if (await exists(path)) {
  throw new Error(`folder already exists at ${name}`);
}

await mkdir(path, { recursive: true });
await generateTemplate(["module"], path, { name });
