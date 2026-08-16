import { exists, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export async function writeTemplate(
  dir: string,
  name: string,
  content: string,
) {
  const path = join(dir, `${name}.d.ts`);
  const parent = dirname(path);
  if (!(await exists(parent))) await mkdir(parent, { recursive: true });

  await writeFile(path, content);
}
