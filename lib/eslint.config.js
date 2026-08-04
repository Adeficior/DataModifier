//@ts-check
import { eslintConfig } from "@adeficior/configs/eslint";
import { defineConfig } from "eslint/config";

export default defineConfig(eslintConfig(import.meta.dirname));
