import { compile } from "handlebars";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

function templatePath(...parts: string[]) {
  return join(import.meta.dir, "..", "templates", ...parts);
}

async function compileTemplate(...parts: string[]) {
  const file = templatePath(...parts);
  const content = await readFile(file);
  return compile(content.toString());
}

export async function generateTemplate(
  type: string[],
  to: string,
  context: unknown,
) {
  const folder = templatePath(...type);
  const children = await readdir(folder);

  for (const child of children) {
    const path = [...type, child];
    const output = resolve(to, ...path.slice(1));

    const info = await stat(templatePath(...path));
    if (info.isDirectory()) {
      mkdir(output);
      await generateTemplate(path, to, context);
    } else if (info.isFile()) {
      const template = await compileTemplate(...path);
      const generated = template(context);
      await writeFile(output, generated);
    }
  }
}
