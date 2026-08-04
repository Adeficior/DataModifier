//@ts-check
import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import { defineConfig } from "eslint/config";
import ts from "typescript-eslint";
/**
 * @param {string} tsconfigRootDir
 * @returns {import("eslint").Linter.Config[]}
 */
export function eslintConfig(tsconfigRootDir) {
  return defineConfig([
    js.configs.recommended,
    ts.configs.recommended,
    {
      rules: {
        "no-console": "error",
        "@typescript-eslint/consistent-type-imports": "error",
        "@typescript-eslint/consistent-type-exports": "error",
        "@typescript-eslint/no-unused-vars": [
          "error",
          {
            argsIgnorePattern: "^_",
          },
        ],
      },
      languageOptions: {
        parserOptions: {
          tsconfigRootDir: tsconfigRootDir,
          projectService: true,
        },
      },
    },
    {
      files: ["src/**/*.ts"],
      extends: [
        importPlugin.flatConfigs.recommended,
        importPlugin.flatConfigs.typescript,
      ],
      rules: {
        "import/no-relative-parent-imports": "warn",
      },
    },
  ]);
}
