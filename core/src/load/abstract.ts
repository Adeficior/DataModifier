import { type Acceptable, type Acceptor } from "@adeficior/pack-resolver";
import { type LoaderContext } from "../common/context";

export type Loader = Acceptor<Acceptable, LoaderContext>;
