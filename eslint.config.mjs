// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';
import eslintConfigPrettier from 'eslint-config-prettier';

export default withNuxt({
  rules: {
    // Désactiver les règles de style en doublon avec Prettier
    ...eslintConfigPrettier.rules,
    // Anti-TDZ (« Cannot access 'x' before initialization ») : interdit d'utiliser une
    // variable/computed avant sa déclaration. Attrape le cas où un getter de useSeoMeta/
    // useHead référence un computed déclaré plus bas → 500 à l'hydratation client.
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': [
      'warn',
      { variables: true, functions: false, classes: false, ignoreTypeReferences: true },
    ],
  },
});
