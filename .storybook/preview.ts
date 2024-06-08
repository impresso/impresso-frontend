import type { Preview } from '@storybook/vue3'
import { setup } from "@storybook/vue3"
import { newI18n } from '../src/plugins/i18n'
import pinia from '../src/plugins/pinia'
import globalComponents from '../src/plugins/globalComponents'

setup(app => {
  app.use(pinia)
  app.use(newI18n())
  app.use(globalComponents)
})

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  }
}

export default preview
