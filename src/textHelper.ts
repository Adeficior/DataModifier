import type { Acceptable } from "@adeficior/pack-resolver";
import json from "json5";
import { format } from "prettier";

export function fromJson(input: Acceptable) {
  const data = input.toString();
  try {
    return json.parse(data);
  } catch (e) {
    if (e instanceof SyntaxError) {
      // TODO what the hell is happening here
      return json.parse(data.replaceAll("\r\n", ""));
    }
    throw e;
  }
}

export function toJson(input: unknown) {
  return formatJson(JSON.stringify(input));
}

export function formatJson(input: string) {
  return format(input, { parser: "json" });
}
