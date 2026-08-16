import type { RegisterRecipeSerializer } from "@adeficior/data-modifier-recipes";
import { ShapedSerializer } from "@adeficior/data-modifier-recipes";
import { AssemblyRecipeSerializer } from "./serializer/assembly";
import { ProcessingRecipeSerializer } from "./serializer/processing";

export function registerSerializers(event: RegisterRecipeSerializer) {
  event.register("create:mixing", new ProcessingRecipeSerializer());
  event.register("create:pressing", new ProcessingRecipeSerializer());
  event.register("create:emptying", new ProcessingRecipeSerializer());
  event.register("create:crushing", new ProcessingRecipeSerializer());
  event.register("create:milling", new ProcessingRecipeSerializer());
  event.register("create:compacting", new ProcessingRecipeSerializer());
  event.register("create:filling", new ProcessingRecipeSerializer());
  event.register("create:cutting", new ProcessingRecipeSerializer());
  event.register("create:item_application", new ProcessingRecipeSerializer());
  event.register(
    "create:sandpaper_polishing",
    new ProcessingRecipeSerializer(),
  );
  event.register("create:deploying", new ProcessingRecipeSerializer());
  event.register("create:splashing", new ProcessingRecipeSerializer());
  event.register("create:haunting", new ProcessingRecipeSerializer());
  event.register("create:mechanical_crafting", new ShapedSerializer());
  event.register("create:sequenced_assembly", new AssemblyRecipeSerializer());
}
