import { name } from "../package.json";
import { defineModule } from "./modules/define";
import { EmptyRegistryLookup } from "./registry/empty";
import { type RegistryLookup } from "./registry/lookup";

export default defineModule<{
  services: {
    registries: RegistryLookup;
  };
}>({
  importModule: name,
  types: {
    services: {
      registries: "RegistryLookup",
    },
  },
  setup: (pack) => {
    // TODO overwrite with dump somehow?
    pack.service("registries", () => new EmptyRegistryLookup());
  },
});
