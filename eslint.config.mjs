// @ts-check
import withNuxt from '.nuxt/eslint.config.mjs'
import eslintConfigPrettier from 'eslint-config-prettier'

export default withNuxt({
  rules: {
    // Désactiver les règles de style en doublon avec Prettier
    ...eslintConfigPrettier.rules,
  },
})
