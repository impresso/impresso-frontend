import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions'
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {}
  },
  env: (config) => ({
    ...config,
    // use rest transport in storybook to make mocking easier
    VITE_API_TRANSPORT: 'rest',
    VITE_MIDDLELAYER_API_BASE_URL: '/api'
  })
}
export default config
