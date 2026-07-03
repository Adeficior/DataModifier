import type { Acceptable } from "@adeficior/pack-resolver";
import json from "json5";
import { format } from "prettier";

export function fromJson(input: Acceptable) {
  const data = input.toString();
  return json.parse(data.replaceAll("\r\n", ""));
}

export function toJson(input: unknown) {
  return formatJson(JSON.stringify(input));
}

export function formatJson(input: string) {
  return format(input, { parser: "json" });
}
