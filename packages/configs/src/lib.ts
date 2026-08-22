import { exists, writeFile } from "node:fs/promises";
import { join, sep } from "node:path";
import { format } from "prettier";
import selfPackage from "../package.json";
import {
  findWorkspacePackages,
  readPackage,
  type PackageJson,
} from "./packages";

async function writeJson(path: string, content: unknown) {
  const json = JSON.stringify(content, null, 2);
  const formatted = await format(json, { parser: "json" });
  await writeFile(path, formatted);
}

async function writeJs(path: string, content: string) {
  const formatted = await format(content, { parser: "typescript" });
  await writeFile(path, formatted);
}

async function getDependencies(json: PackageJson) {
  return Object.keys({
    ...json.devDependencies,
    ...json.dependencies,
    ...json.peerDependencies,
  });
}

export default async function generateConfigs(dir: string) {
  if (dir.endsWith("configs")) return;

  const exclude: string[] = [];
  const include = ["src"];
  if (await exists(join(dir, "test"))) {
    include.push("test");
    exclude.push("test/resources");
  }

  const packages = await findWorkspacePackages();
  const json = await readPackage(dir);
  const dependencies = await getDependencies(json);
  const packagePaths = Object.fromEntries(
    packages
      .filter((it) => it.name !== selfPackage.name)
      .filter((it) => dependencies.includes(it.name))
      .map((it) => ({ ...it, dir: it.dir.replaceAll(sep, "/") }))
      .flatMap(({ dir, name, paths }) =>
        Object.entries(paths).map(([path, file]) => [
          name + path,
          [dir + file],
        ]),
      ),
    //.map((it) => [it.name, [`${it.dir.replaceAll(sep, "/")}/src/index.ts`]]),
  );

  const isModule = [...dependencies, json.name].some((it) =>
    ["@adeficior/data-modifier-core", "@adeficior/data-modifier"].includes(it),
  );

  await writeJson(join(dir, "tsconfig.json"), {
    extends: "@adeficior/configs/tsconfig",
    compilerOptions: {
      paths: { ...packagePaths, ...(await createPaths(isModule)) },
    },
    include,
    exclude,
  });

  await writeJson(join(dir, "tsconfig.build.json"), {
    extends: "@adeficior/configs/tsconfig",
    compilerOptions: {
      rootDir: "./src",
      outDir: "./dist",
      declaration: true,
      sourceMap: true,
      paths: await createPaths(isModule),
    },
    include: ["src"],
  });

  await writeJs(
    join(dir, "eslint.config.js"),
    /* javascript */ `
    //@ts-check
      import { eslintConfig } from "@adeficior/configs/eslint";
      import { defineConfig, globalIgnores } from "eslint/config";

      export default defineConfig([
        globalIgnores(["test/resources/**"]),
        eslintConfig(import.meta.dirname),
      ]);
  `,
  );
}

async function createPaths(isModule: boolean) {
  const paths: Record<string, [string]> = {
    "@adeficior/data-modifier/generated": ["./@types/registry.d.ts"],
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
