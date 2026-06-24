import zod from "zod";

export type Id = Readonly<{
  namespace: string;
  path: string;
  isTag?: boolean;
}>;

export type IdInput<T extends string = string> = T | Id;

export type NormalizedId<T extends string = string> =
  T extends `${string}:${string}`
    ? T
    : T extends `#${infer R}`
      ? `#${string}:${R}`
      : `${string}:${T}`;

export type TagId = NormalizedId<`#${string}`>;

export type TagInput = IdInput<`#${string}`>;

export const IdSchema = zod
  .string()
  .regex(/^([a-z0-9_.-]+:)?[a-z0-9/._-]+$/i)
  .describe("Valid ID");

export const TagSchema = zod
  .string()
  .regex(/^#([a-z0-9_.-]+:)?[a-z0-9/._-]+$/i)
  .describe("Valid Tag-ID") as zod.ZodType<`#${string}`>;

export const IdOrTagSchema = zod
  .string()
  .regex(/^#?([a-z0-9_.-]+:)?[a-z0-9/._-]+$/i)
  .describe("Valid ID or Tag-ID");

export function createId(from: IdInput): Id {
  if (typeof from !== "string") return from;
  if (from.startsWith("#"))
    return { ...createId(from.substring(1)), isTag: true };

  IdSchema.parse(from);

  if (!from.includes(":")) return { namespace: "minecraft", path: from };
  const [namespace, path] = from.split(":") as [string, string];
  return { namespace, path };
}

export function encodeId<T extends string>(from: IdInput<T>): NormalizedId<T> {
  if (typeof from === "string") {
    if (from.includes(":")) return from as NormalizedId<T>;
    if (from.startsWith("#"))
      return `#minecraft:${from.substring(1)}` as NormalizedId<T>;
    return `minecraft:${from}` as NormalizedId<T>;
  }
  if (from.isTag) return `#${from.namespace}:${from.path}` as NormalizedId<T>;
  return `${from.namespace}:${from.path}` as NormalizedId<T>;
}

export function toTag(from: IdInput): TagId {
  return encodeId({ ...createId(from), isTag: true }) as TagId;
}

export function stripTag(from: IdInput): NormalizedId {
  return encodeId({ ...createId(from), isTag: false });
}

export function prefix(id: IdInput, prefix: string) {
  const { path, ...rest } = createId(id);
  return encodeId({ ...rest, path: prefix + path });
}

export function suffix(id: IdInput, suffix: string) {
  const { path, ...rest } = createId(id);
  return encodeId({ ...rest, path: path + suffix });
}
