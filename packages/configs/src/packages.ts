import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { format } from "prettier";
import rootPackage from "../../../package.json";

export type PackageJson = {
  name: string;
  version: string;
  private?: boolean;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  exports?: Record<string, string>;
  types?: string;
  typesVersions?: {
    "*": Record<string, [string]>;
  };
  scripts?: Record<string, string>;
};

export async function readPackage(dir: string) {
  const json = await Bun.file(join(dir, "package.json")).json();
  return json as PackageJson;
}

export async function writePackage(dir: string, content: PackageJson) {
  const out = Bun.file(join(dir, "package.json"));
  const formatted = await format(JSON.stringify(content), { parser: "json" });
  await out.write(formatted);
}

export async function findWorkspacePackages() {
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

      // no longer necessary, because modules export src directly,
      // only being replaced with the dist equivalents when pruning before release
      // const paths = Object.fromEntries(
      //   Object.entries(json.exports ?? {}).map(([key, dist]) => [
      //     key.substring(1),
      //     dist.substring(1).replace("/dist/", "/src/").replace(".js", ".ts"),
      //   ]),
      // );
      const internal = json.private === true;
      return {
        dir,
        name: json.name,
        version: json.version,
        paths: [],
        internal,
      };
    }),
  );
}
