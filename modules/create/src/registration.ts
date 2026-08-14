import type { RegisterRecipeSerializer } from "@adeficior/data-modifier-recipes";
import { ShapedSerializer } from "@adeficior/data-modifier-recipes";
import { AssemblyRecipeSerializer } from "./serializer/assembly";
import { CreateProcessingRecipeSerializer } from "./serializer/processing";

export function registerSerializers(event: RegisterRecipeSerializer) {
  event.register("create:mixing", new CreateProcessingRecipeSerializer());
  event.register("create:pressing", new CreateProcessingRecipeSerializer());
  event.register("create:emptying", new CreateProcessingRecipeSerializer());
  event.register("create:crushing", new CreateProcessingRecipeSerializer());
  event.register("create:milling", new CreateProcessingRecipeSerializer());
  event.register("create:compacting", new CreateProcessingRecipeSerializer());
  event.register("create:filling", new CreateProcessingRecipeSerializer());
  event.register("create:cutting", new CreateProcessingRecipeSerializer());
  event.register(
    "create:item_application",
    new CreateProcessingRecipeSerializer(),
  );
  event.register(
    "create:sandpaper_polishing",
    new CreateProcessingRecipeSerializer(),
  );
  event.register("create:deploying", new CreateProcessingRecipeSerializer());
  event.register("create:splashing", new CreateProcessingRecipeSerializer());
  event.register("create:haunting", new CreateProcessingRecipeSerializer());
  event.register("create:mechanical_crafting", new ShapedSerializer());
  event.register("create:sequenced_assembly", new AssemblyRecipeSerializer());
}
