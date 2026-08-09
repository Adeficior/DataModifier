import { type RegisterRecipeParser } from "@adeficior/data-modifier-recipes";
import { ShapedParser } from "@adeficior/data-modifier-recipes";
import { AssemblyRecipeParser } from "./serializer/assembly";
import { CreateProcessingRecipeParser } from "./serializer/processing";

export function registerParsers(event: RegisterRecipeParser) {
  event.register("create:mixing", new CreateProcessingRecipeParser());
  event.register("create:pressing", new CreateProcessingRecipeParser());
  event.register("create:emptying", new CreateProcessingRecipeParser());
  event.register("create:crushing", new CreateProcessingRecipeParser());
  event.register("create:milling", new CreateProcessingRecipeParser());
  event.register("create:compacting", new CreateProcessingRecipeParser());
  event.register("create:filling", new CreateProcessingRecipeParser());
  event.register("create:cutting", new CreateProcessingRecipeParser());
  event.register("create:item_application", new CreateProcessingRecipeParser());
  event.register(
    "create:sandpaper_polishing",
    new CreateProcessingRecipeParser(),
  );
  event.register("create:deploying", new CreateProcessingRecipeParser());
  event.register("create:splashing", new CreateProcessingRecipeParser());
  event.register("create:haunting", new CreateProcessingRecipeParser());
  event.register("create:mechanical_crafting", new ShapedParser());
  event.register("create:sequenced_assembly", new AssemblyRecipeParser());
}
