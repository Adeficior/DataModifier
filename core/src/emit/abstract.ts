import type { Acceptable, Resolver } from "@adeficior/pack-resolver";
import type { LoaderContext } from "../common/context";
import type { Id } from "../common/id";

export type PathProvider = (id: Id) => string;

export type ClearableEmitter = {
  clear(): void;
  resolver(context: LoaderContext): Resolver<Acceptable, LoaderContext>;
};
