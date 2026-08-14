import type {
  RegistryLookup,
  SemVerInput,
} from "@adeficior/data-modifier-core";
import {
  VersionedSerializer,
  WrapperSerializer,
} from "@adeficior/data-modifier-core/serializer";
import type {
  Serializer,
  SerializerModule,
} from "@adeficior/data-modifier-core/serializer";
import { Result } from "../../result/impl";
import { serializer15 } from "./15";
import { serializer44 } from "./44";

export type ResultSerializer = Serializer<Result, ResultSerializer>;

export function createResultSerializer(
  packFormat: SemVerInput,
  lookup: RegistryLookup,
): ResultSerializer {
  return new ResultSerializerImpl(packFormat, lookup);
}

class ResultSerializerImpl
  extends VersionedSerializer<Result, ResultSerializer>
  implements ResultSerializer
{
  constructor(packFormat: SemVerInput, lookup: RegistryLookup) {
    super(packFormat, lookup, Result, {
      15: serializer15,
      44: serializer44,
    });
  }

  withModule(module: SerializerModule<Result>): ResultSerializer {
    return new WrapperSerializer<Result, ResultSerializer>(this, module);
  }
}
