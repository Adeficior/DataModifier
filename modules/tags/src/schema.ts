export type TagEntry<T extends string = string> =
  | T
  | `#${string}`
  | Readonly<{
      required?: boolean;
      id: T | `#${string}`;
    }>;

export type TagDefinition = Readonly<{
  replace?: boolean;
  values?: TagEntry[];
  remove?: TagEntry[];
}>;
