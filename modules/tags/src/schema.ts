import { type TagEntry } from "@adeficior/data-modifier-core";

export type TagDefinition = Readonly<{
  replace?: boolean;
  values?: TagEntry[];
  remove?: TagEntry[];
}>;
