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
    importPlugin.flatConfigs.recommended,
    importPlugin.flatConfigs.typescript,
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
        "import/no-unresolved": "off",
        "import/no-extraneous-dependencies": "error",
        "import/enforce-node-protocol-usage": ["error", "always"],
        "import/no-useless-path-segments": "error",
        // TODO switch to prefer-top-level-if-only-type-imports if eslint-plugin-import updates
        "import/consistent-type-specifier-style": ["warn", "prefer-top-level"],
        "import/extensions": ["error", "never", { json: "always" }],
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
      rules: {
        "import/no-internal-modules": [
          "error",
          {
            allow: [`${tsconfigRootDir}/src/**`],
          },
        ],
      },
    },
  ]);
}
