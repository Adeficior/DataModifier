import {
  createId,
  encodeId,
  type IdInput,
  type NormalizedId,
  type TagEntry,
} from "@adeficior/data-modifier-core";
import orderBy from "lodash-es/orderBy";
import uniqBy from "lodash-es/uniqBy";

export function entryId(entry: TagEntry): NormalizedId {
  if (typeof entry === "string") return encodeId(entry);
  else return encodeId(entry.id);
}

export function orderTagEntries(entries: TagEntry[]) {
  return orderBy(
    uniqBy(entries, (it) => entryId(it)),
    (it) => entryId(it),
  );
}

export function tagFolderOf(registry: IdInput) {
  const { path } = createId(registry);
  return path;
}
