import type { IdInput } from "@adeficior/data-modifier-core";
import type { DataProvider } from "@adeficior/testing";

export function* recipesIds(): DataProvider<[IdInput]> {
  yield ["compacting", "create:compacting/granite_from_flint"];
  yield ["crushing", "create:crushing/deepslate_gold_ore"];
  yield ["cutting", "create:cutting/andesite_alloy"];
  yield ["deploying", "create:deploying/cogwheel"];
  yield ["emptying", "create:emptying/honey_bottle"];
  yield ["filling", "create:filling/blaze_cake"];
  yield ["haunting", "create:haunting/nether_brick"];
  yield ["item application", "create:item_application/railway_casing"];
  yield ["mechanical crafting", "create:mechanical_crafting/crushing_wheel"];
  yield ["milling", "create:milling/charcoal"];
  yield ["mixing", "create:mixing/tea"];
  yield ["pressing", "create:pressing/path"];
  yield ["sandpaper polishing", "create:sandpaper_polishing/rose_quartz"];
  yield ["sequenced assembly", "create:sequenced_assembly/precision_mechanism"];
  yield ["splashing", "create:splashing/soul_sand"];
}
