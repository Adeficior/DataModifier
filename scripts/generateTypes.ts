import { packFormatOf } from "../core/dist/common/packFormat";
import recipes from "../modules/recipes/src";
import tags from "../modules/tags/src";
import { generateTypes } from "../packages/codegen/src";

export async function generateModuleTypes(dir: string) {
  await generateTypes(dir, [tags, recipes], {
    packFormat: packFormatOf("1.21.1"),
  });
}
