import {
  combineResolvers,
  simpleResolver,
  type Logger,
  type Resolver,
} from "@adeficior/pack-resolver";
import { parseSemVer, type SemVerInput } from "../packFormat";
import { toJson } from "../textHelper";

export type PackMetadata = {
  pack: {
    pack_format: number;
    description: string;
  };
};

type PackMetadataInput = {
  packFormat: SemVerInput;
  logger: Logger;
  description?: string;
};

export function generatePackMetadata({
  logger,
  packFormat,
  description = "generated resources",
}: PackMetadataInput): Resolver {
  const { major } = parseSemVer(packFormat);

  const metadata: PackMetadata = {
    pack: {
      pack_format: major,
      description: description,
    },
  };

  return simpleResolver(
    async (acceptor) => {
      await acceptor("pack.mcmeta", toJson(metadata));
    },
    { logger },
  );
}

export function overwritePackMetadata(
  resolver: Resolver,
  options: PackMetadataInput,
) {
  return combineResolvers([resolver, generatePackMetadata(options)], {
    async: false,
  });
}
