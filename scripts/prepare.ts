import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { workspaces } from "../package.json";
import generateConfigs from "./generateConfigs";
import { generateModuleTypes } from "./generateTypes";

async function prepare(workspace: string) {
  await generateConfigs(workspace);
  if (!workspace.startsWith("packages")) {
    await generateModuleTypes(workspace);
  }
}

for (const workspace of workspaces) {
  if (workspace.endsWith("/*")) {
    const folder = workspace.substring(0, workspace.length - 2);
    const children = await readdir(folder);
    for (const child of children) {
      await prepare(join(folder, child));
    }
  } else {
    await prepare(workspace);
  }
}
