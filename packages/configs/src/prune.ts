import { relative, resolve } from "node:path";
import rootPackage from "../../../package.json";
import {
  findWorkspacePackages,
  readPackage,
  writePackage,
  type PackageJson,
} from "./packages";

const root = resolve(import.meta.dir, "..", "..", "..");

const repository = "Adeficior/DataModifier";

const publishConfig =
  process.env.CI === "true"
    ? {
        provenance: true,
      }
    : undefined;

const catalog: Record<string, string | undefined> = rootPackage.catalog;

function toDist(file: string) {
  return file.replace("/src/", "/dist/").replace(/\.ts$/, ".js");
}

function toTypesDefinition(file: string) {
  return file.replace("/src/", "/dist/").replace(/\.ts$/, ".d.ts");
}

export async function prunePackage(dir: string, dryRun = false) {
  const current = await readPackage(dir);
  const workspaces = await findWorkspacePackages();

  const relativeDir = relative(root, resolve(dir)).replaceAll("\\", "/");

  function resolveVersionReference(key: string, reference: string) {
    if (reference === "catalog:") {
      const version = catalog[key];
      if (!version) throw new Error(`unknown catalog reference: ${key}`);
      return version;
    }

    if (reference === "workspace:*") {
      const workspace = workspaces.find((it) => it.name === key);
      if (!workspace) throw new Error(`package not in workspace: ${key}`);
      return `^${workspace.version}`;
    }

    return reference;
  }

  function pruneDependencies(from: Record<string, string> = {}) {
    const filtered = Object.fromEntries(
      Object.entries(from)
        .filter(([key]) => {
          const workspace = workspaces.find((it) => it.name === key);
          return !workspace?.internal;
        })
        .map(([key, reference]) => [
          key,
          resolveVersionReference(key, reference),
        ]),
    );
    if (Object.keys(filtered).length === 0) return undefined;
    return filtered;
  }

  const pruned = {
    ...current,
    dependencies: pruneDependencies(current.dependencies),
    peerDependencies: pruneDependencies(current.peerDependencies),
    devDependencies: pruneDependencies(current.devDependencies),
    scripts: undefined,
  } satisfies PackageJson;

  function generateExports() {
    const json: Required<Pick<PackageJson, "exports" | "typesVersions">> &
      Pick<PackageJson, "types"> = {
      exports: {},
      typesVersions: {
        "*": {},
      },
    };

    Object.entries(current.exports ?? {}).forEach(([key, file]) => {
      json.exports[key] = toDist(file);
      if (key === ".") {
        json.types = toTypesDefinition(file);
      } else {
        json.typesVersions["*"][key] = [toTypesDefinition(file)];
      }
    });

    return {
      ...json,
      files: ["dist"],
    };
  }

  const generated = {
    ...pruned,
    ...generateExports(),
    bugs: { url: `https://github.com/${repository}/issues` },
    homepage: `https://github.com/${repository}#readme`,
    license: "LGPL-3.0-or-later",
    repository: {
      type: "git",
      url: `git+https://github.com/${repository}.git`,
      directory: relativeDir,
    },
    publishConfig,
  };

  if (dryRun) {
    console.log(generated);
  } else {
    await writePackage(dir, generated);
  }
}
