import { exists, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";
import { format } from "prettier";

async function writeJson(path: string, content: unknown) {
  const json = JSON.stringify(content, null, 2);
  const formatted = await format(json, { parser: "json" });
  await writeFile(path, formatted);
}

async function writeJs(path: string, content: string) {
  const formatted = await format(content, { parser: "typescript" });
  await writeFile(path, formatted);
}

export default async function generateConfigs(dir: string) {
  if (dir.endsWith("configs")) return;

  const include = ["src"];
  if (await exists(join(dir, "test"))) {
    include.push("test");
  }

  await writeJson(join(dir, "tsconfig.json"), {
    extends: "@adeficior/configs/tsconfig",
    compilerOptions: {
      paths: await createPaths(dir),
    },
    include,
  });

  await writeJson(join(dir, "tsconfig.build.json"), {
    extends: "./tsconfig.json",
    compilerOptions: {
      rootDir: "./src",
      outDir: "./dist",
      declaration: true,
      sourceMap: true,
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

async function createPaths(dir: string) {
  const type = basename(dirname(resolve(dir)));
  const isModule = type !== "packages";

  const root = resolve(import.meta.dir, "..", "..", "..");
  const paths: Record<string, [string]> = {
    "@adeficior/data-modifier/generated": [
      relative(dir, join(root, "@types/generated.d.ts")).replaceAll(/\\/g, "/"),
    ],
  };

  if (isModule) {
    paths["@adeficior/data-modifier-core/generated"] = [
      "./@types/modules.d.ts",
    ];
  }

  await Promise.all(
    Object.entries(paths).map(async ([alias, [path]]) => {
      if (!exists(path)) {
        console.error(`could not resolve types for ${alias}`);
      }
    }),
  );

  return paths;
}
