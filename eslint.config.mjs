// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";
import eslintConfigPrettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default withNuxt({
  // Your custom configs here
  plugins: {
    prettier: prettierPlugin,
  },
  rules: {
    // ...prettierPlugin.configs.recommended.rules,
    ...eslintConfigPrettier.rules,
    ...eslintPluginPrettierRecommended.rules,
    "prettier/prettier": ["warn"],
  },
});
