export type SemVerInput = SemVer | string;

type SemVer = {
  major: number;
  minor: number;
  patch: number;
};

export function parseSemVer(input: SemVerInput): SemVer {
  if (typeof input !== "string") return input;

  const parts = input.split(".").map((it) => Number.parseInt(it));
  if (parts.some((it) => Number.isNaN(it)))
    throw new Error(`invalid semver format: ${input}`);
  const [major, minor = 0, patch = 0] = parts;
  if (!major) throw new Error(`major version missing: ${input}`);
  return { major, minor, patch };
}

export function comparseVersions(a: SemVerInput, b: SemVerInput) {
  const [va, vb] = [a, b].map(parseSemVer) as [SemVer, SemVer];
  if (va.major > vb.major) return 1;
  if (va.major < vb.major) return -1;
  if (va.minor > vb.minor) return 1;
  if (va.minor < vb.minor) return -1;
  if (va.patch > vb.patch) return 1;
  if (va.patch < vb.patch) return -1;
  return 0;
}

export function isAtLeastVersion(input: SemVerInput, reference: SemVerInput) {
  return comparseVersions(input, reference) >= 0;
}

function defineFormats(input: Record<string, string>) {
  const formats = Object.entries(input)
    .map((versions) => {
      const [minecraftVersion, packFormat] = versions.map(parseSemVer) as [
        SemVer,
        SemVer,
      ];

      return { minecraftVersion, packFormat };
    })
    .toSorted((...versions) =>
      comparseVersions(
        ...(versions.map((it) => it.packFormat) as [SemVer, SemVer]),
      ),
    )
    .toReversed();

  return (input: SemVerInput): SemVer => {
    const match = formats.find((it) =>
      isAtLeastVersion(input, it.minecraftVersion),
    );
    if (match) return match.packFormat;
    throw new Error(
      `unknown minecraft version '${input}', please pass packFormat manually`,
    );
  };
}

export const packFormatOf = defineFormats({
  "1.20": "15",
  "1.20.2": "18",
  "1.20.3": "26",
  "1.20.5": "41",
  "1.21": "48",
  "1.21.2": "57",
  "1.21.4": "61",
  "1.21.5": "71",
  "1.21.6": "80",
  "1.21.7": "81",
  "1.21.9": "88.0",
});

export function lootTableFolder(packFormat: SemVerInput) {
  return isAtLeastVersion(packFormat, "44") ? "loot_table" : "loot_tables";
}

export function recipeFolder(packFormat: SemVerInput) {
  return isAtLeastVersion(packFormat, "44") ? "recipe" : "recipes";
}
