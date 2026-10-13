import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import storybook from 'eslint-plugin-storybook'

export default defineConfigWithVueTs(
  // Replaces .eslintignore
  {
    ignores: ['**/dist/**', '**/coverage/**', '**/storybook-static/**', '**/models/generated/**']
  },

  js.configs.recommended, // eslint:recommended
  pluginVue.configs['flat/essential'], // plugin:vue/vue3-essential
  vueTsConfigs.recommended, // @vue/eslint-config-typescript
  ...storybook.configs['flat/recommended'], // plugin:storybook/recommended
  skipFormatting, // keep last among the shared configs

  {
    name: 'app/custom-rules',
    files: ['**/*.{ts,mts,tsx,vue}'],
    languageOptions: {
      ecmaVersion: 'latest' // from your old parserOptions
    },
    rules: {
      'vue/multi-word-component-names': 'warn',
      'vue/no-v-text-v-html-on-component': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn', // or 'off'
      'no-useless-escape': 'warn', // or 'off'
      '@typescript-eslint/no-unused-vars': 'warn', // set it back to 'on' after cleaning up the codebase
      'vue/block-lang': 'warn'
    }
  }
)
