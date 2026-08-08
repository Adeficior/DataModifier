import { exists, readdir, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { format } from "prettier";
import rootPackage from "../../../package.json";

async function writeJson(path: string, content: unknown) {
  const json = JSON.stringify(content, null, 2);
  const formatted = await format(json, { parser: "json" });
  await writeFile(path, formatted);
}

async function writeJs(path: string, content: string) {
  const formatted = await format(content, { parser: "typescript" });
  await writeFile(path, formatted);
}

type PackageJson = {
  name: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  exports?: Record<string, string>;
};

async function readPackage(dir: string) {
  const json = await Bun.file(join(dir, "package.json")).json();
  return json as PackageJson;
}

async function findWorkspacePackages() {
  const rootDir = relative(".", join(import.meta.dir, "../../.."));

  const workspaces = await Promise.all(
    rootPackage.workspaces.map(async (pattern) => {
      if (pattern.endsWith("/*")) {
        const parent = join(rootDir, pattern.substring(0, pattern.length - 2));
        const children = await readdir(parent);
        return children.map((it) => join(parent, it));
      } else {
        return [join(rootDir, pattern)];
      }
    }),
  ).then((it) => it.flat());

  return Promise.all(
    workspaces.map(async (dir) => {
      const json = await readPackage(dir);
      const paths = Object.fromEntries(
        Object.entries(json.exports ?? {}).map(([key, dist]) => [
          key.substring(1),
          dist.substring(1).replace("/dist/", "/src/").replace(".js", ".ts"),
        ]),
      );
      return { dir, name: json.name, paths };
    }),
  );
}

async function getDependencies(dir: string) {
  const json = await readPackage(dir);
  return Object.keys({
    ...json.devDependencies,
    ...json.dependencies,
    ...json.peerDependencies,
  });
}

export default async function generateConfigs(dir: string) {
  if (dir.endsWith("configs")) return;

  const include = ["src"];
  if (await exists(join(dir, "test"))) {
    include.push("test");
  }

  const packages = await findWorkspacePackages();
  const dependencies = await getDependencies(dir);
  const packagePaths = Object.fromEntries(
    packages
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

  await writeJson(join(dir, "tsconfig.json"), {
    extends: "@adeficior/configs/tsconfig",
    compilerOptions: {
      paths: { ...packagePaths, ...(await createPaths(dir)) },
    },
    include,
  });

  await writeJson(join(dir, "tsconfig.build.json"), {
    extends: "@adeficior/configs/tsconfig",
    compilerOptions: {
      rootDir: "./src",
      outDir: "./dist",
      declaration: true,
      sourceMap: true,
      paths: await createPaths(dir),
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
