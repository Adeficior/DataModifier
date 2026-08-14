import { relative, resolve } from "node:path";
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

export async function prunePackage(dir: string) {
  const current = await readPackage(dir);
  const workspaces = await findWorkspacePackages();

  const relativeDir = relative(root, resolve(dir)).replaceAll("\\", "/");

  function pruneDependencies(from: Record<string, string> = {}) {
    const filtered = Object.fromEntries(
      Object.entries(from).filter(([key]) => {
        const workspace = workspaces.find((it) => it.name === key);
        return !workspace?.internal;
      }),
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

  const generated = {
    ...pruned,
    bugs: { url: `https://github.com/${repository}/issues` },
    homepage: `https://github.com/${repository}#readme`,
    license: "ISC",
    repository: {
      type: "git",
      url: `git+https://github.com/${repository}.git`,
      directory: relativeDir,
    },
    publishConfig,
  };

  await writePackage(dir, generated);
}
