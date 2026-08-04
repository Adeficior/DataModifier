import type { Acceptable, Resolver } from "@adeficior/pack-resolver";
import type { Id, LoaderContext } from "../common";

export type PathProvider = (id: Id) => string;

export interface ClearableEmitter {
  clear(): void;
  resolver(context: LoaderContext): Resolver<Acceptable, LoaderContext>;
}
