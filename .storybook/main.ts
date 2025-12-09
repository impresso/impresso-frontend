import type { StorybookConfig } from '@storybook/vue3-vite'
import { resolve } from 'node:path'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

  addons: ['@storybook/addon-links', '@chromatic-com/storybook', '@storybook/addon-docs'],

  framework: {
    name: '@storybook/vue3-vite',
    options: {
      docgen: 'vue-component-meta'
    }
  },

  env: config => ({
    ...config,
    // use rest transport in storybook to make mocking easier
    VITE_API_TRANSPORT: 'rest',
    VITE_MIDDLELAYER_API_BASE_URL: '/api'
  }),

  async viteFinal(config, { configType }) {
    if (!config.resolve) {
      config.resolve = {}
    }
    if (!config.resolve.alias) {
      config.resolve.alias = {}
    }

    // Add the alias for the .storybook folder
    // This tells Vite/Storybook that when it sees a path starting with
    // ".storybook/", it should look in the actual .storybook directory
    // relative to the project root (process.cwd()).
    // Note: The key should likely be the exact path you're trying to resolve if it's
    // an absolute path like your example, or an alias like '@' if you use those.
    // For your specific import ".storybook/mockData/specialMembership",
    // it's best to configure the path directly or use a base alias.

    // Assuming your story file is in src/ and the .storybook folder is at the project root:
    // This setup allows imports like `import mockData from '.storybook/mockData/...'`
    config.resolve.alias = {
      ...config.resolve.alias,
      '.storybook': resolve(process.cwd(), '.storybook')
    }

    return config
  }
}
export default config
