import { name } from "../package.json";
import { defineModule, type AfterSetupEvent } from "./modules/define";
import { EmptyRegistryLookup } from "./registry/empty";
import { type RegistryLookup } from "./registry/lookup";

export default defineModule<{
  hooks: {
    "setup:after": AfterSetupEvent;
  };
  services: {
    registries: RegistryLookup;
  };
}>({
  importModule: name,
  types: {
    services: {
      registries: "RegistryLookup",
    },
    hooks: {
      "setup:after": "AfterSetupEvent<T>",
    },
  },
  setup: (pack) => {
    // TODO overwrite with dump somehow?
    pack.service("registries", () => new EmptyRegistryLookup());
  },
});
