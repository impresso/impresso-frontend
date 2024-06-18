import type { Preview } from '@storybook/vue3'
import { setup } from '@storybook/vue3'
import { initialize, mswLoader } from 'msw-storybook-addon'
import globalComponents from '../src/plugins/globalComponents'
import { newI18n } from '../src/plugins/i18n'
import pinia from '../src/plugins/pinia'
import { handlers as mswHandlers } from './mswHandlers'

import 'dripicons/webfont/webfont.css'
import 'impresso-theme/dist/css/bootpresso.css'
import '../src/styles/style.css'
import '../src/assets/legacy/bootstrap-vue.css'

/*
 * Initializes MSW
 * See https://github.com/mswjs/msw-storybook-addon#configuring-msw
 * to learn how to customize it
 */
const worker = initialize({
  onUnhandledRequest: ({ url, method }) => {
    const pathname = new URL(url).pathname
    if (pathname.startsWith('/api/')) {
      throw new Error(`Please add a request handler for ${method} ${pathname}`)
    }
  }
})

// it won't load the handlers without this call. May be a bug
worker.use(...[])

setup((app) => {
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
    },
    msw: {
      handlers: mswHandlers
    }
  },
  loaders: [mswLoader]
}

export default preview
