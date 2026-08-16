import { format } from "prettier";

export function moduleTemplate(module: string, ...content: string[]) {
  const replaced = `
        declare module '${module}' {
            ${content.join("\n\n")}
        }`;

  return format(replaced, { parser: "typescript" });
}
