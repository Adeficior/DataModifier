import { exists, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { format } from "prettier";

export async function writeTemplate(
  dir: string,
  name: string,
  content: string,
) {
  const path = join(dir, `${name}.d.ts`);
  const parent = dirname(path);
  if (!(await exists(parent))) await mkdir(parent, { recursive: true });

  const formatted = await format(content, { parser: "typescript" });
  await writeFile(path, formatted);
}
