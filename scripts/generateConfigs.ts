import { exists, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { format } from "prettier";
import { workspaces } from "../package.json";

async function writeJson(path: string, content: unknown) {
  const json = JSON.stringify(content, null, 2);
  const formatted = await format(json, { parser: "json" });
  await writeFile(path, formatted);
}

async function writeJs(path: string, content: string) {
  const formatted = await format(content, { parser: "typescript" });
  await writeFile(path, formatted);
}

async function generateConfigsIn(dir: string) {
  if (dir.endsWith("configs")) return;

  const include = ["src"];
  if (await exists(join(dir, "test"))) {
    include.push("test");
  }

  await writeJson(join(dir, "tsconfig.json"), {
    extends: "@adeficior/configs/tsconfig",
    include,
  });

  await writeJson(join(dir, "tsconfig.build.json"), {
    extends: "@adeficior/configs/tsconfig/build",
    compilerOptions: {
      rootDir: "./src",
      outDir: "./dist",
    },
    include: ["src"],
  });

  await writeJs(
    join(dir, "eslint.config.js"),
    /* javascript */ `
      //@ts-check
      import { eslintConfig } from "@adeficior/configs/eslint";
      import { defineConfig } from "eslint/config";

      export default defineConfig(eslintConfig(import.meta.dirname));
  `,
  );
}

export default async function generateConfigs() {
  for (const workspace of workspaces) {
    if (workspace.endsWith("/*")) {
      const folder = workspace.substring(0, workspace.length - 2);
      const children = await readdir(folder);
      for (const child of children) {
        await generateConfigsIn(join(folder, child));
      }
    } else {
      await generateConfigsIn(workspace);
    }
  }
}
